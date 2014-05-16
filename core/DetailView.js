FOAModel({
  name: 'DetailView',
  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'value',
      type:  'Value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        if ( oldValue ) oldValue.removeListener(this.onValueChange);
        if ( newValue ) newValue.addListener(this.onValueChange);
        this.onValueChange();
      }
    },
    {
      name:  'model',
      type:  'Model',
      postSet: function(_, m) {
        if ( this.$ ) {
          this.children = [];
          this.$.outerHTML = this.toHTML();
          this.initHTML();
        }
      }
    },
    {
      name: 'title',
      defaultValueFn: function() { return "Edit " + this.model.label; }
    },
    {
      name: 'obj',
      getter: function() { return this.value.value; }
    },
    {
      model_: 'BooleanProperty',
      name: 'showActions',
      defaultValue: false,
      postSet: function(old, nu) {
        // TODO: No way to remove the decorator.
        if ( nu ) {
          this.addDecorator(ActionBorder.create());
        }
      }
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-write'
    }
  ],

  listeners: [
    {
      name: 'onValueChange',
      code: function() {
        if ( this.obj && this.obj.model_ ) this.model = this.obj.model_;
        if ( this.$ ) this.updateSubViews();
      }
    },
    {
      name: 'onKeyboardShortcut',
      code: function(evt) {
        var action = this.keyMap_[this.evtToKeyCode(evt)];
        if ( action ) action.callIfEnabled(this.obj);
      }
    }
  ],

  methods: {
    bindSubView: function(view, prop) {
      if ( this.get() ) {
        // TODO: setValue is deprecated
        if ( view.setValue ) {
          view.setValue(this.get().propertyValue(prop.name));
        } else {
          view.value = this.get().propertyValue(prop.name);
        }
      }
    },

    viewModel: function() { return this.model; },

    getValue: function() { return this.value; },

    setValue: function (value) {
      if ( this.getValue() ) {
        // todo:
        /// getValue().removeListener(???)
      }
      this.value = value;
      this.updateSubViews();
      // TODO: model this class and make updateSubViews a listener
      // instead of bind()'ing
      value.addListener(this.updateSubViews.bind(this));
    },

    titleHTML: function() {
      var title = this.title;

      return title ?
        '<tr><th colspan=2 class="heading">' + title + '</th></tr>' :
        '';
    },

    startColumns: function() { return '<tr><td colspan=2><table valign=top><tr><td valign=top><table>'; },
    nextColumn:   function() { return '</table></td><td valign=top><table valign=top>'; },
    endColumns:   function() { return '</table></td></tr></table></td></tr>'; },

    rowToHTML: function(prop, view) {
      var str = "";

      if ( prop.detailViewPreRow ) str += prop.detailViewPreRow(this);

      str += '<tr class="detail-' + prop.name + '">';
      if ( view.model_ === DAOController ) {
        str += "<td colspan=2><div class=detailArrayLabel>" + prop.label + "</div>";
        str += view.toHTML();
        str += '</td>';
      } else {
        str += "<td class='label'>" + prop.label + "</td>";
        str += '<td>';
        str += view.toHTML();
        str += '</td>';
      }
      str += '</tr>';

      if ( prop.detailViewPostRow ) str += prop.detailViewPostRow(this);

      return str;
    },

    // If the Model supplies a toDetailHTML method, then use it instead.
    toHTML: function() { return (this.model.getPrototype().toDetailHTML || this.defaultToHTML).call(this); },

    defaultToHTML: function() {
      this.children = [];
      var model = this.model;
      var str  = "";

      str += '<div id="' + this.id + '" class="detailView" name="form">';
      str += '<table>';
      str += this.titleHTML();

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        str += this.rowToHTML(prop, this.createView(prop));
      }

      str += '</table>';
      str += '</div>';

      return str;
    },

    initHTML: function() {
      this.SUPER();

      // hooks sub-views upto sub-models
      this.updateSubViews();
      this.initKeyboardShortcuts();
    },

    set: function(obj) {
      this.getValue().set(obj);
    },

    get: function() {
      return this.getValue().get();
    },

    evtToKeyCode: function(evt) {
      var s = '';
      if ( evt.ctrlKey ) s += 'ctrl-';
      if ( evt.shiftKey ) s += 'shift-';
      s += evt.keyCode;
      return s;
    },

    initKeyboardShortcuts: function() {
      var keyMap = {};
      var found = false;
      for ( var i = 0 ; i < this.model.actions.length ; i++ ) {
        var action = this.model.actions[i];
        for ( var j = 0 ; j < action.keyboardShortcuts.length ; j++ ) {
          var key = action.keyboardShortcuts[j];
          var keyCode = key.toString();
          keyMap[keyCode] = action;
          found = true;
        }
      }
      if ( found ) {
        this.keyMap_ = keyMap;
        this.$.parentElement.addEventListener('keydown', this.onKeyboardShortcut);
      }
    },

    updateSubViews: function() {
      var obj = this.get();

      if ( obj === '' ) return;

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var child = this.children[i];
        var prop  = child.prop;

        if ( ! prop ) continue;

        try {
          if ( child.model_.DATA ) child.data = obj;
          else child.value = obj.propertyValue(prop.name);
        } catch (x) {
          console.log("error: ", prop.name, " ", x);
        }
      }
    },

    setModel: function(obj) {
      if ( ! obj ) return;

      this.obj = obj;
    }
  }
});
