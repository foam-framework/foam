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
  name: 'AbstractDAOView',

  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      postSet: function(oldDAO, dao) {
        if ( this.dao !== dao ) this.dao = dao;
      }
    },
    {
      model_: 'DAOProperty',
      name: 'dao',
      label: 'DAO',
      help: 'An alias for the data property.',
      onDAOUpdate: 'onDAOUpdate',
      postSet: function(oldDAO, dao) {
        if ( this.data !== dao ) {
          this.data = dao;
          this.X.daoViewCurrentDAO = dao;
        }
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.X = this.X.sub({ daoViewCurrentDAO: this.dao });
    },
    onDAOUpdate: function() {}
  }
});


MODEL({
  name: 'GridView',

  extendsModel: 'AbstractDAOView',

  properties: [
    {
      name: 'row',
      type: 'ChoiceView',
      factory: function() { return this.X.ChoiceView.create(); }
    },
    {
      name: 'col',
      label: 'column',
      type: 'ChoiceView',
      factory: function() { return this.X.ChoiceView.create(); }
    },
    {
      name: 'acc',
      label: 'accumulator',
      type: 'ChoiceView',
      factory: function() { return this.X.ChoiceView.create(); }
    },
    {
      name: 'accChoices',
      label: 'Accumulator Choices',
      type: 'Array',
      factory: function() { return []; }
    },
    {
      name: 'scrollMode',
      type: 'String',
      defaultValue: 'Bars',
      view: { model_: 'ChoiceView', choices: [ 'Bars', 'Warp' ] }
    },
    {
      name: 'model',
      type: 'Model'
    },
    {
      name: 'grid',
      type: 'GridByExpr',
      factory: function() { return this.X.GridByExpr.create(); }
    }
  ],

  // TODO: need an 'onChange:' property to handle both value
  // changing and values in the value changing

  // TODO: listeners should be able to mark themselves as mergable
  // or updatable on 'animate', ie. specify decorators
  methods: {
    filteredDAO: function() { return this.dao; },

    updateHTML: function() {
      if ( this.initialized_ && ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
      if ( ! this.$ ) return;

      var self = this;
      this.grid.xFunc = this.col.data || this.grid.xFunc;
      this.grid.yFunc = this.row.data || this.grid.yFunc;
      this.grid.acc   = this.acc.data || this.grid.acc;

      this.filteredDAO().select(this.grid.clone())(function(g) {
        if ( self.scrollMode === 'Bars' ) {
          console.time('toHTML');
          var html = g.toHTML();
          console.timeEnd('toHTML');
          self.$.innerHTML = html;
          g.initHTML();
        } else {
          var cview = this.X.GridCView.create({grid: g, x:5, y: 5, width: 1000, height: 800});
          self.$.innerHTML = cview.toHTML();
          cview.initHTML();
          cview.paint();
        }
      });
    },

    initHTML: function() {
      var choices = [
        [ { f: function() { return ''; } }, 'none' ]
      ];
      this.model.properties.orderBy(Property.LABEL).select({put: function(p) {
        choices.push([p, p.label]);
      }});
      this.row.choices = choices;
      this.col.choices = choices;

      this.acc.choices = this.accChoices;

      this.row.initHTML();
      this.col.initHTML();
      this.acc.initHTML();

      this.SUPER();

      this.row.data$.addListener(this.onDAOUpdate);
      this.col.data$.addListener(this.onDAOUpdate);
      this.acc.data$.addListener(this.onDAOUpdate);
      this.scrollMode$.addListener(this.onDAOUpdate);

      this.initialized_ = true;
      this.updateHTML();
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      isAnimated: true,
      code: function() { this.updateHTML(); }
    }
  ],

  templates:[
    /*
    {
      model_: 'Template',

      name: 'toHTML2',
      description: 'TileView',
      template: '<div class="column expand">' +
        '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %><br/></div>' +
        '<div id="<%= this.id%>" class="gridViewArea column" style="flex: 1 1 100%"></div>' +
        '</div>'
    },
    */
    {
      model_: 'Template',

      name: 'toHTML',
      description: 'TileView',
      template: '<div class="column expand">' +
        '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %> &nbsp;Scroll: $$scrollMode <br/></div>' +
        '<div id="<%= this.id%>" class="gridViewArea column" style="flex: 1 1 100%"></div>' +
        '</div>'
    }
  ]
});


MODEL({
  name: 'ArrayTileView',

  extendsModel: 'AbstractDAOView',

  properties: [
    {
      name: 'property'
    },
    {
      name: 'tileView'
    },
    {
      name: 'lastView'
    },
    {
      model_: 'BooleanProperty',
      name: 'painting',
      defaultValue: false
    }
  ],

  methods: {
    toHTML: function() {
      this.on('click', this.onClick, this.id);

      return '<ul id="' + this.id + '" class="arrayTileView"><li class="arrayTileLastView">' +
        this.lastView.toHTML() + '</li></ul>';
    },
    initHTML: function() {
      this.SUPER();

      this.lastView.initHTML();
      this.paint();
      this.$.ownerDocument.defaultView.addEventListener('resize', this.layout);
    },
  },

  listeners: [
    {
      // Clicking anywhere in the View should give focus to the
      // lastView.
      name: 'onClick',
      code: function() { this.lastView.focus(); }
    },
    {
      name: 'layout',
      isAnimated: true,
      code: function() {
        if ( ! this.$ ) return;
        var last = this.$.lastChild;
        last.style.width = '100px';
        last.style.width = 100 + last.parentNode.clientWidth -
          (last.offsetWidth + last.offsetLeft) - 4 /* margin */ - 75;
        this.painting = false;
      }
    },
    {
      name: 'paint',
      isAnimated: true,
      code: function() {
        // If we're currently painting, don't actually paint now,
        // queue up another paint on the next animation frame.
        // This doesn't spin infinitely because paint is set to animate: true,
        // meaning that it's merged to the next animation frame.
        if ( this.painting ) {
          this.paint();
          return;
        }

        this.painting = true;
        this.children = [];
        var value = this.data;
        var count = value.length;
        var self  = this;
        var render = function() {
          while ( self.$.firstChild !== self.$.lastChild ) {
            self.$.removeChild(self.$.firstChild);
          }

          var temp = document.createElement('div');
          temp.style.display = 'None';
          self.$.insertBefore(temp, self.$.lastChild);
          temp.outerHTML = self.children.map(
            function(c) { return '<li class="arrayTileItem">' + c.toHTML() + '</li>'; }).join('');
          self.children.forEach(
            function(c) { c.initHTML(); });
          self.layout();
        };

        if ( value.length == 0 ) {
          render();
        } else {
          self.$.style.display = '';
        }

        for ( var i = 0; i < value.length; i++ ) {
          this.dao.find(EQ(this.property, value[i]), {
            put: function(obj) {
              var view = self.tileView.create();
              view.data = obj;
              view.subscribe('remove', self.onRemove);
              self.addChild(view);
              count--;
              if ( count == 0 ) render();
            },
            error: function() {
              // Ignore missing values
              count--;
              if ( count == 0 ) render();
            },
          });
        }
      }
    },
    {
      name: 'onRemove',
      code: function(src, topic, obj) {
        var self = this;
        this.data = this.data.removeF({
          f: function(o) {
            return o === self.property.f(obj);
          }
        });
      }
    }
  ]
});


MODEL({
  name: 'DAOListView',
  extendsModel: 'AbstractDAOView',

  properties: [
    {
      model_: 'BooleanProperty',
      name: 'hidden',
      defaultValue: false,
      postSet: function(_, hidden) {
        if ( this.dao && ! hidden ) this.onDAOUpdate();
      }
    },
    { name: 'rowView', defaultValue: 'DetailView' },
    {
      name: 'mode',
      defaultValue: 'read-write',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); }
      }
    },
    {
      name: 'useSelection',
      help: 'Backward compatibility for selection mode. Create a X.selection$ value in your context instead.',
      postSet: function(old, nu) {
        if (this.useSelection && !this.X.selection$)
        {
           this.X.selection$ = this.X.SimpleValue.create();
        }
        this.selection$ = this.X.selection$;
      }
    },
    {
      name: 'selection',
      help: 'Backward compatibility for selection mode. Create a X.selection$ value in your context instead.',
      factory: function() {
        return this.X.SimpleValue.create();
      }
    },
    {
      name: 'scrollContainer',
      help: 'Containing element that is responsible for scrolling.'
    },
    {
      name: 'chunkSize',
      defaultValue: 0,
      help: 'Number of entries to load in each infinite scroll chunk.'
    },
    {
      name: 'chunksLoaded',
      hidden: true,
      defaultValue: 1,
      help: 'The number of chunks currently loaded.'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      this.subscribe(this.ON_HIDE, function() {
        self.hidden = true;
      });

      this.subscribe(this.ON_SHOW, function() {
        self.hidden = false;
      });

      // bind to selection, if present
      if (this.X.selection$) {
        this.selection$ = this.X.selection$;
      }
    },

    initHTML: function() {
      this.SUPER();

      // If we're doing infinite scrolling, we need to find the container.
      // Either an overflow: scroll element or the window.
      // We keep following the parentElement chain until we get null.
      if ( this.chunkSize > 0 ) {
        var e = this.$;
        while ( e ) {
          if ( window.getComputedStyle(e).overflow === 'scroll' ) break;
          e = e.parentElement;
        }
        this.scrollContainer = e || window;
        this.scrollContainer.addEventListener('scroll', this.onScroll, false);
      }

      if ( ! this.hidden ) this.updateHTML();
    },

    updateHTML: function() {
      if ( ! this.dao || ! this.$ ) return;
      if ( this.painting ) return;
      this.painting = true;

      var out = [];
      var rowView = FOAM.lookup(this.rowView, this.X);

      this.children = [];
      this.initializers_ = [];

      var d = this.dao;
      if ( this.chunkSize ) {
        d = d.limit(this.chunkSize * this.chunksLoaded);
      }
      d.select({put: function(o) {
        if ( this.mode === 'read-write' ) o = o.model_.create(o); //.clone();
        var view = rowView.create({data: o, model: o.model_}, this.X);
        // TODO: Something isn't working with the Context, fix
        view.DAO = this.dao;
        if ( this.mode === 'read-write' ) {
          o.addListener(function() {
            // TODO(kgr): remove the deepClone when the DAO does this itself.
            this.dao.put(o.deepClone());
          }.bind(this, o));
        }
        this.addChild(view);
        if ( this.X.selection$ ) {
          out.push('<div class="' + this.className + '-row' + '" id="' + this.on('click', (function() {
            this.selection = o;
          }).bind(this)) + '">');
        }
        out.push(view.toHTML());
        if ( this.X.selection$ ) {
          out.push('</div>');
        }
      }.bind(this)})(function() {
        var e = this.$;

        if ( ! e ) return;

        e.innerHTML = out.join('');
        this.initInnerHTML();
        this.children = [];
        this.painting = false;
      }.bind(this));
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() {
        this.realDAOUpdate();
      }
    },
    {
      name: 'realDAOUpdate',
      isAnimated: true,
      code: function() { if ( ! this.hidden ) this.updateHTML(); }
    },
    {
      name: 'onScroll',
      code: function() {
        var e = this.scrollContainer;
        if ( this.chunkSize > 0 && e.scrollTop + e.offsetHeight >= e.scrollHeight ) {
          this.chunksLoaded++;
          this.updateHTML();
        }
      }
    }
  ]
});


