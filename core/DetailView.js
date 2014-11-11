/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

MODEL({
  name: 'DetailView',
  extendsModel: 'View',

  documentation:function() {/*
    When a view based on $$DOC{ref:'Property'} values is desired, $$DOC{ref:'DetailView'}
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
    <p>For each $$DOC{ref:'Property'} in the $$DOC{ref:'.data'} instance specified,
    a $$DOC{ref:'PropertyView'} is created that selects the appropriate $$DOC{ref:'View'}
    to construct.

  */},

  properties: [
    {
      name: 'className',
      defaultValue: 'detailView',
      documentation: function() {/*
          The CSS class names to use for HTML $$DOC{ref:'View',usePlural:true}.
          Separate class names with spaces. Each instance of a $$DOC{ref:'DetailView'}
          may have different classes specified.
      */}
    },
    {
      name:  'data',
      postSet: function(_, data) {
        if ( ! this.model && data && data.model_ ) this.model = data.model_;
        this.onValueChange_();
      },
      documentation: function() {/*
        The $$DOC{ref:'Model'} to view. The $$DOC{ref:'Property',usePlural:true}
        of this $$DOC{ref:'Model'} instance will be examined and a $$DOC{ref:'PropertyView'}
        created for each with editors for the current value.
        </p>
        <p>Sub-views of $$DOC{ref:'DetailView'} are passed this $$DOC{ref:'.data'}
        property, from which $$DOC{ref:'PropertyView'} will extract its named
        $$DOC{ref:'Property'}
        and bind the property to the sub-view $$DOC{ref:'DetailView.data'}.

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
        The $$DOC{ref:'.model'} is extracted from $$DOC{ref:'.data'}, or can be
        set in advance when the type of $$DOC{ref:'.data'} is known. The $$DOC{ref:'Model'}
        is used to set up the structure of the $$DOC{ref:'DetailView'}, by examining the
        $$DOC{ref:'Property',usePlural:true}. Changing the $$DOC{ref:'.data'} out
        for another instance of the same $$DOC{ref:'Model'} will refresh the contents
        of the sub-views without destroying and re-creating them.

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
        The editing mode. To disable editing set to 'read-only'.

      */}
    },
    {
      model_: 'BooleanProperty',
      name: 'showRelationships',
      defaultValue: false,
      documentation: function() {/*
        Set true to create sub-views to display $$DOC{ref:'Relationship',usePlural:true}
        for the $$DOC{ref:'.model'}.

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
        var v;

        if ( Action.isInstance(o) )
          v = this.createActionView(o, opt_args);
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

    startForm: function() { /* HTML formatter */ return '<table>'; },
    endForm: function() { /* HTML formatter */ return '</table>'; },

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
      /* Overridden to create the complete HTML content for the $$DOC{ref:'View'}.</p>
         <p>$$DOC{ref:'Model',usePlural:true} may specify a .toDetailHTML() $$DOC{ref:'Method'} or
         $$DOC{ref:'Template'} to render their contents instead of the
          $$DOC{ref:'DetailView.defaultToHTML'} we supply here.

        */

      if ( ! this.model ) throw "DetailView: either 'data' or 'model' must be specified.";

      return (this.model.getPrototype().toDetailHTML || this.defaultToHTML).call(this);
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

        var view = this.createView(prop);
        view.data$ = this.data$;
        str += this.rowToHTML(prop, view);
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
    }
  }
});


MODEL({
  name: 'UpdateDetailView',
  extendsModel: 'DetailView',

  imports: [
    'DAO as dao'
  ],

  properties: [
    {
      name: 'originalData'
    },
    {
      name: 'data',
      preSet: function(_, v) { if ( v ) return v.deepClone(); },
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
            self.originalData.copyFrom(obj);
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
    },
    {
      name: 'reset',
      isAvailable: function() { this.version; return ! this.originalData.equals(this.data); },
      action: function() { this.data.copyFrom(this.originalData); }
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
      name: 'args'
    },
    {
      model_: 'ViewFactoryProperty',
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
    init: function(args) {
      this.SUPER(args);
      if ( this.args && this.args.model_ ) this.viewModel = this.args.model_
    },
    updateView: function() {
      if ( this.view ) this.view.destroy();
      this.view = this.viewModel({
        dao: this.data[this.relationship.name],
        model: this.relationship.relatedModel
      }, this.X).copyFrom(this.args);
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
