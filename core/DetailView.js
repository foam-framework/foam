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
    }
  ],

  methods: {
    // Template Method
    onValueChange_: function() { },

    viewModel: function() { return this.model; },

    createTemplateView: function(name, opt_args) {
      var o = this.viewModel()[name];
      if ( o ) {
        var v = Action.isInstance(o) ?
          this.createActionView(o, opt_args) :
          this.createView(o, opt_args) ;

        v.data$ = this.data$;
        return v;
      }

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

MODEL({
  name: 'RelationshipView',
  extendsModel: 'View',

  properties: [
    {
      name: 'relationship',
      required: true
    },
    {
      model_: 'ModelProperty',
      name: 'viewModel',
      defaultValue: 'DAOController'
    },
    {
      name: 'data', 
      postSet: function() {
        this.updateView();
      }
    },
    {
      name: 'view'
    }
  ],

  methods: {
    updateView: function() {
      if ( this.view ) this.view.destroy();
      debugger;
      this.view = this.viewModel.create({
        dao: this.data[this.relationship.name],
        model: this.relationship.relatedModel
      });
      if ( this.$ ) {
        this.updateHTML();
      }
    }
  },
  templates: [
    function toInnerHTML() {/* %%view */}
  ]
});

MODEL({
  name: 'RelationshipsView',
  extendsModel: 'DetailView',

  templates: [
    function toHTML() {/*
      <%
        for ( var i = 0, relationship; relationship = this.model.relationships[i]; i++ ) {
          out(this.X.RelationshipView.create({
            data$: this.data$,
            relationship: relationship
          }));
        }
      %>
    */}
  ]
});
