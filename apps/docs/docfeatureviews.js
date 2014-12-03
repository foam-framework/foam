///**
// * @license
// * Copyright 2014 Google Inc. All Rights Reserved
// *
// * Licensed under the Apache License, Version 2.0 (the "License");
// * you may not use this file except in compliance with the License.
// * You may obtain a copy of the License at
// *
// *     http://www.apache.org/licenses/LICENSE-2.0
// *
// * Unless required by applicable law or agreed to in writing, software
// * distributed under the License is distributed on an "AS IS" BASIS,
// * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// * See the License for the specific language governing permissions and
// * limitations under the License.
// */





CLASS({
  name: 'DocFeatureView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocView',
  help: 'A generic view for each item in a list of documented features.',

  requires: ['foam.documentation.DocFeatureInheritanceTracker as DocFeatureInheritanceTracker'],

  imports: ['featureDAO'],

  properties: [
    {
      name: 'overridesDAO',
      model_: 'DAOProperty',
      defaultValue: []
    },
    {
      name: 'extraClassName',
      defaultValue: 'feature-row'
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },

  ],

  methods: {
    init: function() {
      this.SUPER();
      // TODO: do this on postSet instead of pipe?
      this.overridesDAO = [];
      this.featureDAO
          .where(
                AND(EQ(this.DocFeatureInheritanceTracker.NAME, this.data.name),
                    EQ(this.DocFeatureInheritanceTracker.IS_DECLARED, true))
          )
          .orderBy(DESC(this.DocFeatureInheritanceTracker.INHERITANCE_LEVEL))
          .pipe(this.overridesDAO);
    }
  },

  templates: [
    function toInnerHTML() {/*
      <div id="scrollTarget_<%=this.data.name%>">
        <p class="feature-heading"><%=this.data.name%></p>
        <p>$$documentation{ model_: 'foam.documentation.DocBodyView' }</p>
        <p class="inheritance-info">Declared in: $$overridesDAO{ model_: 'DAOListView', rowView: 'foam.documentation.DocFeatureOverridesRefView', model: this.X.foam.documentation.DocFeatureInheritanceTracker }</p>
      </div>
    */}
  ]
});

CLASS({
  name: 'DocFeatureOverridesRefView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocRefView',
  label: 'Documentation Feature Overrides Reference Link View',
  help: "The view of a documentation reference link based on a Model's overrides.",

  documentation: function() { /*
    <p>An inline link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage.</p>
    */},

  properties: [
    {
      name: 'data',
      help: 'Shortcut to set reference by Model name.',
      postSet: function() {
        this.ref = this.data.model + "." + this.data.name;
        this.text = (this.data.fromTrait? "(T) " : "") + this.data.model + " / ";
      },
      documentation: function() { /*
        The target reference Model definition. Use this instead of setting
        $$DOC{ref:'.docRef'}, if you are referencing a $$DOC{ref:'Model'}.
        */}
    },
  ],
});
CLASS({
  name: 'DocFeatureSubmodelRefView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocRefView',
  label: 'Documentation Feature sub-model Link Reference View',
  help: 'The view of a documentation reference link based on a Sub-Model.',

  documentation: function() { /*
    <p>An inline link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage.</p>
    */},

  properties: [
    {
      name: 'data',
      help: 'Shortcut to set reference by Model.',
      postSet: function() {
        this.ref = "."+this.data.name;
      },
      documentation: function() { /*
        The target reference Model definition. Use this instead of setting
        $$DOC{ref:'.docRef'}, if you are referencing a $$DOC{ref:'Model'}.
        */}
    },
  ],
});

CLASS({
  name: 'DocFeatureModelRefView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocRefView',
  label: 'Documentation Feature Model Link Reference View',
  help: 'The view of a documentation reference link based on a Model.',

  documentation: function() { /*
    <p>An inline link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage.</p>
    */},

  properties: [
    {
      name: 'data',
      help: 'Shortcut to set reference by Model name.',
      postSet: function() {
        this.ref = this.data;
        if (this.docRef.valid) {
          this.text = this.docRef.resolvedModelChain[0].name + " &nbsp;&nbsp;";
        } else {
          this.text = this.data + " &nbsp;&nbsp;";
        }
      },
      documentation: function() { /*
        The target reference Model definition. Use this instead of setting
        $$DOC{ref:'.docRef'}, if you are referencing a $$DOC{ref:'Model'}.
        */}
    },
  ],
});


