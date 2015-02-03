CLASS({
  name: 'DetailView',
  package: 'foam.ui.md',
  extendsModel: 'DetailView',

  requires: [
    'foam.ui.md.TextFieldView',
    'foam.ui.md.IntFieldView',
    'foam.ui.md.FloatFieldView'
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'mdDetailView'
    }
  ],
  methods: {
    init: function() {
      // Register MD PropertyViews
      this.X = this.X.sub();
      this.X.registerModel(this.TextFieldView,  'TextFieldView');
      this.X.registerModel(this.IntFieldView,   'IntFieldView');
      this.X.registerModel(this.FloatFieldView, 'FloatFieldView');
      this.SUPER();
    },
    titleHTML:    function() { return ''; },
    startForm:    function() { return ''; },
    endForm:      function() { return ''; },
    startColumns: function() { return ''; },
    nextColumn:   function() { return ''; },
    endColumns:   function() { return ''; },
    rowToHTML: function(prop, view) {
      /* HTML formatter for each $$DOC{ref:'Property'} row. */
      var str = "";

      str += view.toHTML();
      str += '<br>';

      return str;
    }
  }
});
