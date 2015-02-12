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
  name: 'ViewSlider',
  package: 'foam.ui.layout',
  traits: ['foam.ui.layout.PositionedDOMViewTrait'],
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
      this.X.dynamic(
        function() {
          self.width;
          self.height;
          self.direction;
          self.slideAmount;
          self.reverse;
        },
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
        this.view.destroy();
        this.$.removeChild(this.view.$);
      }
      this.view = view;
      this.layout();
      this.$.insertAdjacentHTML('beforeend', view.toHTML());
      view.initHTML();
    },
    slideView: function(view, opt_interp, opt_time, opt_delay) {
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

      var fn = function() { self.slideAmount = 1.0; };

      window.setTimeout(function() {
        self.latch = this.X.animate(opt_time, fn, opt_interp, function() {
          if ( self.view ) {
            self.$.removeChild(self.view.$);
            self.view.destroy();
          }
          self.view = view;
          self.incomingView = '';
          self.latch = '';
          self.slideAmount = 0;
        })();
      }, opt_delay || 0)
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
