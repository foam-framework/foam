/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved
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
  name: 'DocFeaturesView',
  extendsModel: 'View',
  help: 'Displays the documentation of the given set of features.',

  properties: [
    {
      name:  'data',
      help: 'The model whose features to view.',
      postSet: function(old, data) {
        if (old) Events.unfollow(this.getGroupFromTarget(old), this.dao$);
        Events.follow(this.getGroupFromTarget(data), this.dao$);
        this.updateHTML();
      }
    },
    {
      name:  'dao',
      model_: 'DAOProperty',
      defaultValue: [],
      postSet: function() {
        this.filteredDAO = this.dao; //this.dao.where(EQ(Property.HIDDEN, FALSE));

      }
    },
    {
      name:  'filteredDAO',
      model_: 'DAOProperty',
      postSet: function() {
        var self = this;

        this.filteredDAO.select(COUNT())(function(c) {
          self.isEmpty = c.count <= 0;
        });
        
        this.inheritedFeaturesDAO = [].dao;
        this.X.docModelViewFeatureDAO
          .where(
                AND(AND(EQ(DocFeatureInheritanceTracker.MODEL, this.X.documentViewParentModel.get().id),
                        EQ(DocFeatureInheritanceTracker.IS_DECLARED, false)),
                    CONTAINS(DocFeatureInheritanceTracker.TYPE, this.featureType()))
                )
          .select(MAP(DocFeatureInheritanceTracker.FEATURE, this.inheritedFeaturesDAO));
      }
    },
    {
      name:  'inheritedFeaturesDAO',
      model_: 'DAOProperty',
      documentation: function() { /*
          Returns the list of features (matching this feature type) that are
          inherited but not declared or overridden in this $$DOC{ref:'Model'}
      */}
    },

    {
      name: 'isEmpty',
      defaultValue: true,
      postSet: function(_, nu) {
        this.updateHTML();
      }
    },
    {
      name: 'rowView',
      help: 'Override this to specify the view to use to display each feature.',
      factory: function() { return 'DocFeatureRowView'; }
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
  ],

  templates: [
    function toInnerHTML()    {/*
    <%    this.destroy();
          if (false) { %>
            <h2>No <%=this.featureName()%>.</h2>
    <%    } else { %>
            <h2><%=this.featureName()%>:</h2>
            <div class="memberList">$$filteredDAO{ model_: 'DAOListView', rowView: this.rowView, data: this.filteredDAO, model: Property }</div>
            <h2>Inherited <%=this.featureName()%>:</h2>
<%
            var fullView = this.X.DAOListView.create({ rowView: this.rowView, model: Property });
            var collapsedView = this.X.DocFeatureCollapsedView.create();
            %>
            <div class="memberList inherited">$$inheritedFeaturesDAO{ model_: 'CollapsableView', data: this.inheritedFeaturesDAO, collapsedView: collapsedView, fullView: fullView }</div>
    <%    } %>
    */}
  ],
// <div class="memberList inherited">$$inheritedFeaturesDAO{ model_: 'DAOListView', rowView: this.rowView, data: this.filteredDAO, model: Property }</div>

  methods: {
    getGroupFromTarget: function(target) {
      // implement this to return your desired feature (i.e target.properties$)
      console.assert(false, 'DocFeaturesView.getGroupFromTarget: implement me!');
    },
    featureName: function() {
      // implement this to return the display name of your feature (i.e. "Properties")
      console.assert(false, 'DocFeaturesView.featureName: implement me!');
    },
    featureType: function() {
      // implement this to return the type name (i.e. "Property", "Method", etc.)
      console.assert(false, 'DocFeaturesView.featureType: implement me!');
    }
  }

});

MODEL({
  name: 'DocFeatureCollapsedView',
  extendsModel: 'DocBodyView',
  help: 'A generic view for collapsed sets.',

  properties: [
    {
      name: 'data',
      postSet: function() {
        this.dao = this.data;
      }
    },
    {
      name:  'dao',
      model_: 'DAOProperty',
      defaultValue: [],
      postSet: function() {
        var self = this;
        this.dao.select(COUNT())(function(c) {
          self.count = c.count;
        });
      }
    },
    {
      name: 'count'
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <p><%=this.count%> more...</p>
    */}
  ]
});


