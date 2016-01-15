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
  name: 'Window',
  package: 'foam.ui.layout',
  extends: 'foam.ui.SimpleView',
  imports: [
    'dynamicFn',
    'window'
  ],
  properties: [
    { type: 'Int', name: 'width' },
    { type: 'Int', name: 'height' },
    {
      name: 'window',
      postSet: function(o, w) {
        o && o.removeEventListener('resize', this.onResize);
        w.addEventListener('resize', this.onResize);
        this.onResize();

        // Workaround for android web-apps which for some reason
        // report the wrong size the first time we synchronously resize.
        this.window.setTimeout(this.onResize, 0);
      },
      hidden: true
    },
    {
      name: 'data',
      postSet: function(_, v) {
        var self = this;
        v.x = 0;
        v.y = 0;

        this.dynamicFn(
          function() { self.width; self.height; },
          function() {
            v.width  = self.width;
            v.height = self.height;
          });
        if ( this.rendered ) this.updateHTML();
      }
    },
    {
      type: 'Boolean',
      name: 'rendered',
      defaultValue: false
    }
  ],
  methods: {
    init: function(args) {
      this.SUPER(args);
      var self = this;
      this.dynamicFn(function() { self.height; },
                   function() {
                     self.window.document.body.style.height = self.height + 'px';
                   });
    },
    updateHTML: function() {
      this.window.document.body.innerHTML = this.toHTML();
      this.initHTML();
    },
    toHTML: function() {
      this.rendered = true;
      this.children = [this.data];
      return this.data && this.data.toHTML();
    }
  },
  templates: [
    function CSS() {/*
      .body {
        padding: 0px;
        margin: 0px;
        border: 0px
      }
    */}
  ],
  listeners: [
    {
      name: 'onResize',
      code: function() {
        this.height = this.window.innerHeight;
        this.width  = this.window.innerWidth;
      }
    }
  ]
});
