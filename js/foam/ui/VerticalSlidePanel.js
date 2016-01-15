/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.ui',
  name: 'VerticalSlidePanel',
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

    TOP: {
      panelY: function(y) {
        return this.parentHeight - y - this.panelHeight;
      },
      invPanelY: function(y) {
        return y - this.parentHeight + this.panelHeight;
      },
      mainY: function() {
        return this.parentHeight - this.mainHeight;
      },
      dragDir: -1
    },
    BOTTOM: {
      panelY: function(y) {
        return y;
      },
      invPanelY: function(y) {
        return y;
      },
      mainY: function() {
        return 0;
      },
      dragDir: 1
    },

    CLOSED: {
      name: 'CLOSED',
      layout: function() {
        return [
          this.parentHeight - this.stripHeight,
          this.minPanelHeight,
          this.stripHeight
        ];
      },
      onResize: function() {
        if ( this.parentHeight > this.minHeight + this.minPanelHeight )
          this.state = this.EXPANDED;
      },
      toggle: function() { this.open(); },
      open: function() { this.state = this.OPEN; },
      over: true
    },
    EXPANDED: {
      name: 'EXPANDED',
      layout: function() {
        var extraHeight = this.parentHeight - this.minHeight -
            this.minPanelHeight;
        var panelHeight = this.minPanelHeight + extraHeight * this.panelRatio;
        return [ this.parentHeight - panelHeight, panelHeight, panelHeight ];
      },
      onResize: function() {
        if ( this.parentHeight < this.minHeight + this.minPanelHeight )
          this.state = this.CLOSED;
      }
    },
    OPEN: {
      name: 'OPEN',
      layout: function() {
        return [
          this.parentHeight - this.stripHeight,
          this.minPanelHeight,
          this.minPanelHeight
        ];
      },
      onResize: function() {
        if ( this.parentHeight > this.minHeight + this.minPanelHeight )
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
        if ( this.parentHeight < this.minHeight + this.minPanelHeight )
          this.state = this.OPEN;
      }
    }
  },

  help: function() {/*
    A controller that shows a main view with a small strip of the
    secondary view visible at the top or bottom edge. This "panel" can be
    dragged by a finger or mouse pointer to any position from its small strip to
    fully exposed. If the containing view is big enough, both panels will
    always be visible.
  */},

  properties: [
    {
      name: 'side',
      adapt: function(_, side) {
        return side === 'top' ? this.TOP : side === 'bottom' ? this.BOTTOM :
            side;
      },
      lazyFactory: function() { return this.BOTTOM; }
    },
    {
      type: 'Boolean',
      name: 'overlapPanels',
      documentation: function() {/*
        Indicates whether main view should be allowed to overlap the slide
        panel. I.e., whether the main view lays out above/below the slide panel
        (false), or over the full height, behind the slide panel (true).
      */},
      defaultValue: false
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
        this.panelHeight = Math.max(layout[1], this.minPanelHeight);
        this.panelY      = Math.min(this.parentHeight - this.stripHeight,
                                    this.parentHeight - layout[2]);
        this.mainHeight  = Math.max(layout[0], this.overlapPanels ?
            this.parentHeight : this.panelY);
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
            var mainHeight = this.currentLayout = [
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
      name: 'minHeight',
      defaultValueFn: function() {
        var e = this.$main();
        return e ? toNum(this.X.window.getComputedStyle(e).height) : 300;
      }
    },
    {
      type: 'Int',
      name: 'mainHeight',
      type: 'Int',
      hidden: true,
      help: 'Set internally by the resize handler',
      postSet: function(_, y) {
        this.$main().style.height = y + 'px';
        y = this.side.mainY.call(this);
        this.$main().style.webkitTransform = 'translate3d(0,' + y + 'px,0)';
        this.$main().style.MozTransform = 'translate3d(0' + y + 'px,0)';
      }
    },
    {
      type: 'Int',
      name: 'panelHeight',
      type: 'Int',
      hidden: true,
      help: 'Set internally by the resize handler',
      postSet: function(_, y) {
        this.$panel().style.height = y + 'px';
        // If the panel has an onResize() method (maybe it's another
        // *SlidePanel), then call it.
        this.panelView_ && this.panelView_.onResize &&
            this.panelView_.onResize();
      }
    },
    {
      type: 'Int',
      name: 'minPanelHeight',
      defaultValueFn: function() {
        if ( this.panelView && this.panelView.minHeight )
          return this.panelView.minHeight + (this.panelView.stripHeight || 0);

        var e = this.$panel();
        return e ? toNum(this.X.window.getComputedStyle(e).height) : 250;
      }
    },
    {
      type: 'Int',
      name: 'parentHeight',
      help: function() {/*
        A pseudoproperty that returns the current height (CSS pixels) of the
        containing element.
      */},
      lazyFactory: function() {
        return toNum(this.X.window.getComputedStyle(
            this.$.parentElement).height);
      }
    },
    {
      type: 'Int',
      name: 'stripHeight',
      help: 'The height in (CSS) pixels of the minimal visible strip of panel',
      defaultValue: 30
    },
    {
      type: 'Float',
      name: 'panelRatio',
      help: function() {/*
        The ratio (0-1) of the total height occupied by the panel, when
        the containing element is wide enough for expanded view.
      */},
      defaultValue: 0.5
    },
    {
      type: 'Int',
      name: 'panelY',
      postSet: function(oldY, y) {
        if ( this.currentLayout ) this.currentLayout[2] = this.parentHeight - y;
        if ( oldY !== y ) this.dir_ = oldY.compareTo(y);
        y = this.side.panelY.call(this, y);
        this.$panel().style.webkitTransform = 'translate3d(0,' + y + 'px,0)';
        this.$panel().style.MozTransform = 'translate3d(0,' + y + 'px,0)';
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
      .SlidePanel .top-shadow {
        background: linear-gradient(to top, rgba(0,0,0,0.2) 0%,
                                             rgba(0,0,0,0) 100%);
        height: 100%;
        bottom: -8px;
        position: absolute;
        height: 8px;
      }
      .SlidePanel .bottom-shadow {
        background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%,
                                             rgba(0,0,0,0) 100%);
        height: 100%;
        bottom: -8px;
        position: absolute;
        height: 8px;
        top: 0;
      }
    */},
    function toHTML() {/*
      <div id="%%id" style="display: inline-block;position: relative;" class="SlidePanel">
        <div id="%%id-main" class="main">
          <div style="height:0;position:absolute;"></div>
          <%= this.mainView({ data$: this.data$ }, this.Y) %>
        </div>
        <div id="%%id-panel" class="panel" style="position: absolute; top: -1; left: 0;">
          <% if ( this.side === this.BOTTOM ) { %> <div id="%%id-shadow" class="top-shadow"></div> <% } %>
          <%= (this.panelView_ = this.panelView({ data$: this.data$ }, this.Y)) %>
          <% if ( this.side === this.TOP ) { %> <div id="%%id-shadow" class="bottom-shadow"></div> <% } %>
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

      this.$main().addEventListener('click',       this.onMainFocus);
      this.$main().addEventListener('DOMFocusIn',  this.onMainFocus);
      this.$panel().addEventListener('DOMFocusIn', this.onPanelFocus);
      this.initChildren(); // Didn't call SUPER(); need to do this here.
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
    $main:   function() { return this.X.$(this.id + '-main'); },
    $panel:  function() { return this.X.$(this.id + '-panel'); },
    $shadow: function() { return this.X.$(this.id + '-shadow'); },
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
        this.clearProperty('parentHeight');
        if ( ! this.$ ) return;
        this.state.onResize.call(this);
        this.$shadow().style.display = this.state.over ? 'inline' : 'none';
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
        // Otherwise, bind panelY to the absolute y.
        var self = this;
        var originalY = this.panelY;
        Events.map(point.y$, this.panelY$, function(y) {
          y = this.side.invPanelY.call(this, originalY + this.side.dragDir * point.totalY);

          // Bound it between its top and bottom limits: full open and just the
          // strip.
          if ( y <= this.parentHeight - this.panelHeight )
            return this.parentHeight - this.panelHeight;

          if ( y >= this.parentHeight - this.stripHeight )
            return this.parentHeight - this.stripHeight;

          return y;
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