MODEL({
  name: 'DocFeatureRowView',
  extendsModel: 'DocBodyView',
  help: 'A generic view for each item in a list of documented features.',

  methods: {
      overrides: function() {
        var name = "";
        this.X.docModelViewFeatureDAO
            .where(
                  AND(EQ(DocFeatureInheritanceTracker.NAME, this.data.name),
                      EQ(DocFeatureInheritanceTracker.IS_DECLARED, true))
            )
            .orderBy(DESC(DocFeatureInheritanceTracker.INHERITANCE_LEVEL))
            .select()(function(n) {
              n.forEach(function(m) {
                name = name + m.model+"  ";
              });
              return name;
            });
        return name;
    }
  },

  templates: [
    function toInnerHTML() {/*
      <h3><%=this.data.name%></h3>
      <%=this.renderDocSourceHTML()%>
      <p>O: <%= this.overrides() %></p>
    */}
  ]
});

MODEL({
  name: 'DocPropertiesView',
  extendsModel: 'DocFeaturesView',
  help: 'Displays the documentation of the given Properties.',

  properties: [
    {
      name:  'dao', // filter out hidden properties
      model_: 'DAOProperty',
      postSet: function() {
        this.filteredDAO = this.dao.where(EQ(Property.HIDDEN, FALSE));
      }
    }
  ],

  methods: {
    getGroupFromTarget: function(target) {
      return target.properties$;
    },
    featureName: function() {
      return "Properties";
    },
    featureType: function() {
      return "Property";
    }
  }

});

MODEL({
  name: 'DocRelationshipsView',
  extendsModel: 'DocFeaturesView',
  help: 'Displays the documentation of the given Relationships.',

  methods: {
    getGroupFromTarget: function(target) {
      return target.relationships$;
    },
    featureName: function() {
      return "Relationships";
    },
    featureType: function() {
      return "Relationship";
    },
  }

});


MODEL({
  name: 'DocActionsView',
  extendsModel: 'DocFeaturesView',
  help: 'Displays the documentation of the given Actions.',

  methods: {
    getGroupFromTarget: function(target) {
      return target.actions$;
    },
    featureName: function() {
      return "Actions";
    },
    featureType: function() {
      return "Action";
    },
  }

});

MODEL({
  name: 'DocListenersView',
  extendsModel: 'DocMethodsView',
  help: 'Displays the documentation of the given Listeners.',

  methods: {
    getGroupFromTarget: function(target) {
      return target.listeners$;
    },
    featureName: function() {
      return "Listeners";
    },
    featureType: function() {
      return "Listener";
    },
  }

});

MODEL({
  name: 'DocTemplatesView',
  extendsModel: 'DocFeaturesView',
  help: 'Displays the documentation of the given Templates.',

  methods: {
    getGroupFromTarget: function(target) {
      return target.templates$;
    },
    featureName: function() {
      return "Templates";
    },
    featureType: function() {
      return "Template";
    },
  }

});


MODEL({
  name: 'DocIssuesView',
  extendsModel: 'DocFeaturesView',
  help: 'Displays the documentation of the given Issues.',

  methods: {
    getGroupFromTarget: function(target) {
      return target.issues$;
    },
    featureName: function() {
      return "Issues";
    },
    featureType: function() {
      return "Issue";
    },
  }

});


MODEL({
  name: 'DocMethodsView',
  extendsModel: 'DocFeaturesView',
  help: 'Displays the documentation of the given Methods.',

  properties: [
    {
      name: 'rowView',
      help: 'Override this to specify the view to use to display each feature.',
      factory: function() { return 'DocMethodRowView'; }
    }
  ],

  methods: {
    getGroupFromTarget: function(target) {
      return target.methods$;
    },
    featureName: function() {
      return "Methods";
    },
    featureType: function() {
      return "Method";
    },
  }

});

