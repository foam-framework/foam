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

        // This is to make sure getPrototype is called, even if the model object has been created
        // without a .create or .getPrototype having been called yet.
        for ( var key in UNUSED_MODELS ) this.X[key].getPrototype && this.X[key].getPrototype();
        for ( var key in USED_MODELS ) this.X[key].getPrototype && this.X[key].getPrototype();

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
        useSelection: true // clicks are happening, listen for selection$ changes
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
        <p>$$name{mode:'read-only'}: $$help{mode: 'read-only'}</p>
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
        <div>$$filteredDAO</div>
      </div>
    */}
  ]
});


/** A display-only on-line help view. **/
MODEL({
  name: 'DocView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      type: 'Model',
      postSet: function(old, nu) {
        // replace our content in the DOM
        this.updateHTML();
      }
    }
  ],

  methods: {
    // TODO: make this a template
    toInnerHTML: function() {
      var model = this.data;
      var out   = [];

      if (!model || !model.properties) return;

      out.push('<div class="intro">');
      out.push(model.help);
      out.push('</div>');

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        out.push('<div class="label">');
        out.push(prop.label);
        out.push('</div><div class="text">');
        if ( prop.subType /*&& value instanceof Array*/ && prop.type.indexOf('[') != -1 ) {
          var subModel = this.X[prop.subType];
          var subView  = DocView.create({model: subModel});
          if ( subModel != model )
            out.push(subView.toHTML());
        } else {
          out.push(prop.help);
        }
        out.push('</div>');
      }
      return out.join('');
    }
  }
});


MODEL({
  name: 'DocBrowserController',
  extendsModel: 'Model',

  methods: {
    init: function() {
      this.SUPER();

      // Push selection value out to the context so others can use it
      if (!this.X.selection$) {
        this.X.selection$ = SimpleValue.create();
        this.X.selection$ = this.selection$;
      } else {
        this.selection$ = this.X.selection$;
      }
    }
  },

  properties: [
    {
      name: 'modelList',
      factory: function() {
        return ModelListController.create();
      },
      view: {
        model_: 'ControllerView',
        model: ModelListController
      }
    },
    {
      name: 'selection',
      view: 'DocView'
    }
  ]
});

MODEL({
  name: 'DocBrowserView',
  extendsModel: 'DetailView',

  methods: {
    initHTML: function() {
      this.SUPER();

      // TODO: find a better way to propagate this information
      //this.data.selection$ = this.X.selection$ //this.modelListView.filteredDAOView.selection$;
    }
  },

  templates: [
    function toHTML()    {/*
      <div id="%%id">
        <div style="float:left;width:50%">$$modelList</div>
        <div style="float:left;width:50%">$$selection</div>
      </div>
    */}
  ]
});


