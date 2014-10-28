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
			postSet: function() { console.log("Search change: "+this.search); }
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
      <p class="browse-list-entry">$$modelName{model_:'DocRefView', ref$: this.modelName$}</p>
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
        <div class="search-field-container"><%=this.data.searchView.toHTML()%></div>
        <div class="list-container">
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
      this.DetailContext.documentViewRef = this.DetailContext.DocRef.create();
      //Events.follow(this.SearchContext.selection$, this.DetailContext.documentViewParentModel);

      this.X.documentViewRequestNavigation = function(ref) {
        if (ref.valid) {
          // TODO: navigate to feature sub-view as well
          this.selection = ref.resolvedModelChain[0]; // TODO: tighten up this update chain
          this.DetailContext.documentViewParentModel.set(ref.resolvedModelChain[0]);
          this.DetailContext.documentViewRef.ref = ref.resolvedRef;
          this.SearchContext.selection$.set(this.DetailContext.documentViewParentModel.get());
          location.hash = "#" + ref.resolvedRef;
        }
      }.bind(this);

      /////////////////////////// Context setup ^
      this.SUPER();
      /////////////////////////// this.init v

      // when the hash changes set the documentViewParentModel and this.selection
      window.addEventListener('hashchange', function() {
        this.DetailContext.documentViewRef.ref = location.hash.substring(1);
        if (this.DetailContext.documentViewRef.valid) {
          this.DetailContext.documentViewParentModel.set(
               this.DetailContext.documentViewRef.resolvedModelChain[0]);
          this.SearchContext.selection$.set(this.DetailContext.documentViewParentModel.get());

        }
      }.bind(this));

      // initialization from hash
      if (location.hash === '#' || location.hash === '#undefined' || location.hash.length === 0) location.hash = 'DevDocumentation_Welcome';
      this.DetailContext.documentViewRef.ref = location.hash.substring(1);
      if (this.DetailContext.documentViewRef.valid) {
        this.DetailContext.documentViewParentModel.set(
             this.DetailContext.documentViewRef.resolvedModelChain[0]);
        this.SearchContext.selection$.set(this.DetailContext.documentViewParentModel.get());
      }

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
        return this.DetailContext.DocModelView.create({ model: Model, data: this.DetailContext.documentViewRef });
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

//  templates: [
//    function toHTML()    {/*
//      <div id="%%id">
//        <h1>FOAM Documentation Browser</h1>
//        <div class="contentPanes">
//          <div class="listPane"><%=this.data.modelListView.toHTML()%></div>
//          <div class="detailPane"><%=this.data.selectionView.toHTML()%></div>
//        </div>
//      </div>
//    */}
//  ]

  templates: [
    function CSS() {/*
      body {
        margin: 0px;
        font-family: 'Roboto', sans-serif;
        font-size: inherit;

        background-color: #e0e0e0;
        position: relative;
      }

      .docbrowser-header {
        height: 90px;
        position: relative;
        color: #fff;
        z-index: 1;
      }

      .docbrowser-header-inner {
        background-color: #5555FF;
        position: absolute;
        height: 120px;
        width: 100%;
      }

      .docbrowser-header-flex-container {
        display: flex;
        justify-content: space-around;
        margin: 0 50px;
      }
      .docbrowser-header-contents {
        flex-grow: 1;
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
      }
      .outer-flex-container {
        display: flex;
        justify-content: space-around;
        margin-bottom: 60px;
        width: 100%;
        height: 83%;
      }
      .inner-container {
        background-color: #fff;
        border: 1px solid #888;
        border-radius: 12px;
        flex-grow: 1;
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
				order: 1;
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
        padding-left: 2em;
      }
      div.memberList {
        padding-left: 2em;
      }
			
			div.chapters div.memberList {
				padding-left: 0;
			}

      div.inherited {
        color: #666666;
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

      .light {
        color: #444;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>">
        <div class="docbrowser-header">
          <div class="docbrowser-header-inner">
            <div class="docbrowser-header-flex-container">
              <div class="docbrowser-header-contents">
                <div class="docbrowser-title">FOAM Documentation</div>
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