//CLASS({
//  name: 'DocPropertiesView',
//  extendsModel: 'DocFeaturesView',
//  help: 'Displays the documentation of the given Properties.',

//  properties: [
//    {
//      name:  'dao', // filter out hidden properties
//      model_: 'DAOProperty',
//      onDAOUpdate: function() {
//        this.filteredDAO = this.dao.where(EQ(Property.HIDDEN, FALSE));
//      }
//    },
//    {
//      name: 'rowView',
//      factory: function() { return 'DocPropertyRowView'; }
//    }
//  ],

//  methods: {
//    getGroupFromTarget: function(target) {
//      return target.properties$;
//    },
//    featureName: function() {
//      return "Properties";
//    },
//    featureType: function() {
//      return "properties";
//    }
//  }

//});

CLASS({
  name: 'PropertyRowDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocFeatureView',
  help: 'A view for documentation of each item in a list of properties.',

  templates: [
    function toInnerHTML() {/*
      <div id="scrollTarget_<%=this.data.name%>">
        <p><span class="feature-heading"><%=this.data.name%></span>
           <span class="feature-type">($$DOC{ref:this.data.type.replace('[]',''), text:this.data.type, acceptInvalid:true})</span></p>
        <p>$$documentation{ model_: 'foam.documentation.DocBodyView' }</p>
        <p class="inheritance-info">Declared in: $$overridesDAO{ model_: 'DAOListView', rowView: 'foam.documentation.DocFeatureOverridesRefView', model: this.X.foam.documentation.DocFeatureInheritanceTracker }</p>
      </div>
    */}
  ]
});


CLASS({
  name: 'MethodRowDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocFeatureView',
  help: 'A view for documentation of each item in a list of methods.',
});
CLASS({
  name: 'RelationshipRowDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocFeatureView',
  help: 'A view for documentation of each item in a list of methods.',
});
CLASS({
  name: 'IssueRowDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocFeatureView',
  help: 'A view for documentation of each item in a list of methods.',
});
CLASS({
  name: 'TemplateRowDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocFeatureView',
  help: 'A view for documentation of each item in a list of methods.',
});
CLASS({
  name: 'ActionRowDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocFeatureView',
  help: 'A view for documentation of each item in a list of methods.',
});


//CLASS({
//  name: 'DocMethodRowView',
//  extendsModel: 'DocFeatureRowView',
//  help: 'A view for each item in a list of documented Methods, including arguments.',

//  templates: [
//    function toInnerHTML() {/*
//      <div id="scrollTarget_<%=this.data.name%>">
//        <p class="feature-heading"><%=this.data.name%> $$THISDATA{ model_: 'DocMethodArgumentsSmallView' }</p>
//        <div class="memberList">$$THISDATA{ model_: 'DocMethodArgumentsView' }</div>
//        <p><%=this.renderDocSourceHTML()%></p>
//        <p class="inheritance-info">Declared in: $$overridesDAO{ model_: 'DAOListView', rowView: 'DocFeatureOverridesRefView', data: this.overridesDAO, model: Model }</p>
//      </div>
//    */}
//  ]
//});

//CLASS({
//  name: 'DocMethodArgumentsView',
//  extendsModel: 'DocFeaturesView',
//  help: 'Displays the documentation of the given Method Arguments. Data should be a Method.',

//  properties: [
//    {
//      name: 'rowView',
//      help: 'Override this to specify the view to use to display each feature.',
//      factory: function() { return 'DocMethodArgumentRowView'; }
//    }
//  ],

//  methods: {
//    getGroupFromTarget: function(target) {
//      return target.args$;
//    },
//    featureName: function() {
//      return "Arguments";
//    },
//    featureType: function() {
//      return "args";
//    },
//  },

//  templates: [
//    function toInnerHTML()    {/*
//    <%    this.destroy();
//          if (!this.hasDAOContent) { %>
//    <%    } else { %>
//            <p class="feature-sub-heading"><%=this.featureName()%>:</p>
//            <div class="memberList">$$filteredDAO{ model_: 'DAOListView', rowView: this.rowView, data: this.filteredDAO, model: Arg }</div>
//    <%    } %>
//    */}
//  ],
//});

//CLASS({
//  name: 'DocMethodArgumentRowView',
//  extendsModel: 'DocBodyView',
//  help: 'A view for each item in a list of Args.',

