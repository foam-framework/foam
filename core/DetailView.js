MODEL({
  name: 'DetailView',
  extendsModel: 'View',

  properties: [
    {
      name:  'data',
      postSet: function(_, data) {
        if ( ! this.model && data && data.model_ ) this.model = data.model_;
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
      getter: function() { console.warn('DetailView .obj is deprecated.  Use .data instead.'); return this.data; }
    },
    {
      model_: 'BooleanProperty',
      name: 'showActions',
      defaultValue: false,
      postSet: function(_, showActions) {
        // TODO: No way to remove the decorator.
        if ( showActions ) {
          this.addDecorator(this.X.ActionBorder.create());
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
        // TODO: Allow overriding of listeners
        this.onValueChange_.apply(this, arguments);
        if ( this.$ ) this.updateSubViews();
      }
    },
    {
      name: 'onKeyboardShortcut',
      code: function(evt) {
        // console.log('***** key: ', this.evtToKeyCode(evt));
        var action = this.keyMap_[this.evtToKeyCode(evt)];
        if ( action ) action.callIfEnabled(this.obj);
      }
    }
  ],

  methods: {
    // Template Method
    onValueChange_: function() { },

    viewModel: function() { return this.model; },

    createTemplateView: function(name, opt_args) {
      var o = this.viewModel()[name];
      if ( o ) return Action.isInstance(o) ?
        this.createActionView(o, this.data$, opt_args) :
        this.createView(o, opt_args) ;

      return this.SUPER(name, opt_args);
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
    toHTML: function() {
      if ( ! this.model ) throw "DetailView: either 'data' or 'model' must be specified.";

      return (this.model.getPrototype().toDetailHTML || this.defaultToHTML).call(this);
    },

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
      if ( this.data === '' ) return;

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var child = this.children[i];
        var prop  = child.prop;

        if ( ! prop ) continue;

        try {
          child.data = this.data;
        } catch (x) {
          console.log("error: ", prop.name, " ", x);
        }
      }
    }
  }
});


MODEL({
  name: 'UpdateDetailView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'originalData'
    },
    {
      name: 'data',
      postSet: function(_, data) {
        this.originalData = data.deepClone();
        if ( ! this.model && data && data.model_ ) this.model = data.model_;
        this.onValueChange();
      }
    },
    {
      name: 'dao'
    },
    {
      name: 'stack',
      defaultValueFn: function() { return this.X.stack; }
    },
    {
      name: 'view'
    }
  ],

  actions: [
    {
      name:  'save',
      help:  'Save updates.',

      isEnabled: function() { return ! this.originalData.equals(this.data); },
      action: function() {
        var self = this;
        var obj  = this.data;
        this.dao.put(obj, {
          put: function() {
            console.log("Saving: ", obj.toJSON());

            self.stack.back();
          },
          error: function() {
            console.error("Error saving", arguments);
          }
        });
      }
    },
    {
      name:  'cancel',
      help:  'Cancel update.',
      isEnabled: function() { return ! this.originalData.equals(this.data); },
      action: function() { this.stack.back(); }
    },
    {
      name:  'back',
      isEnabled: function() { return this.originalData.equals(this.data); },
      action: function() { this.stack.back(); }
    }
  ]
});
