MODEL({
  name: 'mdDefaultRowView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data'
    }
  ],

  templates: [
    function toInnerHTML() {/* %%data */}
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
      name: 'prop',
      // Automatically provided if used within a PropertyView
      defaultValueFn: function() { return this.parent.prop; }
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

  methods: {
    toInnerHTML: function() {
      if ( ! this.data ) return '';
      var out = this.label;

      this.data.forEach(function(d) {
        out += this.rowToHTML(d);
      }.bind(this));

      return out;
    },
    // Can be overridden if it's easier than using a View.
    rowToHTML: function(d) {
      var view = this.rowView({data: d});
      this.addChild(view);
      return view.toHTML();
    }
  },

  actions: [
    {
      name: 'addRow',
      label: '',
      iconUrl: 'images/ic_add_24dp.png',
      action: function() {
        var view = this.X.FloatingView.create({
          view: this.X.IssueOwnerEditView.create(this.model.CC)
        });
        this.X.stack.pushView(view);
        view.focus();
        var self = this;
        view.subscribe(['finished'], function() {
          self.data.cc = self.data.cc.concat(view.data);
        });
      }
    },
    {
      name: 'removeRow',
      label: '',
      iconUrl: 'images/ic_clear_24dp.png',
      action: function() {
      }
    }
  ],

  listeners: [
  ]
});
