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
      action: function() { this.X.removeRow(this.data); }
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

  traits: ['PositionedDOMViewTrait'],

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
    }
  ],

  templates: [
    function CSS() {/*
      .AddRowView {
        width: 100%;
        background: #e1e1e1;
      }
      .AddRowView .arvHeader {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #d2d2d2;
        background: #fff;
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
        overflow-y: auto;
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
      $$dao{ model_: 'DAOListView', className: 'rows', useSelection: true, rowView: { create: this.X.rowView } }
    */}
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.data$.addListener(function() { this.close(); }.bind(this));
      this.softValue = DomValue.create(this.dataView.$, 'input');
      this.softValue.addListener(function() {
        var data = this.softValue.get();
        var src  = this.X.dao.limit(this.limit);
        var dao  = src.where(data ? this.X.queryFactory(data) : TRUE);

        var self = this;
        dao.limit(2).select()(function(objs) {
          self.dao = ( objs.length === 1 && objs[0].id === data /* self.f(objs[0]) === data */ ) ? src.where(FALSE) : dao;
        });
      }.bind(this));
      this.dao = this.X.dao.limit(this.limit);
    },

    initInnerHTML: function() {
      this.SUPER();

      this.daoView.selection$.addListener(function(_, _, _, data) {
        this.data = data.id;
      }.bind(this));
    }
  },

  actions: [
    {
      name: 'close',
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png',
      action: function(X) {
        // Don't close twice.
        if ( this.closed_ ) return;
        this.closed_ = true;

        // Hack: If you click on one of the labels the data will be updated twice:
        //  once when then text field gets the onBlur event and once when
        //  selecting the label sets it.  In this case, we only want the second
        //  value which will contain the full label text.  So we delay by a bit to give
        //  the second update time to happen.
        this.X.setTimeout(function() {
          X.addRow(this.data);
          X.stack.back();
        }.bind(this), 100);
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
    */},
    function toInnerHTML() {/*
      <div class="acHeader"><div class="acLabel">%%label</div> $$addRow </div>
      <% for ( var i = 0 ; i < this.data.length ; i++ ) {
        var d = this.data[i]; %>
        <div><%= this.rowView({data: d}, this.X) %></div>
      <% } %>
    */}
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;

      this.X = this.X.sub({
        addRow: function(d) {
          if ( d ) self.data = self.data.union([d]);
        },
        removeRow: function(d) {
          self.data = self.data.deleteF(d);
        },
        dao:          this.srcDAO,
        queryFactory: this.queryFactory,
        rowView:      this.acRowView
      }, 'ArrayView');
    }
  },

  actions: [
    {
      name: 'addRow',
      label: '',
      iconUrl: 'images/ic_add_24dp.png',
      action: function() {
        var view = this.X.AddRowView.create();
        this.X.stack.pushView(view);
        view.focus();
      }
    }
  ]
});
