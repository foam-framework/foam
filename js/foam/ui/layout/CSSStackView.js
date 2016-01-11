/**
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
  name: 'CSSStackView',
  extends: 'foam.ui.View',
  package: 'foam.ui.layout',
  traits: ['foam.ui.layout.PositionedDOMViewTrait'],

  requires: [
    'foam.ui.layout.CSSOverlaySlider as OverlaySlider',
    'foam.ui.layout.FloatingView'
  ],

  properties: [
    {
      name: 'stack',
      factory: function() { return []; }
    },
    {
      type: 'Int',
      name: 'currentView',
      defaultValue: 0,
      preSet: function(_, v) { return Math.min(Math.max(v, 0), this.stack.length - 1); }
    },
    {
      name: 'animating',
      defaultValue: false
    },
    {
      type: 'Int',
      name: 'direction',
      defaultValue: -1
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
      type: 'Boolean',
      name: 'sliderOpen',
      defaultValue: false
    },
    {
      model_: 'foam.core.types.DOMElementProperty',
      name: 'innerContainer'
    },
    {
      model_: 'foam.core.types.DOMElementProperty',
      name: 'containerViewport'
    }
  ],

  imports: [
    'dynamicFn'
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.dynamicFn(function() {
        self.width;
        self.height;
        self.sliderOpen;
      }, this.onLayout);
      this.dynamicFn(function() {
        self.currentView;
        self.width;
      }, this.onTransform)
      this.dynamicFn(function() {
        self.width;
        self.height;
      }, this.resizeContainer);
    },
    setTopView: function(view) {
      if ( ! view.model_.Z ) view = this.FloatingView.create({ view: view });

      for ( var i = 0 ; i < this.stack.length ; i++ ) {
        this.stack[i].destroy();
      }

      this.stack = [view];
      this.currentView = 0;

      this.onLayout();
      this.resizeContainer();

      if ( this.innerContainer ) {
        this.innerContainer.innerHTML = view.toHTML();
        view.initHTML();
      }
    },
    setPreview: function() {},
    slideView: function(view, opt_label, opt_side, opt_delay) {
      if ( ! view.model_.Z ) view = this.FloatingView.create({ view: view });

      if ( this.sliderOpen ) {
        this.overlaySlider.close(true);
        this.sliderOpen = false;
      }

      this.sliderOpen = true;
      this.overlaySlider.open(view);
    },
    pushView: function(view, opt_label, opt_back, opt_transition) {
      if ( ! view.model_.Z ) view = this.FloatingView.create({ view: view });

      var nextView = this.currentView + 1;
      if ( this.stack[nextView] ) {
        this.stack[nextView].$.remove();
        this.stack[nextView].destroy();
      }
      
      this.stack[nextView] = view;
      this.propertyChange('stack', this.stack, this.stack);

      this.onLayout();
      this.resizeContainer();

      this.innerContainer.insertAdjacentHTML('beforeend', view.toHTML());
      view.initHTML();

      this.currentView = nextView;
      if ( opt_transition == 'none' ) this.animating = false;
      else this.animating = true;
    }
  },

  actions: [
    {
      name: 'back',
      code: function() {
        if ( this.sliderOpen ) {
          this.overlaySlider.close();
          this.sliderOpen = false;
        } else {
          this.animating = true;
          this.currentView = this.currentView - 1;
        }
      }
    }
  ],

  listeners: [
    {
      name: 'overlayBack',
      code: function() {
        if ( this.sliderOpen ) this.back();
      }
    },
    {
      name: 'resizeContainer',
      isFramed: true,
      code: function() {
        if ( ! this.innerContainer ) return;
        this.innerContainer.style.width = this.stack.length * this.width + 'px';
        this.innerContainer.style.height = this.height + 'px';
        this.containerViewport.style.width = this.styleWidth();
        this.containerViewport.style.height = this.styleHeight();
      }
    },
    {
      name: 'updateContents',
      isFramed: true,
      code: function() {
      }
    },
    {
      name: 'fixLayout',
      isMerged: 100,
      code: function() {
        if ( ! this.containerViewport ) return;
        this.containerViewport.scrollLeft = 0;
      }
    },
    {
      name: 'onLayout',
      code: function() {
        this.fixLayout();

        this.overlaySlider.x = 0;
        this.overlaySlider.y = 0;
        this.overlaySlider.z = this.sliderOpen ? 1 : 0;
        this.overlaySlider.width = this.width;
        this.overlaySlider.height = this.height;
        for ( var i = 0; i < this.stack.length ; i++ ){
          this.stack[i].x = i * this.width;
          this.stack[i].y = 0;
          this.stack[i].z = 0;
          this.stack[i].width = this.width;
          this.stack[i].height = this.height;
        }
      }
    },
    {
      name: 'onTransform',
      isFramed: true,
      code: function() {
        if ( ! this.innerContainer ) return;
        this.innerContainer.style.webkitTransform =
          'translate3d(' + -1 * this.currentView * this.width + 'px, 0px, 0px)';
      }
    }
  ],

  templates: [
    function CSS() {/*
.cssslider-animate {
  -webkit-transition: -webkit-transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
*/},
    function toInnerHTML() {/*<%= this.overlaySlider %><div id="<%= this.containerViewport = this.nextID() %>" style="overflow:hidden;position:absolute"><div id="<%= this.innerContainer = this.setClass('cssslider-animate', function() { self.animating; }) %>"><%= this.stack[0] || '' %></div></div>*/}
  ]
});
