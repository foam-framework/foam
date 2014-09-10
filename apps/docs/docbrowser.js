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
      view: { model_: 'TextFieldView', onKeyMode: true }
    },
    {
      name: 'dao',
      factory: function() {
        var newDAO = MDAO.create({model:Model});

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
      view: {
        model_: 'DAOListView', //'ScrollView',
        rowView: 'ModelDescriptionRowView',
      },

      dynamicValue: function() {
        return this.dao.orderBy(this.order)
            .where(CONTAINS_IC(Model.NAME, this.search));
      }
    }
  ]
});


MODEL({ name: 'ModelDescriptionRowView', extendsModel: 'DetailView', templates: [
  function toHTML() {/*
      <div class="thumbnail">
        <p>$$name{mode:'read-only'}</p>
      </div>
  */}
]});


MODEL({
  name: 'ControllerView',
  extendsModel: 'DetailView',

  templates: [
    function toHTML() {/*
      <div id="%%id">
        <div>$$search</div>
        <div style="height:90%;overflow-y:scroll">
          <div>$$filteredDAO</div>
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
<% console.log("innnerHTML"); %>
<%    if (this.data) {  %>
    <% console.log("Have data!" + this.data); %>
        <div class="introduction">
          <p class="h1"><%=this.data.name%></p>
<%        if (this.data.extendsModel) { %>
            <p class="h2">Extends <a href="#<%=this.data.extendsModel%>"><%=this.data.extendsModel%></a></p>
<%        } else { %>
            <p class="h2">Extends <a href="#Model">Model</a></p>
<%        } %>
          <p class="text"><%=this.data.help%></p>
        </div>
        <div class="members">
          $$properties{ model_: 'DocPropertyView', rowView: 'DocPropertyRowView' }
        </div>
<%    } %>
    */}
  ]

});

MODEL({
  name: 'DocPropertyView',
  extendsModel: 'DAOListView',
  help: 'Displays the documentation of the given Properties.',

  templates: [
    function toHTML()    {/*
      <div id="%%id">
<%    if (this.data) {  %>
        <p class="h2">Properties:</p>
        <div><%=0%></div>
<%    } else { %>
        <p class="h2">No Properties.</p>
<%    } %>
      </div>
    */}
  ]
});

MODEL({
  name: 'DocPropertyRowView',
  extendsModel: 'DetailView',

  templates: [
    function toHTML() {/*
      <div id="%%id">
        <p class="h3"><%=this.data.name%></p>
      </div>
    */}
  ]
});




MODEL({
  name: 'DocBrowserController',
  extendsModel: 'Model',

  methods: {
    init: function() {
      // spawn and populate subcontext
      //this.X = this.X.sub(); // TODO: fix context propagation
      this.X.selection$ = SimpleValue.create();

      this.SUPER();

      // Push selection value out to the context so others can use it
      this.selection$ = this.X.selection$;

      // hack in URL support
      this.X.selection$.addListener(this.onSelectionChange);
      window.addEventListener('hashchange', function() {
        this.selection = this.X[location.hash.substring(1)];
      }.bind(this));
    }
  },

  listeners: [
    {
     name: 'onSelectionChange',
     code: function(evt) {
        location.hash = "#" + this.X.selection$.value.name;
     }
    }
  ],

  properties: [
    {
      name: 'modelList',
      factory: function() {
        return this.X.ModelListController.create();
      },
      view: {
        model_: 'ControllerView',
        model: ModelListController
      }
    },
    {
      name: 'selection',
      postSet: function() {
        console.log("setting selection" + this.selection.name);
      },
      view: {
        model_: 'DocView',
        model: Model,
      }
    }
  ]
});

MODEL({
  name: 'DocBrowserView',
  extendsModel: 'DetailView',

  templates: [
    function toHTML()    {/*
      <div id="%%id">
        <div style="float:left;width:50%">$$modelList</div>
        <div style="float:left;width:50%">$$selection</div>
      </div>
    */}
  ]
});


