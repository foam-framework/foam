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
      // Register MD PropertyViews
      this.X = this.X.sub();
      this.X.registerModel(mdTextFieldView, 'TextFieldView');
      this.X.registerModel(mdIntFieldView, 'IntFieldView');
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

MODEL({
  name: 'mdTextFieldView',
  extendsModel: 'View',

  properties: [
    {
      name: 'className',
      defaultValue: 'md-text-field-container'
    },
    { name: 'data' },
    { name: 'softData' },
    { name: 'inputId' },
    { name: '$input', getter: function() { return this.X.$(this.inputId); } },
    { name: 'labelId' },
    { name: '$label', getter: function() { return this.X.$(this.labelId); } },
    { model_: 'BooleanProperty', name: 'focused', defaultValue: false },
    'label'
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
      this.softValue = DomValue.create(this.$input, 'input');
      this.softValue.set(this.data);
      Events.link(this.data$, this.softValue);
    }
  },
  templates: [
    function CSS() {/*
    .md-text-field-container {
      width: 100%;
      display: flex;
      position: relative;
    }
    .md-text-field-label {
      position: absolute;
      top: 40px;
      font-size: 16px;
      transition: font-size 0.5s, top 0.5s;
      flex-grow: 1;
      opacity: 0.3;
      z-index: 0;
    }
    .md-text-field-input {
      font-size: 16px;
      flex-grow: 1;
      z-index: 1;
      background: transparent;
      border: none;
      border-bottom: 1px solid #B3E5FC;
      margin: 0 0 8px 0;
      padding: 40px 0 7 0;
    }
    .md-text-field-input:focus {
      border-bottom: 2px solid #0288D1;
      padding: 40px 0 6 0;
      outline: none;
    }
    .md-text-field-label-offset {
      font-size: 12px;
      top: 16px;
    }
    */},
    function toHTML() {/*
      <%
        var input = this.inputId = this.nextID();
        this.on('focus', this.onFocus, input);
        this.on('blur', this.onBlur, input);
        this.on('input', this.onInput, input);
        this.on('change', this.onChange, input);
        this.on('click', this.onClick, input);
        this.on('keydown', this.onKeyDown, input);
        var label = this.labelId = this.nextID();
        this.setClass('md-text-field-label-offset',
          function() {
            var focused = self.focused;
            var data = self.data;
            return focused || ('' + data).length > 0;
          }, label);
      %>
      <div %%cssClassAttr() id="%%id">
        <label id="<%= label %>" class="md-text-field-label"><%= escapeHTML(this.label) %>Label</label>
        <input id="<%= input %>" type="text" class="md-text-field-input">
      </div>
    */}
  ],

  listeners: [
    {
      name: 'onFocus',
      code: function() {
        this.focused = true;
      }
    },
    {
      name: 'onBlur',
      code: function() {
        this.focused = false;
      }
    },
    {
      name: 'onInput',
      code: function() {
      }
    },
    {
      name: 'onChange',
      code: function() {
        this.data = this.softData;
      }
    },
    {
      name: 'onKeyDown',
      code: function() {
      }
    },
    {
      name: 'onClick',
      code: function() {
        this.$input.focus();
      }
    }
  ]
});

MODEL({
  name: 'mdIntFieldView',
  extendsModel: 'mdTextFieldView'
});
