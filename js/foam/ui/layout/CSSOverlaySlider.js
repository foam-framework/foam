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
  "name": "CSSOverlaySlider",
  extends: "foam.ui.View",
  requires: [
    'foam.ui.layout.FloatingView'
  ],
  "traits": [
    "foam.ui.layout.PositionedDOMViewTrait"
  ],
  "properties": [
    {
      name: 'view'
    },
    {
      type: 'Boolean',
      name: 'isOpen',
      defaultValue: false
    },
    {
      type: 'Boolean',
      name: 'animating',
      defaultValue: false
    },
    {
      model_: 'foam.core.types.DOMElementProperty',
      name: 'overlaySlider'
    },
    {
      model_: 'foam.core.types.DOMElementProperty',
      name: 'viewContainer'
    }
  ],
  "methods": {
    init: function(args) {
        this.SUPER(args);
        var self = this;
        this.X.dynamicFn(function() { self.width; self.height; }, this.layout);
    },
    open: function(view) {
      if ( ! view.model_.Z ) view = this.FloatingView.create({ view: view });
      
      if ( this.view && this.view.$ ) {
        this.view.$.remove();
        this.view.destroy();
      }

      this.view = view;
      this.isOpen = false;
      this.animating = false;

      this.layout();

      this.viewContainer.innerHTML = view.toHTML();
      view.initHTML();

      this.animating = true;
      this.isOpen = true;

      this.layout();
    },
    close: function(rightNow) {
      this.isOpen = false;
      this.animating = ! rightNow;
      this.layout();
    }
  },
  "listeners": [
    {
      "name": "onClick",
      "code": function () { this.publish(['click']); }
    },
    {
      "name": "layout",
      "code": function () {
        var width = Math.min(this.view.preferredWidth || this.width, this.width);

        if ( this.view ) {
          this.view.width = width;
          this.view.height = this.height;
          this.view.x = 0;
          this.view.y = 0;
          this.view.z = 1;
        }

        if ( this.$ ) {
          var overlay = this.overlaySlider;
          overlay.style.webkitTransition = ! this.animating ? '' :
            ('opacity 300ms ' + (this.isOpen ? 'cubic-bezier(0.4, 0.0, 0.2, 1)' : 'cubic-bezier(0.4, 0.0, 1, 1)'));

          overlay.style.webkitTransform = 'translate3d(0px,0px,0px)';
          overlay.style.width = this.width + 'px';
          overlay.style.height = this.height + 'px';

          overlay.style.opacity = this.isOpen ? 0.4 : 0;

          var container = this.viewContainer;
          container.style.webkitTransition = ! this.animating ? '' :
            ('-webkit-transform 300ms ' + (this.isOpen ? 'cubic-bezier(0.4, 0.0, 0.2, 1)' : 'cubic-bezier(0.4, 0.0, 1, 1)'));

          container.style.webkitTransform = 'translate3d(' + (this.isOpen ? 0 : -width) + 'px,0px,0px)';
          container.style.width = width + 'px';
          container.style.height = this.styleHeight();

        }

      }
    }
  ],
  "templates": [
    function toInnerHTML() {/*<div id="<%=
  this.overlaySlider = this.on('click', this.onClick)
%>" class="overlay-slider"></div>
<div id="<%=
  this.viewContainer = this.nextID()
%>" class="overlay-container"></div>
  */},
    function CSS(){/*
.overlay-slider {
  position: absolute;
  background: black;
}

.overlay-conatiner {
  position: absolute;
}

* {
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}
*/}
  ]
});
