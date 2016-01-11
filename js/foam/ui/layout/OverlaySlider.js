/*
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
   "package": "foam.ui.layout",
   "name": "OverlaySlider",
   extends: "foam.ui.View",

   "traits": [
      "foam.ui.layout.PositionedDOMViewTrait"
   ],
   "properties": [
      {
         model_: "Property",
         "name": "view",
         "postSet": function (old, v) {
        old && old.destroy();
        if ( this.$ ) { this.updateHTML(); }
      }
      },
      {
         type: 'Float',
         "name": "slideAmount",
         "defaultValue": 0
      }
   ],
   "methods": [
      {
         model_: "Method",
         "name": "init",
         "code": function () {
      this.SUPER();
      var self = this;
      this.X.dynamicFn(function() { self.width; self.height; self.slideAmount; }, this.layout);
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "updateHTML",
         "code": function () {
      this.children = [];
      this.layout();
      this.SUPER();
    },
         "args": []
      }
   ],
   "listeners": [
      {
         model_: "Method",
         "name": "onClick",
         "code": function () { this.publish(['click']); },
         "args": []
      },
      {
         model_: "Method",
         "name": "layout",
         "code": function () {
        var width = Math.min(this.view.preferredWidth, this.width);

        if ( this.$ ) {
          var overlay = this.X.$(this.id + '-slider');
          overlay.style.webkitTransform = 'translate3d(0,0,0px)';
          overlay.style.width = this.width + 'px';
          overlay.style.height = this.height + 'px';
          overlay.style.opacity = this.slideAmount * 0.4;
        }

        if ( this.view ) {
          this.view.width = width;
          this.view.height = this.height;
          this.view.x = -((1 - this.slideAmount) * width);
          this.view.y = 0;
          this.view.z = 1;
        }
      },
         "args": []
      }
   ],
   "templates": [
      {
         model_: "Template",
         "name": "toInnerHTML",
         "args": [],
         "template": "\u000a      <% this.on('click', this.onClick, this.id + '-slider'); %>\u000a      <div id=\"<%= this.id %>-slider\" class=\"overlay-slider\"></div> %%view "
      },
      {
         model_: "Template",
         "name": "CSS",
         "args": [],
         "template": "\u000a      .overlay-slider {\u000a        position: absolute;\u000a        background: black;\u000a      }\u000a\u000a      * {\u000a        transform-style: preserve-3d;\u000a        -webkit-transform-style: preserve-3d;\u000a      }\u000a    "
      }
   ]
});
