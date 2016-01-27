/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2',
  name: 'ScrollView',
  extends: 'foam.u2.View',

  requires: [
    'foam.input.touch.GestureTarget',
    'foam.util.busy.BusyStatus',
    'foam.u2.SpinnerView'
  ],

  imports: [
    'dynamic',
    'gestureManager',
    'selection$',
    'window'
  ],
  exports: [
    'as scrollView'
  ],

  documentation: function() {/*
    <p>Infinite scrolling view. Expects a DAO as $$DOC{ref: ".data"} and displays a subset of the data at a time, minimizing the amount of DOM creation and manipulation.</p>

    <p>60fps when scrolling, generally drops one frame every time more data is rendered.</p>

    <p>The required properties are $$DOC{ref: ".data"} and $$DOC{ref: ".rowView"}.</p>

    <p>The <tt>rowView</tt> <strong>must</strong> have a fixed vertical size. That size is determined in one of three ways:</p>

    <ul>
    <li>The user specifies $$DOC{ref: ".rowHeight"}.
    <li>The $$DOC{ref: ".rowView"} specifies <tt>preferredHeight</tt>.
    <li>The <tt>ScrollView</tt> will create an instance of the $$DOC{ref: ".rowView"} with no data, insert it into the DOM, let it render, and measure its size. This can be flaky for some <tt>View</tt>s, so if you run into sizing problems, add a <tt>preferredHeight</tt> property with a <tt>defaultValue</tt> on the $$DOC{ref: ".rowView"}'s model.
    </ul>
  */},

  constants: {
    ROW_CLICK: ['row-click']
  },

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        this.dao = nu;
      }
    },
    {
      // TODO(braden): This property only exists because we need to change its
      // type to DAOProperty.
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      onDAOUpdate: 'onDAOUpdate'
    },
    {
      name: 'model',
      documentation: 'The model for the data. Defaults to the DAO\'s model.',
      defaultValueFn: function() { return this.dao.model; }
    },
    {
      name: 'runway',
      defaultValue: 800,
      documentation: 'The distance in pixels to render on either side of the viewport. Defaults to 800.'
    },
    {
      name: 'count',
      defaultValue: 0,
      postSet: function(old, nu) {
        this.scrollHeight = nu * this.rowHeight;
      }
    },
    {
      name: 'scrollHeight',
      documentation: 'The total height of the scrollable pane. Generally <tt>count * rowHeight</tt>.'
    },
    {
      name: 'scrollTop',
      documentation: 'Set on each scroll event. Saved so we can resume a previous scroll position when we return to this view from elsewhere.',
      defaultValue: 0
    },
    {
      name: 'scrollGesture',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        return this.GestureTarget.create({
          containerID: this.scrollerE.id,
          handler: this,
          gesture: 'verticalScrollNative'
        });
      }
    },
    {
      name: 'rowHeight',
      defaultValue: -1,
      documentation: function() {/*
        <p>The height of each row in CSS pixels.</p>
        <p>If specified, <tt>ScrollView</tt> will use this height. Otherwise it will use <tt>rowView</tt>'s <tt>preferredHeight</tt>, if set. Otherwise defaults to <tt>-1</tt> until it can be computed dynamically.</p>

        <p>That computation requires rendering a <tt>rowView</tt> without its <tt>data</tt> set, which breaks some views. If that happens to you, or the size of an empty <tt>rowView</tt> is smaller than a full one, measure the proper height and set <tt>preferredHeight</tt> on the <tt>rowView</tt>, or <tt>rowHeight</tt> on the <tt>ScrollView</tt>.</p>
      */}
    },
    {
      name: 'rowSizeTestE',
      hidden: true,
      documentation: 'If the <tt>rowHeight</tt> is not set, a <tt>rowView</tt> will be constructed and its height checked. This property holds that view so it can be destroyed properly.'
    },
    {
      type: 'ViewFactory',
      name: 'rowView',
      documentation: 'The view for each row. Can specify a <tt>preferredHeight</tt>, which will become the <tt>rowHeight</tt> for the <tt>ScrollView</tt> if <tt>rowHeight</tt> is not set explicitly.',
      postSet: function(_, nu) {
        var viewFactory, viewModel;
        if ( typeof nu === 'string' ) {
          viewModel = this.Y.lookup(nu);
          viewFactory = viewModel.create.bind(viewModel);
        } else {
          viewFactory = nu;
        }

        if ( this.rowHeight < 0 ) {
          this.rowHeight = viewFactory({ model: this.dao.model, data: this.dao.model.create(null, this.Y) }, this.Y).preferredHeight;
        }
      }
    },
    {
      name: 'containerE'
    },
    {
      name: 'scrollerE'
    },
    {
      name: 'viewportHeight',
      documentation: 'The height of the viewport <tt>div</tt>. Computed dynamically.'
    },
    {
      name: 'visibleRows',
      documentation: 'Map of currently visible rows, keyed by their index into the $$DOC{ref: ".cache"}.',
      factory: function() { return {}; }
    },
    {
      name: 'extraRows',
      documentation: 'Buffer of extra, unneeded visible rows. These will be the first to be reused if more rows are needed.',
      factory: function() { return []; }
    },
    {
      type: 'Array',
      name: 'cache',
      documentation: function() {/*
        <p>An array holding all the rows the <tt>ScrollView</tt> has loaded so far. Only a subset of these are visible (that is, rendered into a $$DOC{ref: "ScrollViewRow"} and stored in <tt>visibleRows</tt>).</p>

        <p>The indices are relative to the current DAO, including any ordering and filtering. A single contiguous range of rows are loaded into the cache at any one time, not necessarily including <tt>0</tt>. The top and bottom indices are given by $$DOC{ref: ".loadedTop"} and $$DOC{ref: ".loadedBottom"}.</p>
      */},
      factory: function() { return []; }
    },
    {
      name: 'loadedTop',
      documentation: 'Index of the first cached (not necessarily visible) value. There is always a contiguous block of loaded entries from <tt>loadedTop</tt> to $$DOC{ref: ".loadedBottom"}.',
      defaultValue: -1
    },
    {
      name: 'loadedBottom',
      documentation: 'Index of the last cached (not necessarily visible) value. There is always a contiguous block of loaded entries from $$DOC{ref: ".loadedTop"} to <tt>loadedBottom</tt>.',
      defaultValue: -1
    },
    {
      name: 'visibleTop',
      documentation: 'Index into the $$DOC{ref: ".cache"} of the first value that\'s visible. (That is, rendered into a $$DOC{ref: "ScrollViewRow"} and stored in $$DOC{ref: ".visibleRows"}.) May not actually be inside the viewport right now, rather in the runway.',
      defaultValue: 0
    },
    {
      name: 'visibleBottom',
      documentation: 'Index into the $$DOC{ref: ".cache"} of the last value that\'s visible. (That is, rendered into a $$DOC{ref: "ScrollViewRow"} and stored in $$DOC{ref: ".visibleRows"}.) May not actually be inside the viewport right now, rather in the runway.',
      defaultValue: 0
    },
    {
      name: 'daoUpdateNumber',
      documentation: 'Counts upwards with each $$DOC{ref: ".onDAOUpdate"}, so if many DAO updates come rapidly, only the most recent actually gets rendered.',
      defaultValue: 0,
      transient: true,
      hidden: true
    },
    {
      name: 'oldVisibleTop',
      documentation: 'Set by $$DOC{ref: ".allocateVisible"} after it has finished. Prevents duplicated work: no need to process the rows if nothing has moved since the last call.',
      defaultValue: -1
    },
    {
      name: 'oldVisibleBottom',
      documentation: 'Set by $$DOC{ref: ".allocateVisible"} after it has finished. Prevents duplicated work: no need to process the rows if nothing has moved since the last call.',
      defaultValue: -1
    },
    {
      name: 'spinnerBusyStatus',
      factory: function() {
        return this.BusyStatus.create();
      }
    },
    {
      name: 'busyComplete_'
    },
    {
      name: 'spinner',
      factory: function() {
        return this.SpinnerView.create({ data$: this.spinnerBusyStatus.busy$ });
      }
    }
  ],

  listeners: [
    {
      name: 'onResize',
      isMerged: 100,
      code: function() {
        this.viewportHeight = this.el().offsetHeight;
      }
    },
    {
      name: 'onScroll',
      code: function() {
        this.scrollTop = this.scrollerE.el().scrollTop;
        this.update();
      }
    },
    {
      name: 'onDAOUpdate',
      isFramed: true,
      documentation: 'When the DAO changes, we invalidate everything. All $$DOC{ref: ".visibleRows"} are recycled, the $$DOC{ref: ".cache"} is cleared, etc.',
      code: function() {
        this.invalidate();

        var oldComplete = this.busyComplete_;
        this.busyComplete_ = this.spinnerBusyStatus.start();
        oldComplete && oldComplete();

        this.dao.select(COUNT())(function(c) {
          this.count = c.count;

          // That will have updated the height of the inner view.
          var s = this.scrollerE.el();
          if ( s ) s.scrollTop = this.scrollTop;

          this.X.setTimeout(this.update.bind(this), 0);
        }.bind(this));
      }
    },
    {
      name: 'update',
      documentation: function() {/*
        <p>This is the cornerstone method. It is called when we scroll, and when the DAO changes.</p>

        <p>It computes, based on the current scroll position, what the visible range should be. It fetches any now-visible rows that are not in the $$DOC{ref: ".cache"}.</p>

        <p>The $$DOC{ref: ".cache"} outruns the visible area, generally keeping between 1 and 3 multiples of $$DOC{ref: ".runway"} from either edge of the visible area.</p>

        <p>As a final note, if there's a gap of unloaded rows between what should now be loaded, and what currently is, we just drop the old cache. This shouldn't happen in general; instead the loaded region grows in small chunks, or is completely replaced after the DAO updates.</p>
      */},
      code: function() {
        if (this.state !== this.LOADED) return;

        // Calculate visibleIndex based on scrollTop.
        // If the visible rows are inside the cache, just expand the cached area
        // to keep 3*runway rows on each side, up to the edges of the data.
        // If the visible rows have moved so vast that there is a gap, scrap the
        // old cache and rebuild it.
        if ( this.rowHeight < 0 ) return;
        var runwayCount = Math.ceil(this.runway / this.rowHeight);
        this.visibleIndex = Math.floor(this.scrollTop / this.rowHeight);
        this.visibleTop = Math.max(0, this.visibleIndex - runwayCount);
        this.visibleBottom = Math.min(this.count - 1,
            this.visibleIndex + Math.ceil( (this.runway + this.viewportHeight) / this.rowHeight ) );

        // Now, if the visible range is truncated, expand it. The only cases where truncation
        // can happen is if we're abutting one edge of the range or the other, so we just extend
        // the opposite end of the range until it fits the maximum set of rows.
        var maxVisible = Math.ceil((2 * this.runway + this.viewportHeight) / this.rowHeight);
        if ( this.visibleBottom - this.visibleTop + 1 < maxVisible ) {
          if ( this.visibleTop === 0 )
            this.visibleBottom = Math.min(maxVisible - 1, this.count - 1);
          else
            this.visibleTop = Math.max(0, this.visibleBottom - maxVisible + 1);
        }

        // Four cases:
        // Visible wholly contained.
        // Top overlap.
        // Bottom overlap.
        // No overlap.
        var toLoadTop, toLoadBottom;
        if ( this.visibleTop >= this.loadedTop && this.visibleBottom <= this.loadedBottom ) {
          // Wholly contained. Do nothing.
          // TODO: Maybe a little more optimistic padding here?
        } else if ( this.visibleTop < this.loadedTop && this.visibleBottom >= this.loadedTop ) {
          // Visible overlaps te top of loaded.
          toLoadBottom = this.loadedTop - 1;
          toLoadTop = Math.max(0, this.visibleTop - 2 * runwayCount);
        } else if ( this.visibleBottom > this.loadedBottom && this.visibleTop <= this.loadedBottom ) {
          toLoadTop = this.loadedBottom + 1;
          toLoadBottom = Math.min(this.count - 1, this.visibleBottom + 2 * runwayCount);
        } else {
          // No overlap. Fresh start.
          this.invalidate();
          toLoadTop = Math.max(0, this.visibleTop - 2 * runwayCount);
          toLoadBottom = Math.min(this.count, this.visibleBottom + 2 * runwayCount);
        }

        if ( toLoadTop >= 0 && toLoadBottom >= 0 && toLoadTop <= toLoadBottom ) {
          // Something to load.
          var self = this;
          var updateNumber = ++this.daoUpdateNumber;
          this.dao.skip(toLoadTop).limit(toLoadBottom - toLoadTop + 1).select([].sink)(function(a) {
            if ( updateNumber !== self.daoUpdateNumber ) return;
            if ( ! a || ! a.length ) return;

            // Tell the spinner controller we're done waiting.
            // No harm in multiple calls to this for the same spinner instance.
            self.busyComplete_();

            // If we're in read-write mode, clone everything before it goes in the cache.
            for ( var i = 0 ; i < a.length ; i++ ) {
              var o = a[i];
              if ( self.mode === 'read-write' ) {
                o = a[i].clone();
                o.addListener(function(x) {
                  // TODO(kgr): remove the deepClone when the DAO does this itself.
                  this.dao.put(x.deepClone());
                }.bind(self, o));
              }
              self.cache[toLoadTop + i] = o;
            }
            self.loadedTop = self.loadedTop >= 0 ? Math.min(toLoadTop, self.loadedTop) : toLoadTop;
            self.loadedBottom = Math.max(toLoadBottom, self.loadedBottom);

            self.allocateVisible();
          });
        } else {
          // Not loading anything, render what we have and stop the spinner if necessary.
          this.allocateVisible();
          this.busyComplete_();
        }
      }
    }
  ],

  methods: [
    function load() {
      this.SUPER();

      this.window.addEventListener('resize', this.onResize);
      this.onResize();

      if (this.gestureManager) this.gestureManager.install(this.scrollGesture);
      this.scrollerE.on('scroll', this.onScroll);

      if (this.rowHeight < 0) {
        var style = this.window.getComputedStyle(this.rowSizeTestE.children[0].el());
        this.rowHeight = this.X.parseFloat(style.height);

        this.rowSizeTestE.remove();
        this.rowSizeTestE = '';
      }

      this.onDAOUpdate();
    },

    // Allocates visible rows to the correct positions.
    // Will create new visible rows where necessary, and reuse existing ones.
    // Expects the cache to be populated with all the values necessary.
    function allocateVisible() {
      if ( this.visibleTop === this.oldVisibleTop && this.visibleBottom === this.oldVisibleBottom ) return;
      var homeless = [];
      var foundIDs = {};
      var self = this;

      // Run through the visible section and check if they're already loaded.
      for ( var i = this.visibleTop ; i <= this.visibleBottom ; i++ ) {
        if ( this.visibleRows[i] ) {
          foundIDs[i] = true;
        } else {
          homeless.push(i);
        }
      }

      // Now run through the visible rows, skipping those that were just touched,
      // and reusing the untouched ones for the homeless.
      var keys = Object.keys(this.visibleRows);
      for ( var i = 0 ; i < keys.length ; i++ ) {
        if ( homeless.length === 0 ) break;
        if ( foundIDs[keys[i]] ) continue;
        var h = homeless.shift();
        var r = self.visibleRows[keys[i]];
        delete self.visibleRows[keys[i]];
        self.visibleRows[h] = r;
        r.data = self.cache[h];
        r.y = h * self.rowHeight;
      }

      // Now if there are any homeless left, reuse those from extraRows,
      // or create new rows for them.
      if ( homeless.length ) {
        var toAdd = [];
        var newViews = [];
        for ( var i = 0 ; i < homeless.length ; i++ ) {
          var h = homeless[i];
          var x = self.cache[h];
          if ( ! x ) continue;

          if ( this.extraRows.length ) {
            var r = this.extraRows.shift();
            self.visibleRows[h] = r;
            r.data = x;
            r.y = h * self.rowHeight;
          } else {
            var v = this.rowView({ model: x.model_, data: x }, this.Y);
            var svr = self.ScrollViewRow.create({ data: x, rowHeight: self.rowHeight });
            self.visibleRows[h] = svr;

            toAdd.push(svr);
            //html.push('<div style="width: 100%; position: absolute; height: ' +
            //    self.rowHeight + 'px; overflow: visible" id="' + svr.id + '">');
            //html.push(v.toHTML());
            //html.push('</div>');
            //v.on('click', function() { self.selection = this.data; }, v.id);
            newViews.push([h, svr]);
            svr.view = v;
          }
        }

        for ( var i = 0 ; i < toAdd.length ; i++ ) {
          this.containerE.add(toAdd[i]);
        }

        for ( var i = 0 ; i < newViews.length ; i++ ) {
          var r = newViews[i];
          //r[1].view.initHTML();
          r[1].y = r[0] * self.rowHeight;
        }
      }

      // Make sure any extra rows are hidden so there's no overlap.
      for ( var i = 0 ; i < this.extraRows.length ; i++ ) {
        this.extraRows[i].y = -10000;
      }

      this.oldVisibleTop = this.visibleTop;
      this.oldVisibleBottom = this.visibleBottom;
    },

    // Strongest cleanup: Clears all caches, saved rows, etc. as well as the
    // usual View cleanup of listeners.
    function unload() {
      this.softCleanup();
      this.window.removeEventListener('resize', this.onResize);
      if (this.gestureManager) this.gestureManager.uninstall(this.scrollGesture);
    },

    // Cleans up all internal state in the ScrollView, but doesn't run the
    // general View unload() logic.
    // softCleanup() unload()s and removes all the ScrollViewRows.
    // Use softCleanup() when you essentially want a new ScrollView.
    function softCleanup() {
      var keys = Object.keys(this.visibleRows);
      for ( var i = 0; i < keys.length; i++ ) {
        this.visibleRows[keys[i]].remove();
      }
      this.visibleRows = {};

      for ( i = 0; i < this.extraRows.length; i++ ) {
        this.extraRows[i].remove();
      }
      this.extraRows = [];

      //if (this.containerE) { this.containerE.removeAllChildren(); }

      this.cache = [];
      this.loadedTop = -1;
      this.loadedBottom = -1;
      this.oldVisibleBottom = -1;
      this.oldVisibleTop = -1;
    },

    // Softest kind of ScrollView invalidation - cleans up cached data but
    // will reuse the rows. Generally you want this on a DAO change.
    function invalidate() {
      if ( this.visibleRows ) {
        var keys = Object.keys(this.visibleRows);
        for ( var i = 0 ; i < keys.length ; i++ ) {
          this.extraRows.push(this.visibleRows[keys[i]]);
        }
        this.visibleRows = {};
      }

      this.cache = [];
      this.loadedTop = -1;
      this.loadedBottom = -1;
      this.oldVisibleBottom = -1;
      this.oldVisibleTop = -1;
    },

    function initE() {
      this.cls(this.myCls());
      if (this.rowHeight < 0) {
        this.rowSizeTestE = this.start().style({ visibility: 'hidden' });
        this.rowSizeTestE.add(this.rowView({ data: this.model.create() }, this.Y));
        this.rowSizeTestE.end();
      }

      this.start().style({
        width: '100%',
        height: '100%',
        display: this.dynamic(function(busy) {
          return busy ? 'block' : 'none';
        }, this.spinnerBusyStatus.busy$),
      }).add(this.spinner).end();

      this.scrollerE = this.start().cls(this.myCls('scroller')).style({
        display: this.dynamic(function(busy) {
          return busy ? 'none' : 'block';
        }, this.spinnerBusyStatus.busy$)
      });

      this.containerE = this.scrollerE.start()
          .cls(this.myCls('inner'))
          .style({
            height: this.dynamic(function(height) {
              return height + 'px';
            }, this.scrollHeight$)
          });
      this.containerE.end();
      this.scrollerE.end();
    }
  ],

  templates: [
    function CSS() {/*
      ^ {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
        position: relative;
      }
      ^scroller {
        -webkit-overflow-scrolling: touch;
        flex-grow: 1;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        width: 100%;
      }
      ^inner {
        position: relative;
        transform: translate3d(0,0,0);
        width: 100%;
      }
    */}
  ],

  models: [
    {
      name: 'ScrollViewRow',
      extends: 'foam.u2.View',
      documentation: 'Wrapper for a single row in a ScrollView. Users should not need to create or manipulate these; they\'re internal to the ScrollView.',
      imports: [
        'dynamic',
        'scrollView'
      ],
      properties: [
        {
          name: 'data',
          postSet: function(old, nu) {
            this.view.data = nu;
          }
        },
        {
          name: 'view',
          postSet: function(old, nu) {
            if (nu) nu.data = this.data;
          }
        },
        {
          name: 'y',
        }
      ],

      methods: [
        function initE() {
          this.cls(this.myCls()).style({
            height: this.dynamic(function(h) {
              return h + 'px';
            }, this.scrollView.rowHeight$),
            transform: this.dynamic(function(y) {
              return 'translate3d(0px, ' + y + 'px, 0px)';
            }, this.y$)
          });

          this.add(this.view);
          this.on('click', this.onClick);
        }
      ],

      listeners: [
        function onClick() {
          this.scrollView.publish(this.scrollView.ROW_CLICK, this.data);
        }
      ],

      templates: [
        function CSS() {/*
          ^ {
            overflow: visible;
            position: absolute;
            width: 100%;
          }
        */}
      ]
    }
  ]
});
