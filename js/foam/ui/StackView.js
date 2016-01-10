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

/*
 TODO:
   Use MementoMgr.
   Browser history support.
*/
CLASS({
  package: 'foam.ui',
  name: 'StackView',
  extends: 'foam.ui.View',

  requires: [
    'foam.ui.layout.ViewSlider',
    'foam.ui.layout.OverlaySlider',
    'foam.ui.layout.FloatingView'
  ],

  traits: ['foam.ui.layout.PositionedDOMViewTrait'],

  properties: [
    {
      type: 'Array',
      name: 'stack',
      lazyFactory: function() { return []; }
    },
    {
      name: 'redo',
      lazyFactory: function() { return []; }
    },
    {
      name: 'slider',
      lazyFactory: function() { return this.ViewSlider.create(); }
    },
    {
      name: 'overlaySlider',
      factory: function() { return this.OverlaySlider.create(); },
      postSet: function(old, v) {
        if ( old ) old.unsubscribe(['click'], this.overlayBack);
        v.subscribe(['click'], this.overlayBack);
      }
    },
    { type: 'Boolean', name: 'sliderOpen', defaultValue: false },
    'slideLatch'
  ],

  constants: {
    EASE_ACCELERATION: 0.9
  },

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamicFn(function() { self.width; self.height; self.sliderOpen }, this.layout);
    },
    setPreview: function(){ console.warn('Preview removed from stack view, do it yourself.'); },
    pushView: function(view, opt_label, opt_back, opt_transition) {
      if ( ! opt_back ) {
        var prev = this.stack[this.stack.length - 1];
        if ( prev ) prev.destroy();
        this.redo.length = 0;
        this.propertyChange('redo', this.redo, this.redo);
      }

      if ( ! view.model_.Z ) view = this.FloatingView.create({ view: view });

      this.stack.push(view);
      this.propertyChange('stack', this.stack, this.stack);

      if ( opt_transition === 'none' ) {
        this.slider.setView(view);
        return;
      }

      window.setTimeout(function() {
        this.slider.reverse = opt_transition === 'fromLeft';
        this.slider.slideView(view, undefined, undefined, 100);
      }.bind(this), 100)
    },
    setTopView: function(view) {
      if ( this.stack.length > 0 ) {
        this.stack[this.stack.length - 1].destroy();
      }
      this.stack = [];
      this.pushView(view, undefined, undefined, 'none');
    },
    slideView: function(view, opt_label, opt_side, opt_delay) {
      if ( ! view.model_.Z ) view = this.FloatingView.create({ view: view });

      if ( this.slideLatch ) {
        this.slideLatch();
        this.slideLatch = '';
      }

      if ( ! Number.isFinite(opt_delay) ) opt_delay = 100;

      this.sliderOpen = true;
      this.overlaySlider.view = view;

      var self = this;
      window.setTimeout(function() {
        self.slideLatch = Movement.animate(
          300,
          function() { self.overlaySlider.slideAmount = 1 },
          Movement.easeOut(self.EASE_ACCELERATION),
          function() {
            self.slideLatch = '';
          })();
      }, opt_delay);
    }
  },
  listeners: [
    {
      name: 'layout',
      code: function() {
        this.overlaySlider.x = 0;
        this.overlaySlider.y = 0;
        this.overlaySlider.z = this.sliderOpen ? 1 : 0;
        this.overlaySlider.width = this.width;
        this.overlaySlider.height = this.height;

        this.slider.x = 0;
        this.slider.y = 0;
        this.slider.width = this.width;
        this.slider.height = this.height;
      }
    },
    {
      name: 'overlayBack',
      code: function() {
        if ( this.sliderOpen ) this.back();
      }
    }
  ],
  templates: [
    function toInnerHTML() {/* %%overlaySlider %%slider */}
  ],
  actions: [
    {
      name:  'back',
      label: '<',
      help:  'Go to previous view',

      isEnabled: function() { return this.stack.length > 1 || this.sliderOpen; },
      code: function() {
        if ( this.sliderOpen ) {
          if ( this.slideLatch ) {
            this.slideLatch();
            this.slideLatch = '';
          }

          var self = this;
          this.sliderOpen = false;
          this.slideLatch = Movement.animate(
            300,
            function() { self.overlaySlider.slideAmount = 0; },
            Movement.easeIn(this.EASE_ACCELERATION),
            function() {
              self.slideLatch = '';
              self.overlaySlider.view = '';
            })();
        } else {
          var v = this.stack.pop();
          v.destroy();
          this.redo.push(v);
          this.pushView(this.stack.pop(), undefined, true, 'fromLeft');
          this.propertyChange('stack', this.stack, this.stack);
        }
      }
    },
    {
      name:  'forth',
      label: '>',
      help:  'Undo the previous back.',
      isEnabled: function() { return this.redo.length > 0; },
      code: function() {
        this.pushView(this.redo.pop());
        this.propertyChange('stack', this.redo, this.redo);
      }
    }
  ]
});
