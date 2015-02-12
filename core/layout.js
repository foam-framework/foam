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
  name: 'OverlaySlider',
  package: 'foam.ui.layout',
  traits: ['foam.ui.layout.PositionedDOMViewTrait'],
  extendsModel: 'View',
  properties: [
    {
      name: 'view',
      postSet: function(old, v) {
        old && old.destroy();
        if ( this.$ ) { this.updateHTML(); }
      }
    },
    { model_: 'FloatProperty', name: 'slideAmount', defaultValue: 0 }
  ],
  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamic(function() { self.width; self.height; self.slideAmount; }, this.layout);
    },
    updateHTML: function() {
      this.children = [];
      this.layout();
      this.SUPER();
    }
  },
  templates: [
    function toInnerHTML() {/*
      <% this.on('click', this.onClick, this.id + '-slider'); %>
      <div id="<%= this.id %>-slider" class="overlay-slider"></div> %%view */},
    function CSS() {/*
      .overlay-slider {
        position: absolute;
        background: black;
      }

      * {
        transform-style: preserve-3d;
        -webkit-transform-style: preserve-3d;
      }
    */}
  ],
  listeners: [
    {
      name: 'onClick',
      code: function() { this.publish(['click']); }
    },
    {
      name: 'layout',
      code: function() {
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
      }
    }
  ]
});