MODEL({
  name: 'DocMethodRowView',
  extendsModel: 'DocFeatureRowView',
  help: 'A view for each item in a list of documented Methods, including arguments.',

  templates: [
    function toInnerHTML() {/*
      <h3><%=this.data.name%> $$THISDATA{ model_: 'DocMethodArgumentsSmallView' }</h3>
      <div class="memberList">$$THISDATA{ model_: 'DocMethodArgumentsView' }</div>
      <%=this.renderDocSourceHTML()%>
      <p>O: <%= this.overrides() %></p>
    */}
  ]
});

MODEL({
  name: 'DocMethodArgumentsView',
  extendsModel: 'DocFeaturesView',
  help: 'Displays the documentation of the given Method Arguments. Data should be a Method.',

  properties: [
    {
      name: 'rowView',
      help: 'Override this to specify the view to use to display each feature.',
      factory: function() { return 'DocMethodArgumentRowView'; }
    }
  ],

  methods: {
    getGroupFromTarget: function(target) {
      return target.args$;
    },
    featureName: function() {
      return "Arguments";
    },
    featureType: function() {
      return "Argument";
    },
  },

  templates: [
    function toInnerHTML()    {/*
    <%    this.destroy();
          if (this.isEmpty) { %>
    <%    } else { %>
            <h4><%=this.featureName()%>:</h4>
            <div class="memberList">$$filteredDAO{ model_: 'DAOListView', rowView: this.rowView, data: this.filteredDAO, model: Arg }</div>
    <%    } %>
    */}
  ],
});

MODEL({
  name: 'DocMethodArgumentRowView',
  extendsModel: 'DocBodyView',
  help: 'A view for each item in a list of Args.',

  templates: [
    function toInnerHTML() {/*
      <h5><%=this.data.name%></h5>
      <%=this.renderDocSourceHTML()%>
    */}
  ]
});

MODEL({
  name: 'DocMethodArgumentsSmallView',
  extendsModel: 'DocMethodArgumentsView',
  help: 'Displays the documentation of the given Method Arguments. Data should be a Method.',

  properties: [
    {
      name: 'rowView',
      help: 'Override this to specify the view to use to display each feature.',
      factory: function() { return 'DocMethodArgumentSmallRowView'; }
    },
    {
      name: 'tagName',
      defaultValue: 'span'
    }

  ],

  templates: [
    function toInnerHTML()    {/*<%
          this.destroy();
          if (!this.isEmpty) {
            %>(<span>$$filteredDAO{ model_: 'DAOListView', rowView: this.rowView, data: this.filteredDAO, model: Arg }</span>)<%
          } else {
            %>()<%
          }
    %>*/}
  ],
});

MODEL({
  name: 'DocMethodArgumentSmallRowView',
  extendsModel: 'DocBodyView',
  help: 'An in-line view for each item in a list of Args.',

  templates: [
    function toInnerHTML() {/* <%=this.data.name%> */}
  ]
});



MODEL({
  name: 'DocChaptersView',
  extendsModel: 'DocFeaturesView',
  help: 'Displays the contents of the given Chapters.',

  properties: [
    {
      name: 'rowView',
      help: 'Override this to specify the view to use to display each feature.',
      factory: function() { return 'DocBookView'; }
    }
  ],

  methods: {
    getGroupFromTarget: function(target) {
      return target.chapters$;
    },
    featureName: function() {
      return "Chapters";
    },
    featureType: function() {
      return "Documentation";
    },
  },

  templates: [
    function toInnerHTML()    {/*
    <%    this.destroy();
          if (this.isEmpty) { %>
    <%    } else { %>
            <h2><%=this.featureName()%>:</h2>
            <div class="memberList">$$filteredDAO{ model_: 'DAOListView', rowView: this.rowView, data: this.filteredDAO, model: Property }</div>
    <%    } %>
    */}
  ]
});

