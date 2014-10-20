MODEL({
  name: 'DetailView',
  extendsModel: 'View',

  documentation:function() {/*
    <p>When a view based on $$DOC{ref:'Property'} values is desired, $$DOC{ref:'DetailView'}
    is the place to start. Either using $$DOC{ref:'DetailView'} directly, implementing
    a .toDetailHTML() $$DOC{ref:'Method'} in your model, or extending
    $$DOC{ref:'DetailView'} to add custom formatting.
    </p>
    <p>Set the $$DOC{ref:'.data'} $$DOC{ref:'Property'} to the $$DOC{ref:'Model'} instance
    you want to display. $$DOC{ref:'DetailView'} will extract the $$DOC{ref:'Model'}
    definition, create editors for the $$DOC{ref:'Property',usePlural:true}, and
    display the current values of your instance. Set $$DOC{ref:'.mode',usePlural:true}
    to indicate read-only if desired.
    </p>
    <p>$$DOC{ref:'Model',usePlural:true} may specify a .toDetailHTML() $$DOC{ref:'Method'} or
    $$DOC{ref:'Template'} to render their contents instead of
    $$DOC{ref:'DetailView.defaultToHTML'}.
    </p>
  */},

  properties: [
    {
      name: 'className',
      defaultValue: 'detailView'
    },
    {
      name:  'data',
      postSet: function(_, data) {
        if ( ! this.model && data && data.model_ ) this.model = data.model_;
        this.onValueChange();
      },
      documentation: function() {/*
        <p>The $$DOC{ref:'Model'} to view. The $$DOC{ref:'Property',usePlural:true}
        of this $$DOC{ref:'Model'} instance will be examined and a $$DOC{ref:'PropertyView'}
        created for each with editors for the current value.
        </p>
        <p>Sub-views of $$DOC{ref:'DetailView'} are passed this $$DOC{ref:'.data'}
        property, from which $$DOC{ref:'PropertyView'} will extract its named
        $$DOC{ref:'Property'}
        and bind the property to the sub-view $$DOC{ref:'DetailView.data'}.
        </p>
      */}
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
      },
      documentation: function() {/*
        <p>The $$DOC{ref:'.model'} is extracted from $$DOC{ref:'.data'}, or can be
        set in advance when the type of $$DOC{ref:'.data'} is known. The $$DOC{ref:'Model'}
        is used to set up the structure of the $$DOC{ref:'DetailView'}, by examining the
        $$DOC{ref:'Property',usePlural:true}. Changing the $$DOC{ref:'.data'} out
        for another instance of the same $$DOC{ref:'Model'} will refresh the contents
        of the sub-views without destroying and re-creating them.
        </p>
      */}
    },
    {
      name: 'title',
      defaultValueFn: function() { return "Edit " + this.model.label; },
      documentation: function() {/*
        <p>The display title for the $$DOC{ref:'View'}.
        </p>
      */}
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-write',
      documentation: function() {/*
        <p>The editing mode. To disable editing set to 'read-only'.
        </p>
      */}
    },
    {
      model_: 'BooleanProperty',
      name: 'showRelationships',
      defaultValue: false,
      documentation: function() {/*
        <p>Set true to create sub-views to display $$DOC{ref:'Relationship',usePlural:true}
        for the $$DOC{ref:'.model'}.
        </p>
      */}
    }
  ],

  listeners: [
    {
      name: 'onValueChange',
      code: function() {
        // TODO: Allow overriding of listeners
        this.onValueChange_.apply(this, arguments);
        if ( this.$ ) this.updateSubViews();
      },
      documentation: function() {/*
        <p>Triggers sub-views to update their values without destroying any of them.
        </p>
      */}
    }
  ],

  methods: {
    // Template Method
    onValueChange_: function() { /* Override with value update code. */ },

    viewModel: function() { /* The $$DOC{ref:'Model'} type of the $$DOC{ref:'.data'}. */
       return this.model;
    },

    createTemplateView: function(name, opt_args) {
      /* Overridden here to set the new View.$$DOC{ref:'.data'} to this.$$DOC{ref:'.data'}.
         See $$DOC{ref:'View.createTemplateView'}. */
      var o = this.viewModel()[name];
      if ( o ) {
        if ( Action.isInstance(o) )
          var v = this.createActionView(o, opt_args);
        else if ( Relationship.isInstance(o) )
          v = this.createRelationshipView(o, opt_args);
        else
          v = this.createView(o, opt_args);

        v.data$ = this.data$;
        return v;
      }

      return this.SUPER(name, opt_args);
    },

    titleHTML: function() {
      /* Title text HTML formatter */
      var title = this.title;

      return title ?
        '<tr><th colspan=2 class="heading">' + title + '</th></tr>' :
        '';
    },

    startForm: function() { return '<table>'; },
    endForm: function() { return '</table>'; },

    startColumns: function() { /* HTML formatter */ return '<tr><td colspan=2><table valign=top><tr><td valign=top><table>'; },
    nextColumn:   function() { /* HTML formatter */ return '</table></td><td valign=top><table valign=top>'; },
    endColumns:   function() { /* HTML formatter */ return '</table></td></tr></table></td></tr>'; },

    rowToHTML: function(prop, view) {
      /* HTML formatter for each $$DOC{ref:'Property'} row. */
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
      /* <p>Overridden to create the complete HTML content for the $$DOC{ref:'View'}.</p>
         <p>$$DOC{ref:'Model',usePlural:true} may specify a .toDetailHTML() $$DOC{ref:'Method'} or
         $$DOC{ref:'Template'} to render their contents instead of the
          $$DOC{ref:'DetailView.defaultToHTML'} we supply here.</p>

        */

      if ( ! this.model ) throw "DetailView: either 'data' or 'model' must be specified.";

      return (this.model.toDetailHTML || this.defaultToHTML).call(this);
    },

    defaultToHTML: function() {
      /* For $$DOC{ref:'Model',usePlural:true} that don't supply a .toDetailHTML()
        $$DOC{ref:'Method'} or $$DOC{ref:'Template'}, a default listing of
        $$DOC{ref:'Property'} editors is implemented here.
        */
      this.children = [];
      var model = this.model;
      var str  = "";

      str += '<div id="' + this.id + '" ' + this.cssClassAttr() + '" name="form">';
      str += this.startForm();
      str += this.titleHTML();

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        str += this.rowToHTML(prop, this.createView(prop));
      }

      str += this.endForm();

      if ( this.showRelationships ) {
        var view = this.X.RelationshipsView.create({
          data: this.data
        });
        view.data$ = this.data$;
        str += view.toHTML();
        this.addChild(view);
      }

      str += '</div>';

      return str;
    },

    initHTML: function() {
      /* After sub-view creation, connects sub-views for updates. */
      this.SUPER();

      // hooks sub-views upto sub-models
      this.updateSubViews();
    },

    updateSubViews: function() {
      /* Connects sub-views for updates. */
      if ( this.data === '' ) return;

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var child = this.children[i];
        var prop  = child.prop;

        if ( ! prop ) continue;

        try {
          child.data = this.data;
        } catch (x) {
          console.log('error: ', prop.name, ' ', x);
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
        data.addListener(function() { this.version++; }.bind(this));
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
    },
    {
      // Version of the data which changes whenever any property of the data is updated.
      // Used to help trigger isEnabled / isAvailable in Actions.
      model_: 'IntProperty',
      name: 'version'
    }
  ],

  actions: [
    {
      name:  'save',
      help:  'Save updates.',

      isAvailable: function() { this.version; return ! this.originalData.equals(this.data); },
      action: function() {
        var self = this;
        var obj  = this.data;
        this.stack.back();

        this.dao.put(obj, {
          put: function() {
            console.log("Saving: ", obj.toJSON());
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
      isAvailable: function() { this.version; return ! this.originalData.equals(this.data); },
      action: function() { this.stack.back(); }
    },
    {
      name:  'back',
      isAvailable: function() { this.version; return this.originalData.equals(this.data); },
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
      model_: 'ViewProperty',
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
      this.view = this.viewModel({
        dao: this.data[this.relationship.name],
        model: this.relationship.relatedModel
      }, this.X);
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
