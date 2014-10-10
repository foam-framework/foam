// Extend this View when making alternate RowViews in order to inherit the removeRow action.
// TODO: consider inheriting actions from parent and/or Context instead.
MODEL({
  name: 'DefaultRowView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data'
    },
    {
      name: 'className',
      defaultValue: 'DefaultRowView'
    }
  ],

  templates: [
    function CSS() {/*
      .DefaultRowView {
        white-space: nowrap;
      }
    */},
    function toInnerHTML() {/* %%data $$removeRow */}
  ],

  actions: [
    {
      name: 'removeRow',
      label: '',
      iconUrl: 'images/ic_clear_black_24dp.png',
      action: function() { this.__ctx__.removeRow(this.data); }
    }
  ]
});


MODEL({
  name: 'DefaultACRowView',
  extendsModel: 'View',

  properties: [ 'data' ],

  templates: [
    function toInnerHTML() {/* %%data.id */}
  ]
});


MODEL({
  name: 'AddRowView',
  extendsModel: 'View',

  traits: ['PositionedDOMViewTrait', 'VerticalScrollNativeTrait'],

  properties: [
    {
      name: 'data'
    },
    {
      model_: 'DAOProperty',
      name: 'dao',
      view: 'DAOListView'
    },
    {
      // TODO: DAO should be pre-limited instead
      name: 'limit',
      defaultValue: 40
    },
    {
      name: 'className',
      defaultValue: 'AddRowView'
    },
    {
      name: 'bodyId',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'scrollerID',
      factory: function() { return this.nextID(); }
    }
  ],

  templates: [
    function CSS() {/*
      .AddRowView {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: #e1e1e1;
        overflow: hidden;
      }
      .AddRowView .arvHeader {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #d2d2d2;
        background: #fff;
        flex-grow: 0;
        flex-shrink: 0;
      }
      .AddRowView .arvBody {
        flex-grow: 1;
        overflow-y: auto;
      }
      .AddRowView canvas {
        background: #3e50b4;
      }
      .AddRowView input {
        outline: none;
        border: none;
        font-size: 17px;
        flex-grow: 1;
        margin: 0 0 0 12px;
        padding: 0;
      }
      .AddRowView .rows {
        width: 100%;
        border: none;
      }
      .AddRowView .rows-row {
        padding: 0 12px 0 16px;
      }
    */},
    function toInnerHTML() {/*
      <div class="arvHeader">
        $$close $$data
      </div>
      <div class="arvBody" id="%%bodyId">
        $$dao{ model_: 'DAOListView', className: 'rows', tagName: 'div', useSelection: true, rowView: { create: this.__ctx__.rowView } }
      </div>
    */}
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.data$.addListener(function() { this.close(); }.bind(this));
      this.softValue = DomValue.create(this.dataView.$, 'input');
      this.softValue.addListener(function() {
        var data = this.softValue.get();
        var src  = this.__ctx__.dao.limit(this.limit);
        var dao  = src.where(data ? this.__ctx__.queryFactory(data) : TRUE);

        var self = this;
        dao.limit(2).select()(function(objs) {
          self.dao = ( objs.length === 1 && objs[0].id === data /* self.f(objs[0]) === data */ ) ? src.where(FALSE) : dao;
        });
      }.bind(this));
      this.dao = this.__ctx__.dao.limit(this.limit);
    },

    initInnerHTML: function() {
      this.SUPER();

      this.daoView.selection$.addListener(function(_, _, _, data) {
        this.data = data.id;
      }.bind(this));
    }
  },

  listeners: [
    {
      name: 'onClick',
      code: function(e) {
        debugger;
      }
    }
  ],

  actions: [
    {
      name: 'close',
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png',
      action: function(__ctx__) {
        // Don't close twice.
        if ( this.closed_ ) return;
        this.closed_ = true;

        // Hack: If you click on one of the labels the data will be updated twice:
        //  once when then text field gets the onBlur event and once when
        //  selecting the label sets it.  In this case, we only want the second
        //  value which will contain the full label text.  So we delay by a bit to give
        //  the second update time to happen.
        this.__ctx__.setTimeout(function() {
          __ctx__.addRow(this.data);
          __ctx__.stack.back();
        }.bind(this), 150);
      }
    }
  ]
});


// TODO: Take auto-complete information from autocompleter in Property.
MODEL({
  name: 'AutocompleteListView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      postSet: function(oldValue, newValue) {
        this.updateHTML();
      }
    },
    {
      model_: 'DAOProperty',
      name: 'srcDAO'
    },
    {
      name: 'queryFactory'
    },
    {
      name: 'prop'
    },
    {
      name: 'label',
      defaultValueFn: function() { return this.prop ? this.prop.label : ''; }
    },
    {
      model_: 'ViewProperty',
      name: 'acRowView',
      defaultValue: 'DefaultACRowView'
    },
    {
      model_: 'ViewProperty',
      name: 'rowView',
      defaultValue: 'DefaultRowView'
    },
    {
      name: 'className',
      defaultValue: 'AutocompleteListView'
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      name: 'extraClassName',
      defaultValueFn: function() { return Array.isArray(this.data) ? ' array' : ' single'; }
    },
  ],

  templates: [
    // TODO: cleanup CSS
    function CSS() {/*
      .AutocompleteListView {
        padding: 0 0 12px 16px;
        width: 100%;
        border: none;
        position: inherit;
      }
      .AutocompleteListView .acHeader {
        color: #999;
        font-size: 14px;
        font-weight: 500;
        padding: 0 0 16px 0;
        display: flex;
        align-items: center;
        margin-top: -16px;
        padding-bottom: 0;
        flex: 1 0 auto;
      }
      .AutocompleteListView .acHeader .acLabel {
        flex: 1 0 auto;
      }
      .AutocompleteListView .acHeader canvas {
        opacity: 0.76;
      }
      .AutocompleteListView .single canvas {
        display: none;
      }
    */},
    function toInnerHTML() {/*
      <% var isArray = Array.isArray(this.data); %>
      <div class="acHeader"><div class="acLabel">%%label</div><% if ( isArray ) { %> $$addRow <% } %></div>
      <% if ( isArray ) { %>
        <% for ( var i = 0 ; i < this.data.length ; i++ ) {
          var d = this.data[i]; %>
          <div><%= this.rowView({data: d}, this.__ctx__) %></div>
        <% } %>
      <% } else { %>
        <div id="<%= this.on('click', function() { self.addRow(); }) %>" <%= this.rowView({data: this.data}, this.__ctx__) %></div>
      <% } %>
    */}
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;

      this.__ctx__ = this.__ctx__.sub({
        addRow: function(d) {
          if ( d ) self.data = Array.isArray(self.data) ? self.data.union([d]) : d;
        },
        removeRow: function(d) {
          self.data = self.data.deleteF(d);
        },
        dao:          this.srcDAO,
        queryFactory: this.queryFactory,
        rowView:      this.acRowView
      }, 'AutocompleteListView');
    }
  },

  actions: [
    {
      name: 'addRow',
      label: '',
      iconUrl: 'images/ic_add_24dp.png',
      action: function() {
        var view = this.__ctx__.AddRowView.create();
        this.__ctx__.stack.pushView(view);
        view.focus();
      }
    }
  ]
});
