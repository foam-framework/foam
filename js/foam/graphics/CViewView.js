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
  package: 'foam.graphics',
  name: 'CViewView',

  extends: 'foam.graphics.AbstractCViewView',

  help: 'DOM wrapper for a CView, auto adjusts it size to fit the given cview.',

  documentation: function() {/*
      DOM wrapper for a $$DOC{ref:'foam.graphics.CView'}, that auto adjusts it size to fit
      he given view.
    */},
  properties: [
    {
      name: 'cview',
      postSet: function(_, cview) {
        cview.view = this;
        this.X.dynamicFn(function() {
          // ActionButtonCView's hide buttons by sizing to 0, so we honour that,
          // but otherwise, we only increase the size of the canvas as needed, not shrink.
          var w = cview.x + cview.width;
          var h = cview.y + cview.height;
          this.width  = w ? Math.max(this.width, w) : 0;
          this.height = h ? Math.max(this.height, h): 0;
        }.bind(this));
      }
    }
  ],

  methods: {
    shouldDestroy: function() { return false; },

    destroy: function() {
      this.SUPER();
      this.cview && this.cview.destroy();
    }
  }
});
