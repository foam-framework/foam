MODEL({
  name: 'mdStringArrayListView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      postSet: function(oldValue, newValue) {
        this.updateHTML();
      }
    },
    {
      model_: 'ViewFactory',
      name: 'rowView'
    },
  ],

  methods: {
    toInnerHTML: function() {
      if ( ! this.data ) return '';
      var out = '';

      this.data.forEach(function(d) {
        var view = this.rowView({data: d});
        out += view.toHTML();
        this.addChild(view);
      }.bind(this));

      return out;
    }
  },

  listeners: [
  ]
});