//  templates: [
//    function toInnerHTML() {/*
//      <p class="feature-sub-heading"><%=this.data.name%></p>
//      <p><%=this.renderDocSourceHTML()%></p>
//    */}
//  ]
//});

//CLASS({
//  name: 'DocMethodArgumentsSmallView',
//  extendsModel: 'DocMethodArgumentsView',
//  help: 'Displays the documentation of the given Method Arguments. Data should be a Method.',

//  properties: [
//    {
//      name: 'rowView',
//      help: 'Override this to specify the view to use to display each feature.',
//      factory: function() { return 'DocMethodArgumentSmallRowView'; }
//    },
//    {
//      name: 'tagName',
//      defaultValue: 'span'
//    }

//  ],

//  templates: [
//    function toInnerHTML()    {/*<%
//          this.destroy();
//          if (this.hasDAOContent) {
//            %>(<span>$$filteredDAO{ model_: 'DAOListView', rowView: this.rowView, data: this.filteredDAO, model: Arg }</span>)<%
//          } else {
//            %>()<%
//          }
//    %>*/}
//  ],
//});

//CLASS({
//  name: 'DocMethodArgumentSmallRowView',
//  extendsModel: 'DocBodyView',
//  help: 'An in-line view for each item in a list of Args.',

//  templates: [
//    function toInnerHTML() {/* <%=this.data.name%> */}
//  ]
//});



CLASS({
  name: 'DocChaptersView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocView',
  help: 'Displays the contents of the given Chapters.',

  methods: {
    onValueChange_: function() {
      this.updateHTML();
    },
    viewModel: function() { /* The $$DOC{ref:'Model'} type of the $$DOC{ref:'.data'}. */
      return this.X.Model; // force detailview to fall back to view.createTemplateView()
    }
  },
  
  templates: [
    function toInnerHTML()    {/*
    <%    this.destroy();
          if (this.data) { %>
            <div class="memberList">$$data{ model_: 'DAOListView', rowView: 'foam.documentation.DocumentationBookSummaryDocView', model: this.X.Documentation }</div>
    <%    } %>
    */}
  ]
});


//CLASS({
//  name: 'DocInnerModelsView',
//  extendsModel: 'DocFeaturesView',
//  help: 'Displays the documentation of the given inner Models.',

//  properties: [
//    {
//      name: 'rowView',
//      help: 'Override this to specify the view to use to display each feature.',
//      factory: function() { return 'DocInnerModelsRowView'; }
//    }
//  ],

//  methods: {
//    getGroupFromTarget: function(target) {
//      return target.models$;
//    },
//    featureName: function() {
//      return "Inner Models";
//    },
//    featureType: function() {
//      return "models";
//    },
//  },

//  templates: [
//    function toInnerHTML()    {/*
//    <%    this.destroy();
//          if (!this.hasFeatures && !this.hasInheritedFeatures) { %>

//    <%    } else {
//            if (this.hasFeatures) { %>
//              <p class="feature-type-heading"><%=this.featureName()%>:</p>
//              <div class="memberList">$$selfFeaturesDAO{ model_: 'DAOListView', rowView: this.rowView, data: this.selfFeaturesDAO, model: Model }</div>
//      <%    }
//            if (this.hasInheritedFeatures) { %>
//              <p class="feature-type-heading">Inherited <%=this.featureName()%>:</p>
//      <%
//              var fullView = this.X.DAOListView.create({ rowView: this.rowView, model: Property });
//              var collapsedView = this.X.DocFeatureCollapsedView.create();
//              %>
//              <div class="memberList inherited">$$inheritedFeaturesDAO{ model_: 'CollapsibleView', data: this.inheritedFeaturesDAO, collapsedView: collapsedView, fullView: fullView, showActions: true }</div>
//      <%    } %>
//    <%    } %>
//    */}
//  ]

//});

//CLASS({
//  name: 'DocInnerModelsRowView',
//  extendsModel: 'DocFeatureRowView',
//  help: 'A view for each item in a list of documented Methods, including arguments.',

//  templates: [
//    function toInnerHTML() {/*
//      <div id="scrollTarget_<%=this.data.id%>">
//        <p class="feature-heading">$$data{model_:this.X.DocFeatureSubmodelRefView}</p>
//        <p><%=this.renderDocSourceHTML()%></p>
//      </div>
//    */}
//  ]
//});

