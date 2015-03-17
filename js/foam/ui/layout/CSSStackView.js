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
  extendsModel: 'foam.ui.View',
  package: 'foam.ui.layout',
  traits: ['foam.ui.layout.PositionedDOMViewTrait'],

  requires: [
    'foam.ui.layout.FloatingView'
  ],

  properties: [
    {
      name: 'stack',
      factory: function() { return []; }
    },
    {
      model_: 'IntProperty',
      name: 'currentView',
      defaultValue: 0,
      preSet: function(_, v) { return Math.min(Math.max(v, 0), this.stack.length - 1); }
    },
    {
      name: 'animating',
      defaultValue: false
    },
    {
      model_: 'IntProperty',
      name: 'direction',
      defaultValue: -1
    },
    {
      name: 'slideLatch'
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
    'dynamic'
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.dynamic(function() {
        self.width;
        self.height;
      }, this.layout);
      this.dynamic(function() {
        self.currentView;
        self.width;
      }, this.transform)
      this.dynamic(function() {
        self.width;
        self.height;
      }, this.resizeContainer);
    },
    installInDocument: function(X, d) {
      this.SUPER(X, d);
      var sheet = d.createElement('style');
      this.STYLESHEET = sheet;
    },
    setTopView: function(view) {
      if ( ! view.model_.Z ) view = this.FloatingView.create({ view: view });

      this.stack = [view];
      this.currentView = 0;

      this.layout();
      this.resizeContainer();

      this.innerContainer.innerHTML = view.toHTML();
      view.initHTML();
    },
    setPreview: function() {},
    pushView: function(view, opt_label, opt_back, opt_transition) {
      if ( ! view.model_.Z ) view = this.FloatingView.create({ view: view });

      var nextView = this.currentView + 1;
      if ( this.stack[nextView] ) {
        this.stack[nextView].$.remove();
        this.stack[nextView].destroy();
      }
      
      this.stack[nextView] = view;
      this.propertyChange('stack', this.stack, this.stack);

      this.layout();
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
      action: function() {
        this.animating = true;
        this.currentView = this.currentView - 1;
      }
    }
  ],

  listeners: [
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
      name: 'layout',
      code: function() {
        this.fixLayout();

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
      name: 'transform',
      isFramed: true,
      code: function() {
        if ( ! this.innerContainer ) return;
        this.innerContainer.style.webkitTransform =
          'translate3d(' + -1 * this.currentView * this.width + 'px, 0px, 0px)';
      }
    },
    {
      name: 'onAnimationStart',
      code: function() {
      }
    },
    {
      name: 'onAnimationEnd',
      code: function() {
      }
    }
  ],

  templates: [
    function CSS() {/*
.cssslider-animate {
  -webkit-transition: -webkit-transform 300ms ease-in;
}
*/},
    function toInnerHTML() {/*<div id="<%= this.containerViewport = this.nextID() %>" style="overflow:hidden;position:absolute"><div id="<%= this.innerContainer = this.setClass('cssslider-animate', function() { self.animating; }) %>"></div></div>*/}
  ]
});

