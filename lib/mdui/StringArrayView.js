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
  name: 'mdAddRowView',
  extendsModel: 'View',

  traits: ['PositionedDOMViewTrait'],

  properties: [
    {
      name: 'data'
    }
  ],

  templates: [
    function toInnerHTML() {/* $$close $$data */}
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.data$.addListener(this.close);
    }
  },

  actions: [
    {
      name: 'close',
      label: '<-',
      // iconUrl: 'images/ic_clear_24dp.png',
      action: function(view) {
        console.log('data: ', this.data);
        view.X.addRow(view.data);
        view.X.stack.back();
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
      name: 'prop'
    },
    {
      name: 'label',
      defaultValueFn: function() { return this.prop ? this.prop.label : ''; }
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
          if ( d ) self.data = self.data.concat(d);
        },
        removeRow: function(d) {
          self.data = self.data.deleteF(d);
        }
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
