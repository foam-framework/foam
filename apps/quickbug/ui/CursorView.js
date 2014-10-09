MODEL({
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
      name: 'dao'
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
      keyboardShortcuts: [ 37 /* left-arrow */, 75 /* k */ ],
      isEnabled: function() { return this.pos > 1; },
      action: function() {
        this.pos--;
        this.location.id = this.rows[this.pos-1].id;
      }
    },
    {
      name: 'next',
      label: 'Next >',
      keyboardShortcuts: [ 39 /* right-arrow */, 74 /* j */ ],
      isEnabled: function() { return this.pos < this.total; },
      action: function() {
        this.pos++;
        this.location.id = this.rows[this.pos-1].id;
      }
    },
    {
      name: 'backToList',
      label: 'Back',
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
          if ( o.id == self.location.id ) {
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


MODEL({
  name: 'CursorView',

  extendsModel: 'DetailView',

  methods: {
    initHTML: function() {
      this.SUPER();
      this.el.focus();
    }
  },

  templates: [
    function toHTML() {/*
      <span id="%%id" tabindex=1>$$prev{model_: 'ActionLink'} $$pos{mode: 'read-only'} of $$total{mode: 'read-only'} $$next{model_: 'ActionLink'} $$backToList{model_: 'ActionLink'}</span>
    */}
  ]
});
