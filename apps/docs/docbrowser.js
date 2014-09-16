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
  name: 'DocView',
  extendsModel: 'DetailView',
  help: 'Displays the documentation of the given Model.',

  /// have to override onValueChange to get the HTML update to happen
  methods: {
    onValueChange_: function() { this.updateHTML(); },
  },

  templates: [
    function toHTML() {/*
      <div id="%%id">
        <%=this.toInnerHTML()%>
      </div>
    */},

    function toInnerHTML()    {/*
<%    if (this.data) {  %>
        <div class="introduction">
          <h1><%=this.data.name%></h1>
<%        if (this.data.extendsModel) { %>
            <h2>Extends <a href="#<%=this.data.extendsModel%>"><%=this.data.extendsModel%></a></h2>
<%        } else { %>
            <h2>Extends <a href="#Model">Model</a></h2>
<%        } %>
          <p class="text"><%=this.data.help%></p>
        </div>
        <div class="members">
          $$properties{ model_: 'DocPropertyView' }
        </div>
<%    } %>
    */}
  ]

});




MODEL({
  name: 'DocBrowserController',
  extendsModel: 'Model',

  documentation: function() { /*
      <div id=%%id >DOC DocBrowserController Template!</div>
    */},

  methods: {
    init: function() {
      // spawn and populate subcontexts
      this.SearchContext = this.X.sub({}, 'searchX');
      this.DetailContext = this.X.sub({}, 'detailX');
      // search context uses a selection value to indicate the chosen Model to display
      this.SearchContext.selection$ = this.SearchContext.SimpleValue.create();

      this.SUPER();

      // Push selection value out to the context so others can use it
      this.selection$ = this.SearchContext.selection$;

      // hack in URL support
      this.SearchContext.selection$.addListener(this.onSelectionChange);
      window.addEventListener('hashchange', function() {
        this.selection = this.SearchContext[location.hash.substring(1)];
      }.bind(this));
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
      documentation: function() { /*
          <div id=%%id >DOC modelList Property Template!</div>
      */}
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
        return this.DetailContext.DocView.create({ model: Model, data$: this.selection$ });
      }
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


