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

DEBUG = true;

MODEL({
  name: 'ModelListController',
  properties: [
    {
      name: 'search',
    },
    {
      name: 'searchView',
      factory: function() {
        return this.X.mdTextFieldView.create({ data$: this.search$, label:'Search', onKeyMode: true, displayWidth: 20 });
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
          var modl = FOAM.lookup(key, this.X);
          modl.getPrototype && modl.getPrototype();
        }
        for ( var key in USED_MODELS ) {
          var modl = FOAM.lookup(key, this.X);
          modl.getPrototype && modl.getPrototype();
        }

        // All models are now in USED_MODELS
        for ( var key in USED_MODELS ) {
          var m = FOAM.lookup(key, this.X);
          if ( ! m.getPrototype ) continue;
          m.getPrototype();
          newDAO.put(m);
        };

        // Add in non-model things like Interfaces
        for ( var key in NONMODEL_INSTANCES ) {
          var m = FOAM.lookup(key, this.X);
          newDAO.put(m);
        };


        // load up books
        for (var key in this.X.developerDocs) {
          newDAO.put(this.X.developerDocs[key]);
        }

        return newDAO;
      }
    },
    {
      name: 'filteredDAO',
      model_: 'DAOProperty',

      dynamicValue: function() {
        return this.dao.orderBy(this.order)
            .where(OR(CONTAINS_IC(Model.NAME, this.search), CONTAINS_IC(Model.PACKAGE, this.search)));
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
      postSet: function() {
        this.modelRef = this.data.package? this.data.package + "." + this.data.name : this.data.name;
        this.modelName = this.data.package? "["+this.data.package + "]&nbsp;" + this.data.name : this.data.name;
      }
    },
    {
      name: 'modelName',
      help: 'The Model package and name.'
    },
    {
      name: 'modelRef'
    }
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
      <p class="browse-list-entry">$$modelName{model_:'DocRefView', ref$: this.modelRef$, text$: this.modelName$}</p>
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
      <div class="search-field-container"><%=this.data.searchView.toHTML()%></div>
      <div class="list-container">
        <div><%=this.data.filteredDAOView.toHTML()%></div>
      </div>
    */}
  ]
});



