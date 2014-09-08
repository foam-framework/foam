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


//var Y = this.X.subWindow(window);
var touchManager = TouchManager.create({});
touchManager.install(document);
var gestureManager = GestureManager.create();


MODEL({
  name: 'Controller',
  properties: [
    {
      name: 'search',
      view: { model_: 'TextFieldView', onKeyMode: true }
    },
    {
      name: 'order',
      defaultValue: Model.NAME,
      view: { model_: 'ChoiceView', choices: [
        [ Model.NAME, 'Alphabetical' ],
        [ Model.HELP,  'By Description for some reason' ]
      ] }
    },
    {
      name: 'dao',
      factory: function() {
         return MDAO.create({model:Model});
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

      defaultValueFn: function() {
        // This is to make sure getPrototype is called, even if the model object has been created
        // without a .create or .getPrototype having been called yet.
        for ( var key in UNUSED_MODELS ) { window[key].getPrototype && window[key].getPrototype(); }
        for ( var key in USED_MODELS ) window[key].getPrototype && window[key].getPrototype();

        // All models are now in USED_MODELS
        for ( var key in USED_MODELS ) {
          var m = window[key];
          if ( ! m.getPrototype ) continue;
          m.getPrototype();
          this.dao.put(m);
        };
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
    function toHTML()    {/*
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
      name: 'model',
      type: 'Model',
      postSet: function(old, nu) {
        console.log("Updating HTML in DocView...");
        // replace our content in the DOM
        this.updateHTML();
      }
    }
  ],

  methods: {
    // TODO: make this a template
    toInnerHTML: function() {
      var model = this.model;
      var out   = [];

      if (!model || !model.properties) return;

      console.log(model.name)
      if (model.name === "String")   { debugger;    }

      out.push('<div class="intro">');
      out.push(model.help);
      out.push('</div>');

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        console.log(prop.name)

        out.push('<div class="label">');
        out.push(prop.label);
        out.push('</div><div class="text">');
        if ( prop.subType /*&& value instanceof Array*/ && prop.type.indexOf('[') != -1 ) {
          var subModel = this.X[prop.subType];
console.log("Creating sub-DocView...")
          var subView  = DocView.create({model: subModel});
          if ( subModel != model )
            console.log("Sub-DocView toHTML()...")
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

window.setTimeout(function() {

//  // This is to make sure getPrototype is called, even if the model object has been created
//  // without a .create or .getPrototype having been called yet.
//  for ( var key in UNUSED_MODELS ) { window[key].getPrototype && window[key].getPrototype(); }
//  for ( var key in USED_MODELS ) window[key].getPrototype && window[key].getPrototype();

//  // All models are now in USED_MODELS
//  for ( var key in USED_MODELS ) {
//    var m = window[key];
//    if ( ! m.getPrototype ) continue;
//    m.getPrototype();
//    dao.put(m);
//  };

  var controller = Controller.create();
  var listView = ControllerView.create({data: controller});
  listView.write(document);

  var docView = DocView.create();
  docView.write(document);

  listView.filteredDAOView.selection$.addListener(function(evt) {
    console.log(listView.filteredDAOView.selection.name);
    docView.model = listView.filteredDAOView.selection;
  });

}, 100);
