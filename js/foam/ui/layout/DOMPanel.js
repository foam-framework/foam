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
  name: 'DOMPanel',
  package: 'foam.ui.layout',
  extends: 'foam.ui.SimpleView',
  imports: [
    'window'
  ],
  properties: [
    { type: 'Int', name: 'width' },
    { type: 'Int', name: 'height' },
    { name: 'tagName', defaultValue: 'div' },
    { name: 'data', postSet: function() {
      this.updateHTML();
    } }
  ],
  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamicFn(function() { self.width; self.height; },
                     this.layout);
    },
    initHTML: function() {
      this.SUPER();
      this.window.addEventListener('resize', this.onResize);
      this.width = this.$.clientWidth;
      this.height = this.$.clientHeight;
      this.onResize();
    },
    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      if ( this.window ) this.window.removeEventListener('resize', this.onResize);
    }
  },
  templates: [
    function toInnerHTML() {/*<%= this.data %>*/},
  ],
  listeners: [
    {
      name: 'layout',
      isFramed: true,
      code: function() {
        if ( ! this.data ) return;
        this.data.x = 0;
        this.data.y = 0;
        this.data.z = 0;
        this.data.width = this.width;
        this.data.height = this.height;
      }
    },
    {
      name: 'onResize',
      isMerged: 100,
      code: function() {
        if ( ! this.$ ) return;
        this.width  = this.$.clientWidth;
        this.height = this.$.clientHeight;
      }
    }
  ]
});
