MODEL({
  name: 'mdDetailView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'className',
      defaultValue: 'mdDetailView'
    }
  ],
  methods: {
    init: function() {
      this.SUPER();

      // Register MD PropertyViews
      // this.X = this.X.sub();
      // X.registerModel(mdTextFieldView, 'TextFieldView');

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