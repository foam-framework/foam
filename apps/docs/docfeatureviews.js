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
//        <p class="inheritance-info">Declared in: $$overridesDAO{ model_: 'foam.documentation.TextualDAOListView', rowView: 'DocFeatureOverridesRefView', data: this.overridesDAO, model: Model }</p>
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
//            <div class="memberList">$$filteredDAO{ model_: 'foam.ui.DAOListView', rowView: this.rowView, data: this.filteredDAO, model: Arg }</div>
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
//            %>(<span>$$filteredDAO{ model_: 'foam.ui.DAOListView', rowView: this.rowView, data: this.filteredDAO, model: Arg }</span>)<%
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
//              <div class="memberList">$$selfFeaturesDAO{ model_: 'foam.ui.DAOListView', rowView: this.rowView, data: this.selfFeaturesDAO, model: Model }</div>
//      <%    }
//            if (this.hasInheritedFeatures) { %>
//              <p class="feature-type-heading">Inherited <%=this.featureName()%>:</p>
//      <%
//              var fullView = this.X.foam.ui.DAOListView.create({ rowView: this.rowView, model: Property });
//              var collapsedView = this.X.foam.documentation.DocFeatureCollapsedView.create();
//              %>
//              <div class="memberList inherited">$$inheritedFeaturesDAO{ model_: 'foam.ui.CollapsibleView', data: this.inheritedFeaturesDAO, collapsedView: collapsedView, fullView: fullView, showActions: true }</div>
//      <%    } %>
//    <%    } %>
//    */}
//  ]

//});
