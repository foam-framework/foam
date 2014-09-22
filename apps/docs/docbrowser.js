/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved
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


var touchManager = TouchManager.create({});
touchManager.install(document);
var gestureManager = GestureManager.create();


MODEL({
  name: 'ModelListController',
  properties: [
    {
      name: 'search',
    },
    {
      name: 'searchView',
      factory: function() {
        return this.X.TextFieldView.create({ data$: this.search$, onKeyMode: true });
      }
    },
    {
      name: 'dao',
      factory: function() {
        var newDAO = this.X.MDAO.create({model:Model});

        // This is to make sure getPrototype is called, even if the model object
        // has been created without a .create or .getPrototype having been called
        // yet.
        for ( var key in UNUSED_MODELS ) {
          this.X[key].getPrototype && this.X[key].getPrototype();
        }
        for ( var key in USED_MODELS ) {
          this.X[key].getPrototype && this.X[key].getPrototype();
        }     

        // All models are now in USED_MODELS
        for ( var key in USED_MODELS ) {
          var m = this.X[key];
          if ( ! m.getPrototype ) continue;
          m.getPrototype();
          newDAO.put(m);
        };

        return newDAO;
      }
    },
    {
      name: 'filteredDAO',
      model_: 'DAOProperty',

      dynamicValue: function() {
        return this.dao.orderBy(this.order)
            .where(CONTAINS_IC(Model.NAME, this.search));
      }
    },
    {
      name: 'filteredDAOView',
      factory: function() {
        return this.X.DAOListView.create({ data$: this.filteredDAO$, rowView: 'ModelDescriptionRowView' });
      }
    }
  ]
});


MODEL({ name: 'ModelDescriptionRowView', extendsModel: 'DetailView', templates: [
  function toHTML() {/*
      <div class="thumbnail">
        <p><%=this.data.name%></p>
      </div>
  */}
//  <p>$$name{mode:'read-only'}</p>
]});


MODEL({
  name: 'ControllerView',
  extendsModel: 'DetailView',

  methods: {
    initHTML: function() {
      this.data.searchView.initHTML();
      this.data.filteredDAOView.initHTML();
    }
  },

  templates: [
    function toHTML() {/*
      <div id="%%id">
        <div><%=this.data.searchView.toHTML()%></div>
        <div style="height:90%;overflow-y:scroll">
          <div><%=this.data.filteredDAOView.toHTML()%></div>
        </div>
      </div>
    */}
  ]
});


MODEL({
  name: 'DocModelView',
  extendsModel: 'View',
  help: 'Displays the documentation of the given Model.',

  properties: [
    {
      name: 'data',
      help: 'The Model for which to display documentation.',
      postSet: function() {
        this.dataProperties = this.data.properties;

        this.updateHTML();
      }
    },
  ],

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.data) {  %>
        <div class="introduction">
          <h1><%=this.data.name%></h1>
<%        if (this.data.extendsModel) { %>
            <h2>Extends <a href="#<%=this.data.extendsModel%>"><%=this.data.extendsModel%></a></h2>
<%        } else { %>
            <h2>Extends <a href="#Model">Model</a></h2>
<%        } %>
          $$data{ model_: 'DocModelBodyView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocPropertiesView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocMethodsView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocActionsView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocListenersView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocTemplatesView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocRelationshipsView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocIssuesView' }
        </div>

<%    } %>
    */}
  ]

});



MODEL({
  name: 'DocBrowserController',
  extendsModel: 'Model',

  documentation: {
    model_: 'Documentation',
    body: function() {  /*
          <p>Some documentation for the $$DOC{ref:'.'} model.</p>
          <p>This should be expaneded to explain some of the interesting properties found here, such as $$DOC{ref:'.modelList'}.</p>
          <p>We can also mention how invalid references are caught $$DOC{ref:'modelList'}.</p>
          <p>And here's a normal property view in the same template: $$data{ mode: 'read-only' }</p>
          <p>Though you'd often want to link to related models, like $$DOC{ref:'DocModelBodyView'}, or even specific features on them, like $$DOC{ref:'DocModelView.docSource', text:'DocModelView&apos;s doc source property'}.</p>
          <p>Reference to a method argument: $$DOC{ref:'DocBrowserController.testMethod.args.a'}</p>
          <p>This won't work since 'properties' here will resolve to the DocBrowserController.PROPERTIES feature: $$DOC{ref:'DocBrowserController.properties.modelListView'}. Only use direct access for layers below Model.feature.</p>
        */}
  },

  methods: {
    init: function() {
      /* spawn and populate sub%%id contexts...  */
      this.SearchContext = this.X.sub({}, 'searchX');
      this.DetailContext = this.X.sub({}, 'detailX');

      // search context uses a selection value to indicate the chosen Model to display
      this.SearchContext.selection$ = this.SearchContext.SimpleValue.create();

      // detail context needs a documentViewParentModel to indicate what model it is rooted at
      this.DetailContext.documentViewParentModel = this.DetailContext.SimpleValue.create();
      Events.follow(this.SearchContext.selection$, this.DetailContext.documentViewParentModel);

      this.SUPER();

      // Push selection value out to the context so others can use it
      this.selection$ = this.SearchContext.selection$;

      // hack in URL support
      this.SearchContext.selection$.addListener(this.onSelectionChange);
      window.addEventListener('hashchange', function() {
        this.selection = this.SearchContext[location.hash.substring(1)];
      }.bind(this));

      this.model_.methods[1].args.push(this.X.Arg.create({name: 'a'}));
    },

    testMethod: function(a1, b2) {
      return a1 + b2;
    }
  },

  listeners: [
    {
      name: 'onSelectionChange',
      code: function(evt) {
        location.hash = "#" + this.SearchContext.selection$.value.name;

     }
    }
  ],

  properties: [
    {
      name: 'modelList',
      factory: function() {
        return this.SearchContext.ModelListController.create();
      },
      documentation: {
        model_: 'Documentation',
        body: function() { /*
          Hello $$DOC{ref:'DocBrowserController.modelList'}. property doc!
          */ },
      },
    },
    {
      name: 'modelListView',
      factory: function() {
        return this.SearchContext.ControllerView.create({ model: ModelListController,
                                                          data$: this.modelList$ });
      }
    },
    {
      name: 'selection',
    },
    {
      name: 'selectionView',
      factory: function() {
        return this.DetailContext.DocModelView.create({ model: Model, data$: this.selection$ });
      }
    },
    {
      name: 'documentationView',
      factory: function() {
        return this.DetailContext.DocModelBodyView.create({ data: this.model_ });
      }
    }

  ],
  relationships: [
    {
      name: 'listOview',
      label: 'some other things',
      relatedModel: 'ControllerView',
      relatedProperty: 'modelListView'
    }
  ]


});

MODEL({
  name: 'DocBrowserView',
  extendsModel: 'DetailView',

  methods: {
    initHTML: function() {
      this.data.modelListView.initHTML();
      this.data.selectionView.initHTML();
      this.data.documentationView.initHTML();
    }
  },

  templates: [
    function toHTML()    {/*
      <div id="%%id">
        <h1>FOAM Documentation Browser</h1>
        <div class="contentPanes">
          <div class="listPane"><%=this.data.modelListView.toHTML()%></div>
          <div class="detailPane"><%=this.data.selectionView.toHTML()%></div>
          <div class="docPane"><%=this.data.documentationView.toHTML()%></div>
        </div>
      </div>
    */}
  ]
});


