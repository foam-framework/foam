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

 // DetailView
 
 

CLASS({
  name: 'BaseDetailView',
  extendsModel: 'foam.experimental.views.BaseView',
  traits: ['foam.experimental.views.DataConsumerTrait'],
  package: 'foam.experimental.views',
  
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
  */},

  properties: [
    {
      name: 'data',
      documentation: function() {/*
        Handles a model change, which requires that the child views be torn down.
        If the data.model_ remains the same, the new data is simply propagated to
        the existing children.
      */},
      postSet: function(old, nu) {
        if ( nu && nu.model_ && this.model !== nu.model_ ) {
          // destroy children
          this.destroy();
          // propagate data change (nowhere)
          this.model = nu.model_;
          this.childData = nu;
          // rebuild children with new data
          this.construct();
        } else {
          this.childData = nu; // just move the new data along
        }
        this.onValueChange_(); // sub-classes may handle to change as well
      }
    },
    {
      name:  'model',
      type:  'Model',
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
      if (this.viewModel()) {
        var o = this.viewModel().getFeature(name);
        if ( o ) { 
          if (Action.isInstance(o))
            return this.createActionView(o, opt_args);
          else
            return this.createView(o, opt_args);
        }
      }
      return this.SUPER(name, opt_args);
    }

  }
});

CLASS({
  name: 'DetailView',
  extendsModel: 'foam.experimental.views.BaseDetailView',
  traits: ['foam.experimental.views.HTMLViewTrait',
           'foam.experimental.views.HTMLDetailViewTrait'],

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
});

CLASS({
  name: 'HTMLDetailViewTrait',
  package: 'foam.experimental.views',
  
  documentation:function() {/*
    The HTML implementation of $$DOC{ref:'foam.experimental.views.DetailView'}.
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
  ],

  methods: {

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
      if ( DAOController.isInstance(view) ) {
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
        str += this.rowToHTML(prop, view);
      }

      str += this.endForm();

      if ( this.showRelationships ) {
        var view = this.X.RelationshipsView.create();
        str += view.toHTML();
        this.addChild(view);
      }

      str += '</div>';

      return str;
    }
  }
});



// UpdateDetailView


CLASS({
  name: 'UpdateDetailView',
  extendsModel: 'foam.experimental.views.BaseUpdateDetailView',
  traits: ['foam.experimental.views.HTMLViewTrait',
           'foam.experimental.views.HTMLDetailViewTrait']
});

CLASS({
  name: 'BaseUpdateDetailView',
  extendsModel: 'foam.experimental.views.BaseDetailView',
  package: 'foam.experimental.views',
  
  documentation:function() {/*
    UNTESTED: proof of concept for data handling
  */},

  imports: ['DAO as dao'],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        // since we're cloning the propagated data, we have to listen
        // for changes to the data and clone again 
        if ( old ) old.removeListener(this.parentContentsChanged);
        if ( nu ) nu.addListener(this.parentContentsChanged);
        
        if (!nu) return;
        // propagate a clone and build children
        this.childData = nu.deepClone();
        this.originalData = nu.deepClone();
  
        this.data.addListener(function() {
          // The user is making edits. Don't listen for parent changes,
          // since we no longer want to react to updates to it.
          this.version++;
          this.data.removeListener(this.parentContentsChanged);
        }.bind(this));
      }
    },
    {
      name: 'originalData',
      documentation: 'A clone of the parent data, for comparison with edits.'
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

  
  listeners: [
    {
      name: 'parentContentsChanged',
      code: function() {
        // If this listener fires, the parent data has changed internally
        // and the user hasn't edited our copy yet, so keep the clones updated.
        this.childData.copyFrom(this.data);
        this.originalData.copyFrom(this.data);
      }
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
      isAvailable: function() { this.version; return ! this.originalData.equals(this.childData); },
      action: function() { this.stack.back(); }
    },
    {
      name:  'back',
      isAvailable: function() { this.version; return this.originalData.equals(this.childData); },
      action: function() { this.stack.back(); }
    },
    {
      name: 'reset',
      isAvailable: function() { this.version; return ! this.originalData.equals(this.childData); },
      action: function() { this.childData.copyFrom(this.originalData); } // or do we want data?
    }
  ]
});




// RelationshipView



CLASS({
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
