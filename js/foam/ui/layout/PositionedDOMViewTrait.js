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
   package: "foam.ui.layout",
   name: "PositionedDOMViewTrait",
   traits: [ "foam.ui.layout.PositionedViewTrait" ],
   properties: [
      {
        name: "tagName",
        defaultValue: "div"
      }
   ],
   methods: [
     function toHTML() {
       return '<' + this.tagName + ' id="' + this.id + '"' + this.layoutStyle() + this.cssClassAttr() + '>' +
         this.toInnerHTML() +
         '</div>';
     },
     function layoutStyle() {
       return ' style="' +
         '-webkit-transform:' + this.transform() +
         ';width:' + this.styleWidth() +
         ';height:' + this.styleHeight() +
         ';position:absolute;"';
     },
     function initHTML() {
       this.SUPER();
       var self = this;
       this.X.dynamicFn(
         function() { self.x; self.y; self.z; },
         this.position);
       this.X.dynamicFn(
         function() { self.width; self.height; },
         this.resize);
       this.$.style.position = 'absolute';
       this.position();
       this.resize();
     },
     function transform() {
       return 'translate3d(' +
         this.x + 'px,' +
         this.y + 'px,' +
         this.z + 'px)';
     },
     function styleWidth() { return this.width + 'px'; },
     function styleHeight() { return this.height + 'px'; }
   ],
   listeners: [
     {
       name: "position",
       code: function () {
         if ( ! this.$ ) return;
         this.$.style.webkitTransform = this.transform();
       }
     },
     {
       name: "resize",
       code: function () {
         if ( ! this.$ ) return;
         this.$.style.width  = this.styleWidth();
         this.$.style.height = this.styleHeight();
       }
     }
   ]
});
