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
  package: 'foam.ui',
  name: 'SlidePanel',
  extends: 'foam.ui.View',

  requires: [
    'foam.input.touch.GestureTarget'
  ],
  imports: [
    'clearTimeout',
    'document',
    'gestureManager',
    'setTimeout'
  ],

  constants: {
    ANIMATION_DELAY: 150,

    LEFT: {
      panelX: function(x) {
        return this.parentWidth - x - this.panelWidth;
      },
      invPanelX: function(x) {
        return x - this.parentWidth + this.panelWidth;
      },
      mainX: function() {
        return this.parentWidth - this.mainWidth;
      },
      dragDir: -1
    },
    RIGHT: {
      panelX: function(x) {
        return x;
      },
      invPanelX: function(x) {
        return x;
      },
      mainX: function() {
        return 0;
      },
      dragDir: 1
    },

    CLOSED: {
      name: 'CLOSED',
      layout: function() {
        return [ this.parentWidth - this.stripWidth, this.minPanelWidth, this.stripWidth ];
      },
      onResize: function() {
        if ( this.parentWidth > this.minWidth + this.minPanelWidth )
          this.state = this.EXPANDED;
      },
      toggle: function() { this.open(); },
      open: function() { this.state = this.OPEN; },
      over: true
    },
    EXPANDED: {
      name: 'EXPANDED',
      layout: function() {
        var extraWidth = this.parentWidth - this.minWidth - this.minPanelWidth;
        var panelWidth = this.minPanelWidth + extraWidth * this.panelRatio;
        return [ this.parentWidth - panelWidth, panelWidth, panelWidth ];
      },
      onResize: function() {
        if ( this.parentWidth < this.minWidth + this.minPanelWidth )
          this.state = this.CLOSED;
      }
    },
    OPEN: {
      name: 'OPEN',
      layout: function() {
        return [ this.parentWidth - this.stripWidth, this.minPanelWidth, this.minPanelWidth ];
      },
      onResize: function() {
        if ( this.parentWidth > this.minWidth + this.minPanelWidth )
          this.state = this.OPEN_EXPANDED;
      },
      close: function() { this.state = this.CLOSED; },
      toggle: function() { this.close(); },
      over: true
    },
    OPEN_EXPANDED: {
      name: 'OPEN_EXPANDED',
      layout: function() { return this.EXPANDED.layout.call(this); },
      onResize: function() {
        if ( this.parentWidth < this.minWidth + this.minPanelWidth )
          this.state = this.OPEN;
      }
    }
  },

  help: 'A controller that shows a main view with a small strip of the ' +
      'secondary view visible at the right edge. This "panel" can be dragged ' +
      'by a finger or mouse pointer to any position from its small strip to ' +
      'fully exposed. If the containing view is wide enough, both panels ' +
      'will always be visible.',

  properties: [
    {
      name: 'side',
      adapt: function(_, side) {
        return side === 'left' ? this.LEFT : side === 'right' ? this.RIGHT : side ;
      },
      lazyFactory: function() { return this.LEFT; }
    },
    {
      name: 'state',
      postSet: function(oldState, newState) {
        var layout = this.state.layout.call(this);
        if ( oldState === newState && ! this.af_ ) {
          this.currentLayout = layout;
        } else {
          this.desiredLayout = layout;
        }
      }
    },
    {
      name: 'currentLayout',
      postSet: function(_, layout) {
        this.panelWidth = Math.max(layout[1], this.minPanelWidth);
        this.panelX     = Math.min(this.parentWidth-this.stripWidth, this.parentWidth-layout[2]);
        this.mainWidth  = Math.max(layout[0], this.panelX);
      }
    },
    {
      name: 'desiredLayout',
      postSet: function(_, layout) {
        if ( ! this.currentLayout ) {
          this.currentLayout = layout;
          return;
        }
        var startLayout = this.currentLayout;
        var start = Date.now();
        var end   = start + this.ANIMATION_DELAY;
        var animate = function() {
          var now = Date.now();
          var p = (now-start) / (end-start);
          if ( p < 1 ) {
            var mainWidth = this.currentLayout = [
              startLayout[0] * ( 1 - p ) + layout[0] * p,
              startLayout[1] * ( 1 - p ) + layout[1] * p,
              startLayout[2] * ( 1 - p ) + layout[2] * p
            ];
            if ( this.af_ ) this.X.cancelAnimationFrame(this.af_);
            this.af_ = this.X.requestAnimationFrame(animate);
          } else {
            this.currentLayout = layout;
            this.af_ = null;
          }
        }.bind(this);
        animate();
      }
    },
    { type: 'ViewFactory', name: 'mainView' },
    { type: 'ViewFactory', name: 'panelView' },
    {
      type: 'Int',
      name: 'minWidth',
      defaultValueFn: function() {
        var e = this.main$();
        return e ? toNum(this.X.window.getComputedStyle(e).width) : 300;
      }
    },
    {
      type: 'Int',
      name: 'mainWidth',
      hidden: true,
      help: 'Set internally by the resize handler',
      postSet: function(_, x) {
        this.main$().style.width = x + 'px';
        var x = this.side.mainX.call(this);
        this.main$().style.webkitTransform = 'translate3d(' + x + 'px, 0,0)';
        this.main$().style.MozTransform = 'translate3d(' + x + 'px, 0,0)';
      }
    },
    {
      type: 'Int',
      name: 'panelWidth',
      hidden: true,
      help: 'Set internally by the resize handler',
      postSet: function(_, x) {
        this.panel$().style.width = (x+2) + 'px';
        // if the panel has an onResize() method (maybe it's another SlidePanel), then call it.
        this.panelView_ && this.panelView_.onResize && this.panelView_.onResize();
      }
    },
    {
      type: 'Int',
      name: 'minPanelWidth',
      defaultValueFn: function() {
        if ( this.panelView && this.panelView.minWidth )
          return this.panelView.minWidth + (this.panelView.stripWidth || 0);

        var e = this.panel$();
        return e ? toNum(this.X.window.getComputedStyle(e).width) : 250;
      }
    },
    {
      type: 'Int',
      name: 'parentWidth',
      help: 'A pseudoproperty that returns the current width (CSS pixels) of the containing element',
      lazyFactory: function() {
        return toNum(this.X.window.getComputedStyle(this.$.parentNode).width);
      }
    },
    {
      type: 'Int',
      name: 'stripWidth',
      help: 'The width in (CSS) pixels of the minimal visible strip of panel',
      defaultValue: 30
    },
    {
      type: 'Float',
      name: 'panelRatio',
      help: 'The ratio (0-1) of the total width occupied by the panel, when ' +
          'the containing element is wide enough for expanded view.',
      defaultValue: 0.5
    },
    {
      type: 'Int',
      name: 'panelX',
      postSet: function(oldX, x) {
        if ( this.currentLayout ) this.currentLayout[2] = this.parentWidth-x;
        if ( oldX !== x ) this.dir_ = oldX.compareTo(x);
        x = this.side.panelX.call(this, x);
        this.panel$().style.webkitTransform = 'translate3d(' + x + 'px, 0,0)';
        this.panel$().style.MozTransform = 'translate3d(' + x + 'px, 0,0)';
      }
    },
    {
      name: 'dragGesture',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        return this.GestureTarget.create({
          containerID: this.id + '-panel',
          handler: this,
          gesture: 'drag'
        });
      }
    },
    {
      name: 'tapGesture',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        return this.GestureTarget.create({
          containerID: this.id + '-panel',
          handler: this,
          gesture: 'tap'
        });
      }
    }
  ],

  templates: [
    function CSS() {/*
      .SlidePanel .left-shadow {
        background: linear-gradient(to left, rgba(0,0,0,0.2) 0%,
                                             rgba(0,0,0,0) 100%);
        height: 100%;
        left: -8px;
        position: absolute;
        width: 8px;
      }
      .SlidePanel .right-shadow {
        background: linear-gradient(to right, rgba(0,0,0,0.2) 0%,
                                             rgba(0,0,0,0) 100%);
        height: 100%;
        right: -8px;
        position: absolute;
        width: 8px;
        top: 0;
      }
    */},
    function toHTML() {/*
      <div id="%%id" style="display: inline-block;position: relative;" class="SlidePanel">
        <div id="%%id-main" class="main">
          <div style="width:0;position:absolute;"></div>
          <%= this.mainView({ data$: this.data$ }) %>
        </div>
        <div id="%%id-panel" class="panel" style="position: absolute; top: 0; left: -1;">
          <% if ( this.side === this.RIGHT ) { %> <div id="%%id-shadow" class="left-shadow"></div> <% } %>
          <%= (this.panelView_ = this.panelView({ data$: this.data$ })) %>
          <% if ( this.side === this.LEFT ) { %> <div id="%%id-shadow" class="right-shadow"></div> <% } %>
        </div>
      </div>
    */}
  ],

  methods: {
    initHTML: function() {
      // Check if panel should be initially expanded
      this.CLOSED.onResize.call(this);
      if ( ! this.state ) this.state = this.CLOSED;

      if (this.gestureManager) {
        this.gestureManager.install(this.dragGesture);
        this.gestureManager.install(this.tapGesture);
      }

      // Resize first, then init the outer view, and finally the panel view.
      this.X.window.addEventListener('resize', this.onResize);

      this.main$().addEventListener('click',       this.onMainFocus);
      this.main$().addEventListener('DOMFocusIn',  this.onMainFocus);
      this.panel$().addEventListener('DOMFocusIn', this.onPanelFocus);
      this.initChildren(); // We didn't call SUPER(), so we have to do this here.
    },
    interpolate: function(state1, state2) {
      var layout1 = state1.layout.call(this);
      var layout2 = state2.layout.call(this);
      return [
        layout1[0] * this.progress + layout2[0] * ( 1 - this.progress ),
        layout1[1] * this.progress + layout2[1] * ( 1 - this.progress ),
        layout1[2] * this.progress + layout2[2] * ( 1 - this.progress ),
      ];
    },
    main$:   function() { return this.X.$(this.id + '-main'); },
    panel$:  function() { return this.X.$(this.id + '-panel'); },
    shadow$: function() { return this.X.$(this.id + '-shadow'); },
    open:    function() { this.state.open && this.state.open.call(this); },
    close:   function() { this.state.close && this.state.close.call(this); },
    toggle:  function() { this.state.toggle && this.state.toggle.call(this); }
  },

  listeners: [
    {
      name: 'onPanelFocus',
      isMerged: 1,
      code: function(e) { this.open(); }
    },
    {
      name: 'onMainFocus',
      isMerged: 1,
      code: function(e) { this.close(); }
    },
    {
      name: 'onResize',
      isFramed: true,
      code: function(e) {
        this.clearProperty('parentWidth');
        if ( ! this.$ ) return;
        this.state.onResize.call(this);
        this.shadow$().style.display = this.state.over ? 'inline' : 'none';
        this.state = this.state;
      }
    },
    {
      name: 'tapClick',
      code: function() { this.toggle(); }
    },
    {
      name: 'dragStart',
      code: function(point) {
        if ( this.state === this.EXPANDED || this.state === this.OPEN_EXPANDED ) return;
        // Otherwise, bind panelX to the absolute X.
        var self = this;
        var originalX = this.panelX;
        Events.map(point.x$, this.panelX$, function(x) {
          x = this.side.invPanelX.call(this, originalX + this.side.dragDir * point.totalX);

          // Bound it between its left and right limits: full open and just the
          // strip.
          if ( x <= this.parentWidth - this.panelWidth )
            return this.parentWidth - this.panelWidth;

          if ( x >= this.parentWidth - this.stripWidth )
            return this.parentWidth - this.stripWidth;

          return x;
        }.bind(this));
      }
    },
    {
      name: 'dragEnd',
      code: function(point) {
        var currentLayout = this.currentLayout;
        if ( this.af_ ) this.X.cancelAnimationFrame(this.af_);
        this.af_ = null;
        if ( this.dir_ < 0 ) this.close(); else this.open();
        var layout = this.state.layout.call(this);
        this.currentLayout = currentLayout;
        this.desiredLayout = layout;
      }
    }
  ]
});
