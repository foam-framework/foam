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
   "model_": "Model",
   "package": "foam.ui.layout",
   "name": "PositionedDOMViewTrait",
   "traits": [
      "foam.ui.layout.PositionedViewTrait"
   ],
   "properties": [
      {
         "model_": "Property",
         "name": "tagName",
         "defaultValue": "div"
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
         "model_": "Method",
         "name": "toHTML",
         "code": function () {
      return '<' + this.tagName + ' id="' + this.id + '"' + this.layoutStyle() + this.cssClassAttr() + '>' +
        this.toInnerHTML() +
        '</div>';
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "layoutStyle",
         "code": function () {
      return ' style="' +
        '-webkit-transform:' + this.transform() +
        ';width:' + this.styleWidth() +
        ';height:' + this.styleHeight() +
        ';position:absolute;"';
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "initHTML",
         "code": function () {
      this.SUPER();
      var self = this;
      this.X.dynamic(
        function() { self.x; self.y; self.z; },
        this.position);
      this.X.dynamic(
        function() { self.width; self.height; },
        this.resize);
      this.$.style.position = 'absolute';
      this.position();
      this.resize();
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "transform",
         "code": function () {
      return 'translate3d(' +
        this.x + 'px,' +
        this.y + 'px,' +
        this.z + 'px)';
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "styleWidth",
         "code": function () { return this.width + 'px'; },
         "args": []
      },
      {
         "model_": "Method",
         "name": "styleHeight",
         "code": function () { return this.height + 'px'; },
         "args": []
      }
   ],
   "listeners": [
      {
         "model_": "Method",
         "name": "position",
         "code": function () {
        if ( ! this.$ ) return;
        this.$.style.webkitTransform = this.transform();
      },
         "args": []
      },
      {
         "model_": "Method",
         "name": "resize",
         "code": function () {
        if ( ! this.$ ) return;
        this.$.style.width  = this.styleWidth();
        this.$.style.height = this.styleHeight();
      },
         "args": []
      }
   ],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
