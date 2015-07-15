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
  package: 'foam.graphics.webgl',
  name: 'PerformanceScaler',

  imports: ['performance$'],

  properties: [
    {
      model_: 'IntProperty',
      name: 'performance',
      postSet: function(old,nu) {
        if ( nu < 95 && this.activeItems_.length > 0 ) {
          var item = this.activeItems_.pop();
          this.disabledItems_.push();
          this.removeFunction.call(null, item);
        }
        if ( nu > 105 && this.disabledItems_.length > 0 ) {
          var item = this.disabledItems_.pop();
          this.activeItems_.push();
          this.addFunction.call(null, item);
        }
      }
    },
    {
      name: 'items',
      postSet: function() {
        //TODO: remove old
        this.disabledItems_ = this.items.slice();
      }
    },
    {
      name: 'activeItems_',
      factory: function() { return []; }
    },
    {
      name: 'disabledItems_',
    },
    {
      name: 'addFunction'
    },
    {
      name: 'removeFunction'
    }
  ]

});

