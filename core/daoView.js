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
        if ( this.data !== dao ) this.data = dao;
      }
    }
  ],

  methods: {
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
      factory: function() { return ChoiceView.create(); }
    },
    {
      name: 'col',
      label: 'column',
      type: 'ChoiceView',
      factory: function() { return ChoiceView.create(); }
    },
    {
      name: 'acc',
      label: 'accumulator',
      type: 'ChoiceView',
      factory: function() { return ChoiceView.create(); }
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
      factory: function() { return GridByExpr.create(); }
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
      // TODO: I think this should be done automatically some-how/where.
      this.scrollModeView.data$ = this.scrollMode$;

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
    { model_: 'BooleanProperty', name: 'useSelection', defaultValue: false },
    'selection',
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
      var rowView = FOAM.lookup(this.rowView);

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
            this.dao.put(o);
          }.bind(this, o));
        }
        this.addChild(view);
        if ( this.useSelection ) {
          out.push('<div class="' + this.className + ' row' + '" id="' + this.on('click', (function() {
            this.selection = o
          }).bind(this)) + '">');
        }
        out.push(view.toHTML());
        if ( this.useSelection ) {
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

  properties: [
    {
      name: 'model',
      type: 'Model',
      defaultValueFn: function() {
        return this.dao.model;
      }
    },
    {
      name: 'runway',
      help: 'Elements that are within |runway| pixels of the scroll clip are retained.',
      model_: 'IntProperty',
      units: 'pixels',
      defaultValue: 500
    },
    {
      name: 'rowView',
      defaultValue: 'SummaryView'
    },
    {
      name: 'rowViews',
      factory: function() { return {}; }
    },
    {
      name: 'unclaimedRowViews',
      factory: function() { return []; }
    },
    {
      // TODO: Can we calculate this reliably?
      model_: 'IntProperty',
      name: 'rowViewHeight'
    },
    {
      model_: 'IntProperty',
      name: 'height'
    },
    {
      model_: 'IntProperty',
      name: 'scrollTop',
      defaultValue: 0,
      preSet: function(_, v) {
        if ( v < 0 )
          return 0;
        if (this.numRows)
          return Math.max(0, Math.min(v, (this.rowViewHeight * this.numRows) - this.height));
        return v;
      },
      postSet: function(old, nu) {
        this.scroll();
      }
    },
    {
      name: 'scrollHeight',
      dynamicValue: function() { return this.numRows * this.rowViewHeight; }
    },
    {
      name: 'sequenceNumber',
      hidden: true,
      defaultValue: 0
    },
    {
      name: 'workingSet',
      factory: function() { return []; }
    },
    {
      name: 'numRows',
      defaultValue: 0
    },
    {
      name: 'verticalScrollbarView',
      defaultValue: 'VerticalScrollbarView'
    },
    {
      model_: 'BooleanProperty',
      name: 'hidden',
      hidden: true,
      help: 'Set when we receive an ON_HIDE event.',
      defaultValue: false,
      postSet: function(_, hidden) {
        if ( this.dao && ! hidden ) this.onDAOUpdate();
      }
    },
    {
      name: 'workingSkip',
      defaultValue: -1,
      hidden: true,
      help: 'Records the last skip value used on the DAO, to limit select() calls'
    }
  ],

  templates: [
    function toHTML() {/*
      <div>
        <div id="%%id" style="overflow:hidden;position:relative">
          <%
            var verticalScrollbar = FOAM.lookup(this.verticalScrollbarView).create({
                scrollTop$ : this.scrollTop$,
                height$ : this.height$,
                scrollHeight$ : this.scrollHeight$,
            });

            out(verticalScrollbar);
          %>
        </div>
      </div>
    */},
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
    },
    formatObject: function(o) {
      var out = "";
      for ( var i = 0, prop; prop = this.model.properties[i]; i++ ) {
        if ( prop.summaryFormatter )
          out += prop.summaryFormatter(prop.f(o), o);
        else out += this.strToHTML(prop.f(o));
      }
      return out;
    },
    createOrReuseRowView: function(data) {
      if (this.unclaimedRowViews.length)
        return this.unclaimedRowViews.shift();
      var view = FOAM.lookup(this.rowView).create({ data: data });
      return {
        view: view,
        html: view.toHTML(),
        initialized: false,
        sequenceNumber: 0
      };
    },
    createOrReuseRowViews: function() {
      var uninitialized = [];
      var newHTML = "";

      for (var i = 0; i < this.workingSet.length; i++) {
        if (!this.rowViews[this.workingSet[i].id]) {
          var view = this.createOrReuseRowView(this.workingSet[i]);
          this.rowViews[this.workingSet[i].id] = view;
          view.view.data = this.workingSet[i];
          if (!view.initialized) {
            view.id = this.nextID();
            newHTML += '<div style="width:100%;position:absolute;height:'
                + this.rowViewHeight + 'px;overflow:visible" id="' + view.id
                + '">' + view.html + "</div>";
            uninitialized.push(view);
          }
        }
      }

      if (newHTML)
        this.$.lastElementChild.insertAdjacentHTML('afterend', newHTML);

      for (var i = 0; i < uninitialized.length; i++) {
        uninitialized[i].view.initHTML();
        uninitialized[i].initialized = true;
      }
    },
    positionRowViews: function(offset) {
      // Set the CSS3 transform for all visible rows.
      // FIXME: eventually get this from a physics solver.
      for (var i = 0; i < this.workingSet.length; i++) {
        // Need to get this element and set its transform
        var elementOffset = offset + (i * this.rowViewHeight);
        var row = this.rowViews[this.workingSet[i].id];
        var rowView = $(row.id);
        // TODO: need to generalize this transform stuff.
        rowView.style.webkitTransform = "translate3d(0px, " + elementOffset + "px, 0px)";
        row.sequenceNumber = this.sequenceNumber;
      }
    },
    recycleRowViews: function(offset) {
      for (var key in this.rowViews) {
        if (this.rowViews[key].sequenceNumber != this.sequenceNumber) {
          var row = this.rowViews[key];
          var rowView = $(row.id);
          rowView.style.webkitTransform = "scale(0)";
          this.unclaimedRowViews.push(this.rowViews[key]);
          delete this.rowViews[key];
        }
      }
    },
    updateDOM: function(offset) {
      this.createOrReuseRowViews();
      this.positionRowViews(offset);
      this.recycleRowViews(offset);
    },
    updateDOMWithNumRows: function(limit) {
      var skip = Math.max(Math.min(this.numRows - limit, Math.floor((this.scrollTop - this.runway) / this.rowViewHeight)), 0);
      if ( this.workingSkip != skip ) {
        console.log('skip from ' + this.workingSkip + ' to ' + skip);
        this.workingSkip = skip;
        var offset = Math.floor(skip * this.rowViewHeight - this.scrollTop);
        this.dao.skip(skip).limit(limit).select()(function(objs) {
          this.workingSet = objs;
          this.updateDOM(offset);
        }.bind(this));
      }
    },
    initHTML: function() {
      this.$.style.height = this.height ? this.height + 'px' : '100%';
      this.SUPER();
      this.scroll();
      this.$.addEventListener('wheel', this.onWheel);
      this.X.gestureManager.install(this.X.GestureTarget.create({
        element: this.$,
        handler: this,
        gesture: 'verticalScroll'
      }));
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() {
        this.dao.select(COUNT())(function(c) {
          this.numRows = c.count;
          this.scroll();
        }.bind(this));
      }
    },
    {
      name: 'scroll',
      code: function() {
        if ( ! this.$ ) return;
        this.sequenceNumber++;
        var limit = Math.floor((this.height + 2 * this.runway) / this.rowViewHeight) + 2;
        this.updateDOMWithNumRows(limit);
      },
    },
    {
      name: 'verticalScrollMove',
      code: function(dy, ty, y) {
        this.scrollTop -= dy;
        console.log('vsm');
      }
    },
    {
      name: 'onWheel',
      code: function(ev) {
        this.scrollTop += ev.deltaY;
        ev.preventDefault();
      }
    }
  ]
});