MODEL({
  name: 'DocBrowserController',

  documentation: function() {  /*
    <p>Some documentation for the $$DOC{ref:'.'} model.</p>
    <p>This should be expaneded to explain some of the interesting properties found here, such as $$DOC{ref:'.modelList'}.</p>
    <p>We can also mention how invalid references are caught $$DOC{ref:'modelList'}.</p>
    <p>And here's a normal property view in the same template: $$data{ mode: 'read-only' }</p>
    <p>Though you'd often want to link to related models, like $$DOC{ref:'DocModelBodyView'}, or even specific features on them, like $$DOC{ref:'DocModelView.data', text:'DocModelView&apos;s data property'}.</p>
    <p>Reference to a method argument: $$DOC{ref:'DocBrowserController.testMethod.args.testy'}</p>
    <p>This won't work since 'properties' here will resolve to the DocBrowserController.PROPERTIES feature: $$DOC{ref:'DocBrowserController.properties.modelListView'}. Only use direct access for layers below Model.feature.</p>
    <p>Linking to a $$DOC{ref:'Model'} property value of a $$DOC{ref:'Model'} (rather than a feature): $$DOC{ref:'DocBrowserController'} </p>
  */},

  models: [
    {
      model_: 'Model',
      name: 'NamedInnerModel',
      documentation: function() { /* Docs for named inner model. $$DOC{ref:"."} */ },
      models: [
        {
          model_: 'Model',
          name: 'InnyInner',
          documentation: function() { /* Inny Inner! $$DOC{ref:"."} */ },
        }
      ]

    },
//    {
//      model_: 'Model',

//    }
  ],

  methods: {
    init: function() {
      /* This is a method documentation comment: spawn and populate sub contexts. */

      // load developer guides
      RegisterDevDocs(this.X);

      // search context uses a selection value to indicate the chosen Model to display
      this.SearchContext = this.X.sub({}, 'searchX');
      this.SearchContext.selection$ = this.SearchContext.SimpleValue.create(); // holds a Model definition

      // detail context needs a documentViewRef.get().resolvedRoot to indicate what model it is rooted at
      this.DetailContext = this.X.sub({}, 'detailX');
      this.DetailContext.documentViewRef = this.DetailContext.SimpleValue.create();// this.DetailContext.DocRef.create();

      this.X.documentViewRequestNavigation = this.requestNavigation.bind(this);

      /////////////////////////// Context setup ^
      this.SUPER();
      /////////////////////////// this.init v

      // when the hash changes set the documentViewRef and this.selection
      window.addEventListener('hashchange', this.setReferenceFromHash.bind(this));

      // initialization from hash
      this.setReferenceFromHash();

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
    },

    setReferenceFromHash: function() {
      if (location.hash === '#' || location.hash === '#undefined' || location.hash.length === 0) {
        location.hash = 'developerDocs.Welcome';
        return;
      }
      // don't respond if we are already at the location desired
      if (location.hash.substring(1) === this.DetailContext.documentViewRef.get().ref) return;

      var newRef = this.DetailContext.DocRef.create({ref:location.hash.substring(1)});
      if (newRef.valid) {
        this.DetailContext.documentViewRef.set(newRef);
        this.SearchContext.selection$.set(newRef.resolvedRoot.resolvedModelChain[0]); // selection wants a Model object

      }
    },

    requestNavigation: function(ref) {
      if (ref.valid) {
        this.selection = ref.resolvedModelChain[0];
        this.DetailContext.documentViewRef.set(ref);
        this.SearchContext.selection$.set(ref.resolvedRoot.resolvedModelChain[0]); // selection wants a Model object
        location.hash = "#" + ref.resolvedRef;
      }
    }

  },

  listeners: [
    {
      name: 'onReadyToScroll',
      code: function(evt) {

      }
    }
  ],

  properties: [
    {
      name: 'modelList',
      factory: function() {
        return this.SearchContext.ModelListController.create();
      }
    },
    {
      name: 'modelListView',
      factory: function() {
        return this.SearchContext.ControllerView.create({ model: ModelListController,
                                                          data$: this.modelList$ });
      }
    },
    {
      name: 'selectionView',
      factory: function() {
        return this.DetailContext.DocModelView.create({ model: Model, data$: this.DetailContext.documentViewRef });
      }
    },
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
    function CSS() {/*
      body {
        margin: 0px;
        font-family: 'Roboto', sans-serif;
        font-size: inherit;

        background-color: #e0e0e0;
        position: relative;
        
      }

      .outermost {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .docbrowser-header {
        height: 90px;
        position: relative;
        color: #fff;
        z-index: 1;
        flex-shrink: 0;
      }

      .docbrowser-header-inner {
        background-color: #5555FF;
        position: absolute;
        height: 120px;
        width: 100%;
        flex-shrink: 0;
      }

      .docbrowser-header-flex-container {
        display: flex;
        flex-shrink: 0;
        justify-content: space-around;
        margin: 0 50px;
      }
      .docbrowser-header-contents {
        flex-grow: 1;
        flex-shrink: 0;
        max-width: 1280px;

        display: flex;
        justify-content: space-between;
      }

      .docbrowser-title {
        font-weight: lighter;
        font-size: 250%;
        margin-top: 20px;
      }
      .docbrowser-tabs {
        font-size: 120%;
        font-weight: lighter;
        margin-top: 40px;
        margin-right: 20px;
      }
      .docbrowser-tab {
        margin-left: 50px;
      }
      .docbrowser-tab.enabled {
        font-weight: normal;
      }

      .outer-container {
        margin: 0 30px;
        z-index: 2;
        position: relative;
        display:flex;
        flex-direction: column;
        
        flex-shrink: 1;
        flex-basis: 10000px;
      }
      .outer-flex-container {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        margin-bottom: 60px;
        width: 100%;
        flex-grow: 1;
 //       height: 83%;
      }
      .inner-container {
        background-color: #fff;
        border: 1px solid #888;
        border-radius: 12px;
        flex-grow: 1000;
        flex-shrink: 1;
        flex-basis: 1px;
        max-width: 1280px;
        padding: 15px;
        box-shadow: 0px 5px 5px #888888;
        display:flex;
      }

      input {
        font-family: inherit;
        font-size: inherit;
      }

      p {
        padding-bottom: 0.5em;
      }
      li {
        padding-bottom: 0.5em;
      }

      div.listPane {
        min-width: 200px;
        flex-basis: 200px;
        order: 1;
        padding: 1em;
        flex-grow: 0;
        overflow-x: hidden;

        display: flex;
        flex-direction: column;
      }

      div.detailPane {
        order: 2;
        flex-grow: 10;
        overflow-y: scroll;
        padding: 1em;
      }
      
      div.detailPane div.chapters h2 {
        font-size: 110%;
      }
      
      div.search-field-container {
        flex-grow: 0;
        flex-shrink: 0;
        order: 1;
        padding: 0;
        margin-left: -15;
      }
      
      div.list-container {
        order: 2;
        flex-grow: 1;
        overflow-y:scroll;
        overflow-x:hidden;
      }
      div.list-container span.docLink {
        border-bottom: none;
      }
        
      div.members {
        margin-top: 1em;
        padding-left: 2em;
      }
      div.memberList {
        padding-left: 2em;
      }
      
      div.chapters div.memberList {
        padding-left: 0;
      }

      div.inherited {
        color: #333333;
      }
      
      p.browse-list-entry {
        font-size:100%;
        font-weight: bold;
        line-height: 150%
      }
      
      span.docLink {
        cursor: pointer;
        color: #000077;
        border-bottom: 0.1em dotted #999;
      }

      span.docLinkNoDocumentation {
        color: #770000;
        
      }

      div.model-info-block {
        padding: 1em;
        margin: 1em 0 1em 0;
        border-top: 0.1em solid black;
        border-bottom: 0.1em solid black;
      }
      div.model-info-block p.note {
        font-size:105%;
      }
      div.model-info-block p.important {
        font-size:105%;
        font-weight:bold;
      }
      
      .feature-row {
        //border-top: 0.1em solid grey;
        margin-top: 1em;
        margin-bottom: 1em;
      }

      p.inheritance-info {
        font-size: 90%;
        padding-left: 1em;
      }

      .feature-type-heading {
        font-weight: bold;
        font-size: 150%;
      }
      .feature-heading {
        font-weight: bold;
        font-size: 125%;
      }
      .feature-sub-heading {
        font-weight: bold;
        font-size: 100%;
      }
      .feature-type {
        float:right;
      }

      .light {
        color: #444;
      }
    */},
    function toHTML() {/*
      <div class="outermost" id="<%= this.id %>">
        <div class="docbrowser-header">
          <div class="docbrowser-header-inner">
            <div class="docbrowser-header-flex-container">
              <div class="docbrowser-header-contents">
                <div class="docbrowser-title"><img src="images/browsertitle-lg.png" alt="FOAM API Reference"/></div>
              </div>
            </div>
          </div>
        </div>

        <div id="<%= this.id %>-outer-container" class="outer-container">
          <div class="outer-flex-container">
            <div id="<%= this.id %>-inner-container" class="inner-container">
                <div class="listPane"><%=this.data.modelListView.toHTML()%></div>
                <div class="detailPane"><%=this.data.selectionView.toHTML()%></div>
            </div>
          </div>
        </div>
      </div>
    */}
  ]


});


