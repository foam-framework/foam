/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  package: 'foam.ui',
  name: 'CSSImageBooleanView',

  extends: 'foam.ui.SimpleView',

  properties: [
    'data',
  ],

  methods: {
    initHTML: function() {
      if ( ! this.$ ) return;
      this.data$.addListener(this.update);
      this.$.addEventListener('click', this.onClick);
    },
    toHTML: function() {
      return '<span id="' + this.id + '" class="' + this.className + ' ' + (this.data ? 'true' : '') + '">&nbsp;&nbsp;&nbsp;</span>';
    }
  },

  listeners: [
    {
      name: 'update',
      code: function() {
        if ( ! this.$ ) return;
        DOM.setClass(this.$, 'true', this.data);
      }
    },
    {
      name: 'onClick',
      code: function(e) {
        e.stopPropagation();
        this.data = ! this.data;
        this.update();
      }
    }
  ]
});
