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
  name: 'MultiView',
  package: 'foam.navigator.views',
  extends: 'foam.ui.View',

  requires: [
    'foam.ui.DetailView'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old.model_ === nu.model_ ) return;
        if ( old ) Events.unlink(this.data$, this.delegate.data$);
        this.delegate = this.getDelegate();
      }
    },
    {
      name: 'viewFactory',
      type: 'ViewFactory',
      defaultValueFn: function() { return this.DetailView; }
    },
    {
      name: 'delegate',
      factory: function() {
        return this.getDelegate();
      }
    }
  ],

  methods: [
    {
      name: 'toHTML',
      code: function() {
        if ( ! this.delegate ) return '';
        return this.delegate.toHTML();
      }
    },
    {
      name: 'initHTML',
      code: function() { this.delegate && this.delegate.initHTML(); }
    },
    {
      name: 'destroy',
      code: function() { this.delegate && this.delegate.destroy(); }
    },
    {
      name: 'getDelegate',
      code: function() {
        if ( ! this.data ) return '';
        return this.viewFactory({
          model: this.data.model_,
          data$: this.data$
        }, this.Y);
      }
    }
  ]
});
