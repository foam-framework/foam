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
  package: 'foam.chromeapp.ui',

  name: 'ZoomView',
  extends: 'foam.ui.View',

  imports: [ 'window', 'document' ],

  documentation: 'Add zoom in/out support to ChromeApps.',

  properties: [
    {
      name: 'zoom',
      defaultValue: 1,
      postSet: function(_, z) { this.document.body.style.zoom = z; }
    }
  ],
  methods: {
    resizeBy: function(dx, dy) {
      this.window.resizeBy(dx, dy);

      // generate a resize event in case the window is already maximized
      // so that components that relayout on resize will still relayout
      var event = this.document.createEvent('Event');
      event.initEvent('resize', true, true);
      this.document.dispatchEvent(event);
    }
  },
  actions: [
    {
      name: 'zoomIn',
      keyboardShortcuts: [ 'ctrl-shift-187', 'ctrl-187' ],
      code: function() {
        this.resizeBy(this.document.body.clientWidth/10, this.document.body.clientHeight/10);
        this.zoom *= 1.1;
      }
    },
    {
      name: 'zoomOut',
      keyboardShortcuts: [ 'ctrl-shift-189', 'ctrl-189' ],
      code: function() {
        this.resizeBy(-this.document.body.clientWidth/10, -this.document.body.clientHeight/10);
        this.zoom /= 1.1;
      }
    },
    {
      name: 'zoomReset',
      code: function() { this.zoom = 1.0; }
    }
  ]
});
