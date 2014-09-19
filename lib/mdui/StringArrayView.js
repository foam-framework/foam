// Extend this View when making alternate RowViews in order to inherit the removeRow action.
// TODO: consider inheriting actions from parent and/or Context instead.
MODEL({
  name: 'mdDefaultRowView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data'
    },
    {
      name: 'className',
      defaultValue: 'mdDefaultRowView'
    }
  ],

  templates: [
    function CSS() {/*
      .mdDefaultRowView {
        white-space: nowrap;
      }
    */},
    function toInnerHTML() {/* %%data $$removeRow */}
  ],

  actions: [
    {
      name: 'removeRow',
      label: 'X',
      // iconUrl: 'images/ic_clear_24dp.png',
      action: function() { this.X.removeRow(this.data); }
    }
  ]
});


MODEL({
  name: 'mdDefaultAutoCompleteRowView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data'
    },
  ],

  templates: [
    function toInnerHTML() {/* %%data.id */}
  ]
});


MODEL({
  name: 'mdAddRowView',
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
      name: 'limit',
      defaultValue: 10
    }
  ],

  templates: [
    function toInnerHTML() {/*
      $$close $$data
      <br>
      $$dao{ model_: 'DAOListView', useSelection: true, rowView: { create: this.X.rowView } } */
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.data$.addListener(function() { this.close(); }.bind(this));
      this.softValue = DomValue.create(this.dataView.$, 'input');
      this.softValue.addListener(function() {
        var data = this.softValue.get();
        var src = this.X.dao.limit(this.limit);
        var dao = src.where(data ? this.X.queryFactory(data) : TRUE);

        console.log('**** soft data change', data);

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
      this.daoView.$.removeEventListener('blur', this.daoView.$.onBlur);
    }
  },

  actions: [
    {
      name: 'close',
      label: '<-',
      // iconUrl: 'images/ic_clear_24dp.png',
      action: function(X) {
        console.log('data: ', this.data);
        X.addRow(this.data);
        X.stack.back();
      }
    }
  ]
});


MODEL({
  name: 'mdStringArrayView',
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
      name: 'autoCompleteDAO'
    },
    {
      name: 'autoCompleteQueryFactory'
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
      name: 'autoCompleteRowView',
      defaultValue: 'mdDefaultAutoCompleteRowView'
    },
    {
      model_: 'ViewProperty',
      name: 'rowView',
      defaultValue: 'mdDefaultRowView'
    },
  ],

  templates: [
    function toInnerHTML() {/*
      <div> %%label $$addRow </div><br>
      <% for ( var i = 0 ; i < this.data.length ; i++ ) { var d = this.data[i]; %>
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
        dao: this.autoCompleteDAO,
        queryFactory: this.autoCompleteQueryFactory,
        rowView: this.autoCompleteRowView
      }, 'ArrayView');
    }
  },

  actions: [
    {
      name: 'addRow',
      label: '+',
      // iconUrl: 'images/ic_add_24dp.png',
      action: function() {
        var view = this.X.mdAddRowView.create();
        this.X.stack.pushView(view);
        view.focus();
      }
    },
    {
      name: 'removeRow',
      label: 'X',
      // iconUrl: 'images/ic_clear_24dp.png',
      action: function() {
      }
    }
  ],

  listeners: [
  ]
});