MODEL({
  name: 'ScrollViewRow',
  documentation: 'Wrapper for a single row in a $$DOC{ref: "ScrollView"}. Users should not need to create these. TODO: I should be a submodel of ScrollView once that\'s possible.',
  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( this.view ) {
          this.view.data = nu;
          // DetailViews will update on data changing, but others won't.
          if ( ! DetailView.isInstance(this.view) ) {
            var e = $(this.id);
            e.innerHTML = this.view.toHTML();
            this.view.initHTML();
          }
        }
      }
    },
    {
      name: 'view',
      postSet: function(old, nu) {
        if ( nu ) nu.data = this.data;
      }
    },
    {
      name: 'id',
    },
    {
      name: 'y',
      postSet: function(old, nu) {
        if ( this.view && this.id && old !== nu ) {
          $(this.id).style.webkitTransform = 'translate3d(0px,' + nu + 'px, 0px)';
        }
      }
    }
  ],
  methods: {
    destroy: function() {
      this.view.destroy();
    }
  }
});

/**
 * A general purpose view for scrolling content.
 *
 * TODO: Horizontal scrolling.
 * TODO: Non-overlay scrollbars (we currently don't account for
 * scrollbar size).
 * TODO: Graceful, customizable strategy for coping with a slow DAO. E.g., show
 * tombstones (if the # of rows is available), or a pacifier view while the
 * content is being fetched.
 */
