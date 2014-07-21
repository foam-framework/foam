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

MODEL({
  name: 'PositionedViewTrait',
  properties: [
    { model_: 'IntProperty', name: 'x',      units: 'px', defaultValue: 0 },
    { model_: 'IntProperty', name: 'y',      units: 'px', defaultValue: 0 },
    { model_: 'IntProperty', name: 'z',      units: 'px', defaultValue: 0 },
    { model_: 'IntProperty', name: 'width',  units: 'px', defaultValue: 100 },
    { model_: 'IntProperty', name: 'height', units: 'px', defaultValue: 100 }
  ]
});


MODEL({
  name: 'PositionedDOMViewTrait',
  traits: ['PositionedViewTrait'],
  methods: {
    initHTML: function() {
      this.SUPER();
      var self = this;
      Events.dynamic(function() { self.x; self.y; self.z; },
                     this.position);
      Events.dynamic(function() { self.width; self.height; },
                     this.resize);
      this.$.style.position = 'absolute';
      this.position();
      this.resize();
    }
  },
  listeners: [
    {
      name: 'position',
      code: function() {
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        this.$.style.transform = 'translate3d(' +
          this.x + 'px,' +
          this.y + 'px,' +
          this.z + 'px)';
      }
    },
    {
      name: 'resize',
      code: function() {
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        this.$.style.width  = this.width + this.model_.WIDTH.units;
        this.$.style.height = this.height + this.model_.HEIGHT.units;
      }
    }
  ]
});


MODEL({
  name: 'Window',
  properties: [
    { model_: 'IntProperty', name: 'width' },
    { model_: 'IntProperty', name: 'height' },
    {
      name: 'window',
      postSet: function(o, w) {
        o && o.removeEventListener('resize', this.onResize);
        w.addEventListener('resize', this.onResize);
        this.onResize();
      },
      hidden: true
    }
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


MODEL({
  name: 'Point',
  properties: [
    { model_: 'IntProperty', name: 'x' },
    { model_: 'IntProperty', name: 'y' }
  ]
});


MODEL({
  name: 'FloatingView',
  extendsModel: 'View',
  traits: ['PositionedDOMViewTrait'],
  properties: [
    { name: 'view' },
    { name: 'width',  defaultValue: 300 },
    { name: 'height', defaultValue: 300 }
  ],
  methods: {
    toInnerHTML: function() {
      return this.view.toHTML();
    },
    initHTML: function() {
      this.SUPER();
      this.$.style.overflow = 'scroll';
      this.view.initHTML();
    }
  }
});
