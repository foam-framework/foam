/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  package: 'foam.persistence',
  name: 'DataUpdateSinker',

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old ) old.removeListener(this.onUpdate_);
        if ( nu ) nu.addListener(this.onUpdate_);
      }
    },
    {
      type: 'Boolean',
      name: 'feedback_',
      defaultValue: false
    },
    {
      name: 'sink'
    },
    {
      name: 'error'
    }
  ],

  listeners: [
    {
      name: 'onUpdate_',
      code: function() {
        if ( ! this.feedback_ ) this.onUpdate();
      }
    },
    {
      name: 'onUpdate',
      isMerged: 100,
      code: function() {
        this.sink.put(this.data, {
          put: function(obj) {
            this.error = '';
            this.feedback_ = true;
            this.data.copyFrom(obj);
            this.feedback_ = false;
          }.bind(this),
          error: function(e) {
            this.error = e;
          }.bind(this)
        });
      }
    }
  ]
});
