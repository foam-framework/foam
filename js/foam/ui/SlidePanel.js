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
  extendsModel: 'View',

  requires: [
    'GestureTarget'
  ],
  imports: [
    'clearTimeout',
    'document',
    'gestureManager',
    'setTimeout'
  ],

  help: 'A controller that shows a main view with a small strip of the ' +
      'secondary view visible at the right edge. This "panel" can be dragged ' +
      'by a finger or mouse pointer to any position from its small strip to ' +
      'fully exposed. If the containing view is wide enough, both panels ' +
      'will always be visible.',

  properties: [
    { model_: 'ViewFactoryProperty', name: 'mainView' },
    { model_: 'ViewFactoryProperty', name: 'panelView' },
    {
      model_: 'IntProperty',
      name: 'minWidth',
      defaultValueFn: function() {
        var e = this.main$();
        return e ? toNum(this.X.window.getComputedStyle(e).width) : 300;
      }
    },
    {
      model_: 'IntProperty',
      name: 'width',
      model_: 'IntProperty',
      hidden: true,
      help: 'Set internally by the resize handler',
      postSet: function(_, x) {
        this.main$().style.width = x + 'px';
      }
    },
    {
      model_: 'IntProperty',
      name: 'minPanelWidth',
      defaultValueFn: function() {
        if ( this.panelView && this.panelView.minWidth )
          return this.panelView.minWidth + (this.panelView.stripWidth || 0);

        var e = this.panel$();
        return e ? toNum(this.X.window.getComputedStyle(e).width) : 250;
      }
    },
    {
      model_: 'IntProperty',
      name: 'panelWidth',
      hidden: true,
      help: 'Set internally by the resize handler',
      postSet: function(_, x) { this.panel$().style.width = x + 'px'; }
    },
    {
      model_: 'IntProperty',
      name: 'parentWidth',
      help: 'A pseudoproperty that returns the current width (CSS pixels) of the containing element',
      getter: function() { return toNum(this.X.window.getComputedStyle(this.$.parentNode).width); }
    },
    {
      model_: 'IntProperty',
      name: 'stripWidth',
      help: 'The width in (CSS) pixels of the minimal visible strip of panel',
      defaultValue: 30
    },
    {
      model_: 'FloatProperty',
      name: 'panelRatio',
      help: 'The ratio (0-1) of the total width occupied by the panel, when ' +
          'the containing element is wide enough for expanded view.',
      defaultValue: 0.5
    },
    {
      model_: 'IntProperty',
      name: 'panelX',
      //defaultValueFn: function() { this.width - this.stripWidth; },
      preSet: function(oldX, x) {
        if ( oldX !== x ) this.dir_ = oldX.compareTo(x);

        // Bound it between its left and right limits: full open and just the
        // strip.
        if ( x <= this.parentWidth - this.panelWidth )
          return this.parentWidth - this.panelWidth;

        if ( x >= this.parentWidth - this.stripWidth )
          return this.parentWidth - this.stripWidth;

        return x;
      },
      postSet: function(_, x) {
        this.panel$().style.webkitTransform = 'translate3d(' + x + 'px, 0,0)';
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
    },
    {
      name: 'opened',
      help: 'If the panel us opened or not.',
      defaultValue: false
    },
    {
      name: 'expanded',
      help: 'If the panel is wide enough to expand the panel permanently.',
      defaultValue: false
    }
  ],

  templates: [
    function CSS() {/*
      .SlidePanel {
        display: flex;
        position: relative;
      }
      .SlidePanel .shadow {
        background: linear-gradient(to left, rgba(0,0,0,0.15) 0%,
                                             rgba(0,0,0,0) 100%);
        height: 100%;
        left: -8px;
        position: absolute;
        width: 8px;
      }
      .SlidePanel .main {
      }
      .SlidePanel .panel {
        position: absolute;
        top: 0;
        left: 0;
      }
    */},
    function toHTML() {/*
      <div id="%%id" class="SlidePanel">
        <div id="%%id-main" class="main">
          <div style="width:0;position:absolute;"></div>
          <%= this.mainView() %>
        </div>
        <div id="%%id-panel" class="panel">
          <div id="%%id-shadow" class="shadow"></div>
          <%= this.panelView() %>
        </div>
      </div>
    */}
  ],

  methods: {
    initHTML: function() {
      this.gestureManager.install(this.dragGesture);
      this.gestureManager.install(this.tapGesture);

      // Resize first, then init the outer view, and finally the panel view.
      this.X.window.addEventListener('resize', this.onResize);

      this.main$().addEventListener('click',       this.onMainFocus);
      this.main$().addEventListener('DOMFocusIn',  this.onMainFocus);
      this.panel$().addEventListener('DOMFocusIn', this.onPanelFocus);
      this.onResize();
      this.initChildren(); // We didn't call SUPER(), so we have to do this here.
    },
    snap: function() {
      // if ( this.parentWidth >= this.minWidth + this.minPanelWidth ) return;
      // TODO: Calculate the animation time based on how far the panel has to move
      Movement.animate(500, function() {
        this.panelX = this.dir_ > 0 ? 0 : 1000;
      }.bind(this))();
    },
    main$: function() { return this.X.$(this.id + '-main'); },
    panel$: function() { return this.X.$(this.id + '-panel'); },
    shadow$: function() { return this.X.$(this.id + '-shadow'); },
    open: function() {
      if ( this.expanded || this.opened ) return;
      this.opened = true;
      this.dir_ = 1;
      this.snap();
    },
    close: function() {
      if ( this.expanded || ! this.opened ) return;
      this.opened = false;
      this.dir_ = -1;
      this.snap();
    }
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
        if ( ! this.$ ) return;
        if ( this.parentWidth >= this.minWidth + this.minPanelWidth ) {
          // if ( this.expanded ) return;
          this.shadow$().style.display = 'none';
          // Expaded mode. Show the two side by side, setting their widths
          // based on the panelRatio.
          this.panelWidth = Math.max(this.panelRatio * this.parentWidth, this.minPanelWidth);


          this.width = this.parentWidth - this.panelWidth;
          this.panelX = this.width;
          this.expanded = true;
        } else {
          // if ( ! this.expanded ) return;
          this.shadow$().style.display = 'inline';
          this.width = Math.max(this.parentWidth - this.stripWidth, this.minWidth);
          this.panelWidth = this.minPanelWidth;
          this.panelX = this.width;
          this.expanded = false;
        }
      }
    },
    {
      name: 'tapClick',
      code: function() {
        console.log('tapclick', this.expanded, this.opened);
        if ( this.expanded ) return;
        if ( this.opened ) this.close();
        else this.open();
      }
    },
    {
      name: 'dragStart',
      code: function(point) {
        if ( this.expanded ) return;
        // Otherwise, bind panelX to the absolute X.
        var self = this;
        var originalX = this.panelX;
        Events.map(point.x$, this.panelX$, function(x) {
          return originalX + point.totalX;
        });
      }
    },
    {
      name: 'dragEnd',
      code: function(point) {
        if ( this.expanded ) return;
        Events.unfollow(point.x$, this.panelX$);
        this.snap();
        this.opened = ! this.opened;
      }
    }
  ]
});
