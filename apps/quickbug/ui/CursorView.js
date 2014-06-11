FOAModel({
  name: 'Cursor',

  properties: [
    {
      name: 'browser',
      defaultValueFn: function() { return this.X.browser; }
    },
    {
      name: 'location',
      defaultValueFn: function() { return this.browser.location; }
    },
    {
      name: 'dao',
      defaultValueFn: function() { return this.browser.filteredIssueDAO; }
    },
    {
      model_: 'IntProperty',
      name: 'pos',
      help: 'Current row number.'
    },
    {
      model_: 'IntProperty',
      name: 'total',
      help: 'Total number of rows.'
    },
    {
      name: 'rows',
      factory: function() { return []; }
    },
    {
      name: 'className',
      defaultValue: 'cursor-view'
    }
  ],

  actions: [
    {
      name: 'prev',
      label: '< Prev',
      isEnabled: function() { return this.pos > 1; },
      action: function() {
        this.pos--;
        this.location.id = this.rows[this.pos-1].id;
      }
    },
    {
      name: 'next',
      label: 'Next >',
      isEnabled: function() { return this.pos < this.total; },
      action: function() {
        this.pos++;
        this.location.id = this.rows[this.pos-1].id;
      }
    },
    {
      name: 'backToList',
      label: 'Back to list',
      action: function() { this.location.id = ''; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      var i = 1;
      this.dao.select({
        put: function(o) {
          if ( o.id === self.location.id ) {
            self.pos = i;
          }
          i++;
          self.rows.push(o);
        }})(function() {
          self.total = self.rows.length;
        });
    }
  }
});


FOAModel({
  name: 'CursorView',

  extendsModel: 'DetailView',

  templates: [
    function toHTML() {/*
      $$prev{model_: 'ActionLink'} $$pos{mode: 'read-only'} of $$total{mode: 'read-only'} $$next{model_: 'ActionLink'} $$backToList{model_: 'ActionLink'}
    */}
  ]
});