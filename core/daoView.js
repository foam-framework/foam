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
        if ( this.mode === 'read-write' ) o = o.clone();
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
      type: 'Model'
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
    }
  ],

  templates: [
    function toHTML() {/*
      <div>
        <div id="%%id" style="height:<%= this.height %>px;overflow:hidden;position:relative">
          <%
            var verticalScrollbar = FOAM.lookup(this.verticalScrollbarView).create({
                scrollTop$ : this.scrollTop$,
                height$ : this.height$,
                scrollHeight$ : this.scrollHeight$,
            });

            this.addChild(verticalScrollbar);
            out(verticalScrollbar.toHTML());
          %>
        </div>
      </div>
    */},
  ],

  methods: {
    init: function() {
      this.SUPER();

      var touch = this.X.TouchInput;
      touch.subscribe(touch.TOUCH_START, this.onTouchStart);
      touch.subscribe(touch.TOUCH_END, this.onTouchEnd);
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
      var offset = Math.floor(skip * this.rowViewHeight - this.scrollTop);
      this.dao.skip(skip).limit(limit).select()(function(objs) {
        this.workingSet = objs;
        this.updateDOM(offset);
      }.bind(this));
    },
    initHTML: function() {
      this.SUPER();
      this.scroll();
      this.$.addEventListener('wheel', this.onWheel);
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() { this.scroll(); }
    },
    {
      name: 'scroll',
      code: function() {
        if ( ! this.$ ) return;
        this.sequenceNumber++;
        var limit = Math.floor((this.height + 2 * this.runway) / this.rowViewHeight) + 2;
        this.dao.select(COUNT())(function(c) {
          this.numRows = c.count;
          this.updateDOMWithNumRows(limit);
        }.bind(this));
      },
    },
    {
      name: 'onTouchStart',
      code: function(_, _, touch) {
        if ( ! this.touch ) this.touch = touch;
        var self = this;
        this.touch.y$.addListener(function(_, _, old, nu) {
          self.scrollTop = self.scrollTop + old - nu;
        });
      }
    },
    {
      name: 'onTouchEnd',
      code: function(_, _, touch) {
        if ( touch.id === this.touch.id ) {
          this.touch = '';
        }
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


MODEL({
  name: 'ArrayView',
  extendsModel: 'View',

  properties: [
    {
      name: 'model'
    },
    {
      name: 'data',
      factory: function() { return []; },
      postSet: function(_, data) { this.arrayDAO.array = data; }
    },
    {
      name: 'arrayDAO',
      factory: function() {
        return ArrayDAO.create({
          model: this.model,
          array: this.data
        });
      }
    },
    {
      name: 'subType',
      setter: function(subType) { this.model = subType; }
    },
    {
      name: 'daoView',
      factory: function() {
        return DAOController.create({ model: this.model });
      }
    }
  ],

  methods: {
    init: function(prop) {
      this.SUPER();
      this.daoView.dao = this.arrayDAO;
      console.assert(this.model, 'ArrayView requires subType/Model.');
    },
    toHTML:   function() { return this.daoView.toHTML(); },
    initHTML: function() { return this.daoView.initHTML(); }
  }
});
