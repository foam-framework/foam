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
    { model_: 'FloatProperty', name: 'x',      units: 'px', defaultValue: 0 },
    { model_: 'FloatProperty', name: 'y',      units: 'px', defaultValue: 0 },
    { model_: 'FloatProperty', name: 'z',      units: 'px', defaultValue: 0 },
    { model_: 'IntProperty', name: 'width',  units: 'px', defaultValue: 100 },
    { model_: 'IntProperty', name: 'height', units: 'px', defaultValue: 100 },
    { model_: 'IntProperty', name: 'preferredWidth', units: 'px', defaultValue: 100 },
    { model_: 'IntProperty', name: 'preferredHeight', units: 'px', defaultValue: 100 }
  ]
});


MODEL({
  name: 'PositionedDOMViewTrait',
  traits: ['PositionedViewTrait'],
  methods: {
    toHTML: function() {
      return '<div id="' + this.id + '"' + this.layoutStyle() + this.cssClassAttr() + '>' +
        this.toInnerHTML() +
        '</div>';
    },
    layoutStyle: function() {
      return ' style="' +
        '-webkit-transform:' + this.transform() +
        ';width:' + this.styleWidth() +
        ';height:' + this.styleHeight() +
        ';position:absolute;"';
    },
    initHTML: function() {
      this.SUPER();
      var self = this;
      this.X.dynamic(function() { self.x; self.y; self.z; },
                     this.position);
      this.X.dynamic(function() { self.width; self.height; },
                     this.resize);
      this.$.style.position = 'absolute';
      this.position();
      this.resize();
    },
    transform: function() { 
      return 'translate3d(' +
        this.x + 'px,' +
        this.y + 'px,' +
        this.z + 'px)';
    },
    styleWidth: function() {
      return this.width + 'px';
    },
    styleHeight: function() {
      return this.height + 'px';
    }
  },
  listeners: [
    {
      name: 'position',
      code: function() {
        if ( ! this.$ ) return;
        this.$.style.webkitTransform = this.transform();
      }
    },
    {
      name: 'resize',
      code: function() {
        if ( ! this.$ ) return;
        this.$.style.width  = this.styleWidth();
        this.$.style.height = this.styleHeight();
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
    },
    {
      name: 'view',
      type: 'View',
      postSet: function(old, v) {
        var self = this;
        v.x = 0;
        v.y = 0;
        this.X.dynamic(function() { self.width; self.height; },
                       function() {
                         v.width = self.width;
                         v.height = self.height;
                       });
        var s = this.window.document.body.style;
        s.padding = 0;
        s.margin = 0;
        s.border = 0;
        this.window.document.body.innerHTML = v.toHTML();
        v.initHTML();
      }
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
  templates: [
    function toInnerHTML() {/* %%view */}
  ]
});

MODEL({
  name: 'ViewSlider',
  traits: ['PositionedDOMViewTrait'],
  extendsModel: 'View',
  properties: [
    {
      name: 'view'
    },
    {
      name: 'incomingView'
    },
    {
      model_: 'StringEnumProperty',
      name: 'direction',
      choices: ['horizontal', 'vertical'],
      defaultValue: 'horizontal'
    },
    {
      model_: 'BooleanProperty',
      name: 'reverse',
      defaultValue: false
    },
    {
      model_: 'FloatProperty',
      name: 'slideAmount',
      defaultValue: 0
    },
    'latch'
  ],
  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamic(function() { self.width; self.height; self.direction; self.slideAmount; self.reverse },
                     this.layout);
    },
    toHTML: function() {
      this.children = [];
      return this.SUPER();
    },
    initHTML: function() {
      this.layout();
      this.SUPER();
    },
    setView: function(view) {
      if ( this.view ) {
        this.$.removeChild(this.view.$);
      }
      this.view = view;
      this.layout();
      this.$.insertAdjacentHTML('beforeend', view.toHTML());
      view.initHTML();
    },
    slideView: function(view, opt_interp, opt_time) {
      if ( ! this.$ ) return;

      if ( this.latch ) {
        this.latch();
        this.latch = '';
      }

      this.incomingView = view;
      this.layout();
      this.$.insertAdjacentHTML('beforeend', view.toHTML());
      view.initHTML();

      opt_interp = opt_interp || Movement.easeOut(1);
      opt_time = opt_time || 300;

      var self = this;

      var fn = function() {
        self.slideAmount = 1.0;
      };

      this.latch = Movement.animate(opt_time, fn, opt_interp, function() {
        if ( self.view ) self.$.removeChild(self.view.$);
        self.view = view;
        self.incomingView = '';
        self.latch = '';
        self.slideAmount = 0;
      })();
    }
  },
  templates: [
    function toInnerHTML() {/* <%= this.view %> */}
  ],
  listeners: [
    {
      name: 'layout',
      code: function() {
        this.view.width = this.width;
        this.view.height = this.height;

        if ( this.incomingView ) {
          this.incomingView.width = this.width;
          this.incomingView.height = this.height;
        }

        var r = 1;
        if ( this.reverse ) r = -1;

        if ( this.direction === 'horizontal' ) {
          this.view.x = -(r * this.slideAmount * this.width);
          this.view.y = 0;
          if ( this.incomingView ) {
            this.incomingView.x = r * this.width - (r * this.slideAmount * this.width);
            this.incomingView.y = 0;
          }
        } else {
          this.view.x = 0;
          this.view.y = -(r * this.slideAmount * this.height);
          if ( this.incomingView ) {
            this.incomingView.x = 0;
            this.incomingView.y = r * this.height - (r * this.slideAmount * this.height);
          }
        }
      }
    }
  ]
});

MODEL({
  name: 'OverlaySlider',
  traits: ['PositionedDOMViewTrait'],
  extendsModel: 'View',
  properties: [
    {
      name: 'view',
      postSet: function(old, v) {
        if ( this.$ ) { this.updateHTML(); }
      }
    },
    { model_: 'FloatProperty', name: 'slideAmount', defaultValue: 0 }
  ],
  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamic(function() { self.z; self.width; self.height; self.slideAmount; }, this.layout);
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
      code: function() {
        this.publish(['click']);
      }
    },
    {
      name: 'layout',
      code: function() {
        this.z = (this.slideAmount === 0) ? -1 : 1;

        var width = Math.min(this.view.preferredWidth,
                             this.width);

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

