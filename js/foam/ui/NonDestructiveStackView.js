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
  name: 'NonDestructiveStackView',
  extends: 'foam.ui.View',

  requires: [
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
      type: 'Int',
      name: 'currentView',
      defaultValue: -1
    },
    {
      name: 'transitionLatch',
    },
    {
      name: 'overlaySlider',
      factory: function() { return this.OverlaySlider.create(); },
      postSet: function(old, v) {
        if ( old ) old.unsubscribe(['click'], this.overlayBack);
        v.subscribe(['click'], this.overlayBack);
      }
    },
    {
      type: 'Float',
      name: 'slideAmount',
      defaultValue: 0
    },
    { type: 'Boolean', name: 'sliderOpen', defaultValue: false },
    { model_: 'foam.core.types.DOMElementProperty', name: 'slideArea' },
    'slideLatch'
  ],

  constants: {
    EASE_ACCELERATION: 0.9
  },

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamicFn(function() { self.width; self.height; self.sliderOpen; self.slideAmount }, this.layout);
    },
    setPreview: function(){ console.warn('Preview removed from stack view, do it yourself.'); },
    pushView: function(view, opt_label, opt_back, opt_transition) {
      if ( ! view.model_.Z ) view = this.FloatingView.create({ view: view });

      this.currentView += 1;
      if ( this.stack[this.currentView] ) {
        this.stack[this.currentView].$.remove();
        this.stack[this.currentView].destroy();
      }

      this.stack[this.currentView] = view;
      this.propertyChange('stack', this.stack, this.stack);

      view.x = this.width;
      view.y = 0;
      view.width = this.width;
      view.height = this.height;
      view.z = 0;

      this.slideArea.insertAdjacentHTML('beforeend', view.toHTML());
      view.initHTML();

      if ( opt_transition == 'none' ) {
        this.slideAmount = this.currentView;
        this.layout();
      } else {
        this.doTransition(this.currentView);
      }
    },
    setTopView: function(view) {
      if ( this.slideArea ) this.slideArea.innerHTML = '';
      this.stack = [];
      this.currentView = -1;
      this.pushView(view, undefined, undefined, 'none');
    },
    doTransition: function(targetAmount) {
      if ( this.transitionLatch ) this.transitionLatch();
      this.transitionLatch = Movement.animate(
        300,
        function() {
          this.slideAmount = this.currentView;
        }.bind(this),
        Movement.easeOut(1),
        function() {
          this.transitionLatch = '';
          //              view.$ && view.$.remove();
        }.bind(this)
      )();
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
      self.slideLatch = Movement.animate(
        300,
        function() { self.overlaySlider.slideAmount = 1 },
        Movement.easeOut(self.EASE_ACCELERATION),
        function() {
          self.slideLatch = '';
        })();
    }
  },
  listeners: [
    {
      name: 'fixLayout',
      isMerged: 100,
      code: function() {
        if ( ! this.slideArea ) return;
        this.slideArea.scrollLeft = 0;
        this.slideArea.style.width = this.styleWidth();
        this.slideArea.style.height = this.styleHeight();
      }
    },
    {
      name: 'layout',
      code: function() {
        this.overlaySlider.x = 0;
        this.overlaySlider.y = 0;
        this.overlaySlider.z = this.sliderOpen ? 1 : 0;
        this.overlaySlider.width = this.width;
        this.overlaySlider.height = this.height;

        this.fixLayout();

        for ( var i = 0; i < this.stack.length ; i++ ) {
          this.stack[i].x = ((i - this.slideAmount)*this.width);
          this.stack[i].width = this.width;
          this.stack[i].height = this.height;
          this.stack[i].z = 0;
        }
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
    function toInnerHTML() {/* %%overlaySlider <div id="<%= this.slideArea = this.nextID() %>" style="position:absolute;overflow:hidden"></div> */}
  ],
  actions: [
    {
      name:  'back',
      label: '<',
      help:  'Go to previous view',

      isEnabled: function() { return this.currentView > 0 || this.sliderOpen; },
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
          this.currentView -= 1;
          this.doTransition(this.currentView);
        }
      }
    },
    {
      name:  'forth',
      label: '>',
      help:  'Undo the previous back.',
      isEnabled: function() { return this.currentView < this.stack.length - 1; },
      code: function() {
        throw new Error("Unimplemented");
        this.currentView += 1;
        Movement.animate(
          300,
          function() {
            this.slideAmount = this.currentView;
          }.bind(this),
          Movement.easeOut(1))();
      }
    }
  ]
});
