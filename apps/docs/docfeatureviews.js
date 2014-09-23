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
        this.filteredDAO.select(COUNT())(function(c) {
          this.isEmpty = c.count <= 0;
        }.bind(this));
      }
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
          if (this.isEmpty) { %>
            <h2>No <%=this.featureName()%>.</h2>
    <%    } else { %>
            <h2><%=this.featureName()%>:</h2>
            <div class="memberList">$$filteredDAO{ model_: 'DAOListView', rowView: this.rowView, data: this.filteredDAO, model: Property }</div>
    <%    } %>
    */}
  ],

  methods: {
    getGroupFromTarget: function(target) {
      debugger; // implement this to return your desired feature (i.e target.properties$)
    },
    featureName: function() {
      debugger; // implement this to return the display name of your feature (i.e. "Properties")
    },
  }

});

MODEL({
  name: 'DocFeatureRowView',
  extendsModel: 'DocBodyView',
  help: 'A generic view for each item in a list of documented features.',

  templates: [
    function toInnerHTML() {/*
      <h3><%=this.data.name%></h3>
      <%=this.renderDocSourceHTML()%>
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
  }

});

MODEL({
  name: 'DocListenersView',
  extendsModel: 'DocFeaturesView',
  help: 'Displays the documentation of the given Listeners.',

  methods: {
    getGroupFromTarget: function(target) {
      return target.listeners$;
    },
    featureName: function() {
      return "Listeners";
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
  }

});

MODEL({
  name: 'DocMethodRowView',
  extendsModel: 'DocBodyView',
  help: 'A view for each item in a list of documented Methods, including arguments.',

  templates: [
    function toInnerHTML() {/*
      <h3><%=this.data.name%></h3>
      <div class="memberList">$$THISDATA{ model_: 'DocMethodArgumentsView' }</div>
      <%=this.renderDocSourceHTML()%>
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
  },

  templates: [
    function toInnerHTML()    {/*
    <%    this.destroy();
          if (this.isEmpty) { %>
            <h4>(No <%=this.featureName()%>.)</h4>
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