MODEL({
  name: 'ScrollView',
  extendsModel: 'AbstractDAOView',

  documentation: function() {/*
    <p>Infinite scrolling view. Expects a $$DOC{ref: ".dao"} and displays a subset of the data at a time, minimizing the amount of DOM creation and manipulation.</p>

    <p>60fps when scrolling, generally drops one frame every time more data is rendered.</p>

    <p>The required properties are $$DOC{ref: ".dao"} and $$DOC{ref: ".rowView"}.</p>

    <p>The <tt>rowView</tt> <strong>must</strong> have a fixed vertical size. That size is determined in one of three ways:</p>

    <ul>
    <li>The user specifies $$DOC{ref: ".rowHeight"}.
    <li>The $$DOC{ref: ".rowView"} specifies <tt>preferredHeight</tt>.
    <li>The <tt>ScrollView</tt> will create an instance of the $$DOC{ref: ".rowView"} with no data, insert it into the DOM, let it render, and measure its size. This can be flaky for some <tt>View</tt>s, so if you run into sizing problems, add a <tt>preferredHeight</tt> property with a <tt>defaultValue</tt> on the $$DOC{ref: ".rowView"}'s model.
    </ul>
  */},

  properties: [
    {
      name: 'model',
      documentation: 'The model for the data. Defaults to the DAO\'s model.',
      defaultValueFn: function() { return this.dao.model; }
    },
    {
      name: 'runway',
      defaultValue: 500,
      documentation: 'The distance in pixels to render on either side of the viewport. Defaults to 500.'
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
      documentation: 'The total height of the scrollable pane. Generally <tt>count * rowHeight</tt>.',
      postSet: function(old, nu) {
        if ( this.$ ) this.scroller$().style.height = nu + 'px';
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
      name: 'rowSizeView',
      hidden: true,
      documentation: 'If the <tt>rowHeight</tt> is not set, a <tt>rowView</tt> will be constructed and its height checked. This property holds that view so it can be destroyed properly.'
    },
    {
      name: 'rowView',
      documentation: 'The view for each row. Can specify a <tt>preferredHeight</tt>, which will become the <tt>rowHeight</tt> for the <tt>ScrollView</tt> if <tt>rowHeight</tt> is not set explicitly.',
      postSet: function(_, nu) {
        var view = FOAM.lookup(nu, this.X);
        if ( view.PREFERRED_HEIGHT && this.rowHeight < 0 )
          this.rowHeight = view.create({ model: this.dao.model }).preferredHeight;
      }
    },
    {
      name: 'viewportHeight',
      documentation: 'The height of the viewport <tt>div</tt>. Computed dynamically.',
      defaultValueFn: function() {
        return this.$ && this.$.offsetHeight;
      }
    },
    {
      name: 'scrollTop',
      defaultValue: 0,
      documentation: 'The current vertical scroll position. Changing this updates the <tt>translate3d</tt>.',
      preSet: function(old, nu) {
        if ( nu < 0 ) return 0;
        if ( this.scrollHeight > 0 && this.viewportHeight > 0 &&
            nu > this.scrollHeight - this.viewportHeight )
          return this.scrollHeight - this.viewportHeight;
        return nu;
      },
      postSet: function(old, nu) {
        var scroller = this.scroller$();
        if ( scroller ) scroller.style.webkitTransform =
            'translate3d(0px, -' + nu + 'px, 0px)';
        this.update();
      }
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
      name: 'cache',
      model_: 'ArrayProprety',
      documentation: function() {/*
        <p>An array holding all the rows the <tt>ScrollView</tt> has loaded so far. Only a subset of these are visible (that is, rendered into a $$DOC{ref: "ScrollViewRow"} and stored in <tt>visibleRows</tt>).</p>

        <p>The indices are relative to the current DAO, including any ordering and filtering. A single contiguous range of rows are loaded into the cache at any one time, not necessarily including <tt>0</tt>. The top and bottom indices are given by $$DOC{ref: ".loadedTop"} and $$DOC{ref: ".loadedBottom"}.</p>
      */},
      factory: function() { return []; }
    },
    {
      name: 'scrollID',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'containerID',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'verticalScrollbarView',
      defaultValue: 'VerticalScrollbarView'
    },
    {
      name: 'verticalScrollbar',
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
      name: 'mode',
      defaultValue: 'read-write',
      documentation: 'Indicates whether this view should be read-write or read-only. In read-write mode, listens for changes to every visible row, and updates the DAO if they change.',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); }
      }
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
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      if ( ! this.$.style.height ) {
        this.$.style.height = '100%';
      }

      // Grab the height of the -rowsize div, then drop that div.
      if ( this.rowHeight < 0 ) {
        var outer = this.X.$(this.id + '-rowsize');
        var style = this.X.window.getComputedStyle(outer.children[0]);
        this.rowHeight = this.X.parseFloat(style.height);

        // Now destroy it properly.
        this.rowSizeView.destroy();
        this.rowSizeView = '';
        outer.outerHTML = '';
      }

      // Add scrollbar.
      this.verticalScrollbar = FOAM.lookup(this.verticalScrollbarView, this.X).create({
          height: this.viewportHeight,
          scrollTop$ : this.scrollTop$,
          scrollHeight$ : this.scrollHeight$,
      });
      this.$.insertAdjacentHTML('beforeend', this.verticalScrollbar.toHTML());
      this.X.setTimeout(function() { this.verticalScrollbar.initHTML(); }.bind(this), 0);

      // Force the scrollTop to reset.
      var oldScroll = this.scrollTop;
      this.scrollTop = 0;
      this.scrollTop = oldScroll;

      this.onDAOUpdate();
    },
    scroller$: function() {
      return this.X.document.getElementById(this.scrollID);
    },
    container$: function() {
      return this.X.document.getElementById(this.containerID);
    },
    // Allocates visible rows to the correct positions.
    // Will create new visible rows where necessary, and reuse existing ones.
    // Expects the cache to be populated with all the values necessary.
    allocateVisible: function() {
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
        var html = [];
        var newViews = [];
        var rowView = FOAM.lookup(this.rowView, this.X);
        for ( var i = 0 ; i < homeless.length ; i++ ) {
          var h = homeless[i];
          var x = self.cache[h];

          if ( this.extraRows.length ) {
            var r = this.extraRows.shift();
            self.visibleRows[h] = r;
            r.data = x;
            r.y = h * self.rowHeight;
          } else {
            var v = rowView.create({ model: x.model_, data: x });
            var svr = ScrollViewRow.create({ data: x, id: v.nextID() });
            self.visibleRows[h] = svr;

            html.push('<div style="width: 100%; position: absolute; height: ' +
                self.rowHeight + 'px; overflow: visible" id="' + svr.id + '">');
            html.push(v.toHTML());
            html.push('</div>');
            newViews.push([h, svr]);
            svr.view = v;
          }
        }

        if ( html.length )
          this.container$().insertAdjacentHTML('beforeend', html.join(''));

        // Finally, initHTML the new elements.
        for ( var i = 0 ; i < newViews.length ; i++ ) {
          var r = newViews[i];
          r[1].view.initHTML();
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

    // Clears all caches and saved rows and everything.
    destroy: function() {
      this.SUPER();
      var keys = Object.keys(this.visibleRows);
      for ( var i = 0; i < keys.length; i++ ) {
        this.visibleRows[keys[i]].destroy();
      }
      this.visibleRows = {};

      for ( i = 0; i < this.extraRows.length; i++ ) {
        this.extraRows[i].destroy();
      }
      this.extraRows = [];

      if ( this.verticalScrollbar ) {
        Events.unlink(this.verticalScrollbar.scrollTop$, this.scrollTop$);
        Events.unlink(this.verticalScrollbar.scrollHeight$, this.scrollHeight$);
        this.verticalScrollbar.destroy();
        this.verticalScrollbar = '';
      }

      this.cache = [];
      this.loadedTop = -1;
      this.loadedBottom = -1;
      this.oldVisibleBottom = -1;
      this.oldVisibleTop = -1;
    },

    // Clears all cached data, when the DAO changes.
    // Allows reuse of the rows.
    invalidate: function() {
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
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      documentation: 'When the DAO changes, we invalidate everything. All $$DOC{ref: ".visibleRows"} are recycled, the $$DOC{ref: ".cache"} is cleared, etc.',
      code: function() {
        this.invalidate();
        this.dao.select(COUNT())(function(c) {
          this.count = c.count;
          this.X.setTimeout(this.update.bind(this), 0);
        }.bind(this));
      }
    },
    {
      name: 'update',
      isAnimated: true,
      documentation: function() {/*
        <p>This is the cornerstone method. It is called when we scroll, and when the DAO changes.</p>

        <p>It computes, based on the current scroll position, what the visible range should be. It fetches any now-visible rows that are not in the $$DOC{ref: ".cache"}.</p>

        <p>The $$DOC{ref: ".cache"} outruns the visible area, generally keeping between 1 and 3 multiples of $$DOC{ref: ".runway"} from either edge of the visible area.</p>

        <p>As a final note, if there's a gap of unloaded rows between what should now be loaded, and what currently is, we just drop the old cache. This shouldn't happen in general; instead the loaded region grows in small chunks, or is completely replaced after the DAO updates.</p>
      */},
      code: function() {
        if ( ! this.$ ) return;
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
          if ( this.visibleTop === 0 ) this.visibleBottom = Math.min(maxVisible - 1, this.count - 1);
          else this.visibleTop = Math.max(0, this.visibleBottom - this.count + 1);
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
          this.dao.skip(toLoadTop).limit(toLoadBottom - toLoadTop + 1).select([])(function(a) {
            if ( ! a || ! a.length ) return;
            if ( updateNumber !== self.daoUpdateNumber ) return;

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
          this.allocateVisible();
        }
      }
    },
    {
      name: 'verticalScrollMove',
      code: function(dy, ty, y, stopMomentum) {
        this.scrollTop -= dy;

        // Cancel the momentum if we've reached the edge of the viewport.
        if ( stopMomentum && (
            this.scrollTop === 0 ||
            this.scrollTop + this.viewportHeight === this.scrollHeight ) ) {
          stopMomentum();
        }
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <% this.destroy();
         var gestureTarget = this.X.GestureTarget.create({
           container: this,
           handler: this,
           gesture: 'verticalScrollMomentum'
         });
         this.X.gestureManager.install(gestureTarget);
         this.addDestructor(function() {
           self.X.gestureManager.uninstall(gestureTarget);
         });
      %>
      <div id="%%id" style="overflow:hidden;position:relative">
        <% if ( this.rowHeight < 0 ) { %>
          <div id="<%= this.id + '-rowsize' %>" style="visibility: hidden">
            <%
              this.rowSizeView = FOAM.lookup(this.rowView, this.X).create({ data: this.dao.model.create() });
              out(this.rowSizeView.toHTML());
              this.addChild(this.rowSizeView);
            %>
          </div>
        <% } %>
        <div id="%%scrollID" style="position:absolute;width:100%">
          <div id="%%containerID" style="position:relative;width:100%;height:100%">
          </div>
        </div>
      </div>
    */},
  ]
});


MODEL({
  name: 'PredicatedView',
  extendsModel: 'View',

  properties: [
    {
      name: 'dao',
      help: 'Payload of the view; assumed to be a DAO.'
    },
    {
      name: 'predicate',
      defaultValueFn: function() { return TRUE; },
      postSet: function(_, p) { this.predicatedDAO = this.dao.where(p); }
    },
    {
      model_: 'DAOProperty',
      name: 'predicatedDAO'
    },
    {
      name: 'view',
      required: true,
      preSet: function(_, v) {
        if ( typeof v === 'string' ) v = FOAM.lookup(v, this.X);
        this.children = [v];
        v.data = v.dao = this.predicatedDAO$Proxy;
        return v;
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.X = this.X.sub({DAO: this.predicatedDAO$Proxy});
    },
    toHTML: function() { return this.view.toHTML(); },
    initHTML: function() { this.view.initHTML(); }
  }
});