MODEL({
  name: 'ScrollViewRow',
  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( this.view ) {
          this.view.data = nu;
          var e = $(this.id);
          e.innerHTML = this.view.toHTML();
          this.view.initHTML();
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
        if ( this.view && this.id ) {
          $(this.id).style.webkitTransform = 'translate3d(0px,' + nu + 'px, 0px)';
        }
      }
    }
  ]
});

MODEL({
  name: 'ScrollView2',
  extendsModel: 'AbstractDAOView',

  properties: [
    {
      name: 'runway',
      defaultValue: 500,
      help: 'The distance in pixels to render outside the viewport'
    },
    {
      name: 'scrollHeight',
      dynamicValue: function() {
        return this.$ && this.count * this.rowHeight;
      },
      postSet: function(old, nu) {
        if ( this.$ ) this.scroller$().style.height = nu + 'px';
      }
    },
    {
      name: 'rowHeight',
      defaultValue: 60
    },
    {
      name: 'rowView'
    },
    {
      name: 'viewportHeight',
      defaultValueFn: function() {
        return this.$ && this.$.offsetHeight;
      }
    },
    {
      name: 'scrollTop',
      defaultValue: 0,
      preSet: function(old, nu) {
        if ( nu < 0 ) return 0;
        if ( nu > this.scrollHeight - this.viewportHeight )
          return this.scrollHeight - this.viewportHeight;
        return nu;
      },
      postSet: function(old, nu) {
        var scroller = this.scroller$();
        if ( scroller ) scroller.style.webkitTransform =
            'translate3d(0px, -' + nu + 'px, 0px)';
      }
    },
    {
      name: 'loadedIndex',
      help: 'The skip value for the top of loadedAbove.',
      defaultValue: 0
    },
    {
      name: 'bottomIndex',
      getter: function() {
        return this.loadedIndex + this.loadedAbove.length + this.visibleRows.length + this.loadedBelow.length;
      }
    },
    {
      name: 'loadedAbove',
      factory: function() { return []; }
    },
    {
      name: 'loadedBelow',
      factory: function() { return []; }
    },
    {
      name: 'visibleRows',
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
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      if ( ! this.$.style.height ) {
        this.$.style.height = '100%';
      }

      // Add scrollbar.
      var verticalScrollbar = FOAM.lookup(this.verticalScrollbarView).create({
          height: this.viewportHeight,
          scrollTop$ : this.scrollTop$,
          scrollHeight$ : this.scrollHeight$,
      });
      //Events.follow(this.viewportHeight$, verticalScrollbar.height$);
      this.$.innerHTML += verticalScrollbar.toHTML();
      this.X.setTimeout(function() { verticalScrollbar.initHTML(); }, 0);

      this.X.gestureManager.install(this.X.GestureTarget.create({
        element: this.$,
        handler: this,
        gesture: 'verticalScroll'
      }));
      this.onDAOUpdate();
    },
    scroller$: function() {
      return this.X.document.getElementById(this.scrollID);
    },
    container$: function() {
      return this.X.document.getElementById(this.containerID);
    },
    update: function() {
      if ( ! this.$ ) return;
      // If the visibleRows is empty, redraw everything.
      // If the most distant upward or downward node is inside the runway, redraw one.
      // If either direction is below the threshold, fetch more data.
      if ( ! this.visibleRows || ! this.visibleRows.length ) {
        // Select triple the runway above and below, plus the viewport.
        var skip = Math.max((this.scrollTop - 3 * this.runway) / this.rowHeight, 0);
        this.loadedIndex = skip;
        var roomAbove = Math.min(this.scrollTop, 3 * this.runway);
        var limit = Math.ceil((roomAbove + 3 * this.runway + this.viewportHeight) /
            this.rowHeight);
        var self = this;
        this.dao.skip(skip).limit(limit).select([])(function(a) {
          // a contains invisible above, runway above, viewport, runway below, and invisible below.
          // The invisible portions go in the loadedAbove/Below arrays as a zipper.
          // The visible portions get loaded into visibleRows.
          var invisibleAbove = Math.floor(Math.max(0, (roomAbove - self.runway) / self.rowHeight));
          for ( var i = 0 ; i < invisibleAbove ; i++ ) {
            self.loadedAbove.push(a.shift());
          }

          // Note that the above removed the invisible portions from the array.
          // Now the visible portion is two runways and the viewport.
          var visibleCount = Math.ceil( (self.viewportHeight + 2 * self.runway) / self.rowHeight ) + 1;
          // +1 above to make sure there's no feedback where elements
          // get repeatedly shuffled between top and bottom.
          var rowView = FOAM.lookup(self.rowView);
          var html = [];
          for ( i = 0 ; i < visibleCount ; i++ ) {
            var r = a.shift();
            var v = rowView.create({ model: r.model_, data: r });
            var svr = ScrollViewRow.create({ data: r, id: v.nextID() });
            self.visibleRows.push(svr);

            html.push('<div style="width: 100%; position: absolute; height: '
                + self.rowViewHeight + 'px; overflow: visible" id="' + svr.id
                + '">');
            html.push(v.toHTML());
            html.push('</div>');

            svr.view = v;
          }
          self.container$().innerHTML = html.join('');

          // Finally, push the remaining rows into loadedBelow.
          // They need to be reversed.
          while ( a.length ) {
            self.loadedBelow.push(a.pop());
          }

          // Now all three arrays are populated. We need to initHTML
          // all the newly-created elements, though.
          //self.X.window.setTimeout(function() {
            self.visibleRows.forEach(function(r, i) {
              r.view.initHTML();
              r.y = Math.max(self.scrollTop - self.runway, 0) + i * self.rowHeight;
            });
          //}, 1);
        });
      } else {
        // If we already have data loaded, we just checked for needing more above and below.
        while ( this.visibleRows[0].y > Math.max(this.scrollTop - this.runway, 0) ) {
          // Not enough runway above.
          // We reuse the bottom-most entry and move it to the top.
          var moving = this.visibleRows.pop();
          this.loadedBelow.push(moving.data);
          moving.data = this.loadedAbove.pop();
          moving.y = this.visibleRows[0].y - this.rowHeight;
          this.visibleRows.unshift(moving);

          // If we're short loaded rows above, fetch more.
          // Using setTimeout here because this shouldn't hold up the scroll frame.
          if ( this.loadedIndex > 0 && this.loadedAbove.length < this.runway / this.rowHeight ) {
            this.loadMoreAbove();
          }
        }

        while ( this.visibleRows[this.visibleRows.length-1].y + this.rowHeight < Math.min(this.scrollTop + this.runway + this.viewportHeight, this.scrollHeight) && (this.loadedBelow.length > 0 || this.bottomIndex < this.count ) ) {
          // Not enough runway below.
          // We reuse the top-most entry and move it to the top.
          var moving = this.visibleRows.shift();
          this.loadedAbove.push(moving.data);
          moving.data = this.loadedBelow.pop();
          moving.y = this.visibleRows[this.visibleRows.length-1].y + this.rowHeight;
          this.visibleRows.push(moving);

          // If we're short loaded rows below, fetch more.
          if ( this.bottomIndex < this.count && this.loadedBelow.length < this.runway / this.rowHeight ) {
            this.loadMoreBelow();
          }
        }
        // We've now successfully updated, where necessary.
      }
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() {
        this.dao.select(COUNT())(function(c) {
          this.count = c.count;
          this.X.setTimeout(this.update.bind(this), 0);
        }.bind(this));
      }
    },
    {
      name: 'loadMoreAbove',
      isAnimated: true,
      code: function() {
        var max = 2 * this.runway / this.rowHeight;
        var old = this.loadedIndex;
        this.loadedIndex = Math.max(0, this.loadedIndex - max);
        this.dao.skip(this.loadedIndex).limit(old - this.loadedIndex).select([])(function(a) {
          this.loadedIndex -= a.length;
          this.loadedAbove.forEach(function(r) { a.push(r); });
          this.loadedAbove = a;
          this.update();
        }.bind(this));
      }
    },
    {
      name: 'loadMoreBelow',
      isAnimated: true,
      code: function() {
        var max = 2 * this.runway / this.rowHeight;
        this.dao.skip(this.bottomIndex).limit(max).select([])(function(a) {
          var nu = [];
          // Reverse the order of the fetched rows.
          while ( a.length ) { nu.push(a.pop()); }
          // But keep the order of the existing zipper.
          this.loadedBelow.forEach(function(r) { nu.push(r); });
          this.loadedBelow = nu;
        }.bind(this));
      }
    },
    {
      name: 'verticalScrollMove',
      code: function(dy, ty, y) {
        this.scrollTop -= dy;
        this.update(); // TODO: Maybe run this in setTimeout, or make update an animated listener?
        // We want the vsm callback to be very fast so scrolling is responsive.
        // I'll leave it here for now and see whether frames are dropping.
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <div>
        <div id="%%id" style="overflow:hidden;position:relative">
          <div id="%%scrollID" style="position:absolute;width:100%">
            <div id="%%containerID" style="position:relative;width:100%;height:100%">
            </div>
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
        if ( typeof v === 'string' ) v = FOAM.lookup(v);
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
