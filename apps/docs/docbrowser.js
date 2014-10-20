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
        var newDAO = this.X.MDAO.create({model:this.X.ModelModel});

        // This is to make sure getPrototype is called, even if the model object
        // has been created without a .create or .getPrototype having been called
        // yet.
        for ( var key in UNUSED_MODELS ) {
          this.X[key];
        }
        for ( var key in USED_MODELS ) {
          this.X[key];
        }     

        // All models are now in USED_MODELS
        for ( var key in USED_MODELS ) {
          var m = this.X[key+"Model"];
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


MODEL({
  name: 'ModelDescriptionRowView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      help: 'The Model to describe',
      preSet: function(old,nu) {
        if (old) Events.unfollow(old.name$, this.modelName$);
        Events.follow(nu.name$, this.modelName$);
        return nu;
      }
    },
    {
      name: 'modelName',
      help: 'The Model to describe'
    },
  ],

  methods: {
    init: function() {
      // set up context // TODO: template is compile before we create subcontext
      this.X = this.X.sub({name:'ModelDescriptionRowView_X'});
      this.X.documentationViewParentModel = SimpleValue.create();

      this.SUPER();
    }
  },
  templates: [ // TODO: the data gets set on the modelNameView... screws it up
    function toInnerHTML() {/*
      <h3>$$modelName{model_:'DocRefView', ref$: this.modelName$}</h3>
    */}
  ]
});


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
  name: 'DocBrowserController',
  extendsModel: 'Model',

  documentation: function() {  /*
    <p>Some documentation for the $$DOC{ref:'.'} model.</p>
    <p>This should be expaneded to explain some of the interesting properties found here, such as $$DOC{ref:'.modelList'}.</p>
    <p>We can also mention how invalid references are caught $$DOC{ref:'modelList'}.</p>
    <p>And here's a normal property view in the same template: $$data{ mode: 'read-only' }</p>
    <p>Though you'd often want to link to related models, like $$DOC{ref:'DocModelBodyView'}, or even specific features on them, like $$DOC{ref:'DocModelView.data', text:'DocModelView&apos;s data property'}.</p>
    <p>Reference to a method argument: $$DOC{ref:'DocBrowserController.testMethod.args.testy'}</p>
    <p>This won't work since 'properties' here will resolve to the DocBrowserController.PROPERTIES feature: $$DOC{ref:'DocBrowserController.properties.modelListView'}. Only use direct access for layers below Model.feature.</p>
  */},

  methods: {
    init: function() {
      /* This is a method documentation comment: spawn and populate sub contexts. */

      // search context uses a selection value to indicate the chosen Model to display
      this.SearchContext = this.X.sub({}, 'searchX');
      this.SearchContext.selection$ = this.SearchContext.SimpleValue.create(); // holds a Model definition

      // detail context needs a documentViewParentModel to indicate what model it is rooted at
      this.DetailContext = this.X.sub({}, 'detailX');
      this.DetailContext.documentViewParentModel = this.DetailContext.SimpleValue.create();
      Events.follow(this.SearchContext.selection$, this.DetailContext.documentViewParentModel);

      this.X.documentViewRequestNavigation = function(ref) {
        if (ref.valid) {
          // TODO: navigate to feature sub-view as well
          this.DetailContext.documentViewParentModel.set(ref.resolvedModelChain[0]);
          this.selection = ref.resolvedModelChain[0]; // TODO: tighten up this update chain
        }
      }.bind(this);

      /////////////////////////// Context setup ^
      this.SUPER();
      /////////////////////////// this.init v

      // Push selection value out to the context so others can use it
      this.selection$ = this.SearchContext.selection$;

      // hack in URL support: (TODO: clean this up)

      // When search.selection changes set the hash
      this.SearchContext.selection$.addListener(this.onSelectionChange);

      // when the hash changes set the documentViewParentModel and this.selection
      window.addEventListener('hashchange', function() {
        this.DetailContext.documentViewParentModel.set(this.SearchContext[location.hash.substring(1)+"Model"]);
        this.selection = this.DetailContext.documentViewParentModel.get();
      }.bind(this));

      // initialization from hash
      this.DetailContext.documentViewParentModel.set(this.SearchContext[location.hash.substring(1)+"Model"]);
      // init this.selection
      this.selection = this.DetailContext.documentViewParentModel.get();

      var testArg = this.X.Arg.create({name: 'testy'});
      testArg.documentation = this.X.Documentation.create({
        body: function() { /*
          Argument $$DOC{ref:'.'} documentation.
          */ }
      });
      this.model_.methods[1].args.push(testArg);
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
    }
  },

  templates: [
    function toHTML()    {/*
      <div id="%%id">
        <h1>FOAM Documentation Browser</h1>
        <div class="contentPanes">
          <div class="listPane"><%=this.data.modelListView.toHTML()%></div>
          <div class="detailPane"><%=this.data.selectionView.toHTML()%></div>
        </div>
      </div>
    */}
  ]
});


