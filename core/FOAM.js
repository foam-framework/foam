/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

var $documents = [];

if ( window ) $documents.push(window.document);

// TODO: clean this up, hide $WID__ in closure
var $WID__ = 0;
function $addWindow(w) {
   w.window.$WID = $WID__++;
   $documents.push(w.document);
}
function $removeWindow(w) {
  for ( var i = $documents.length - 1 ; i >= 0 ; i-- ) {
    if ( $documents[i].defaultView === w )
      $documents.splice(i,1);
  }
}
/** Replacement for getElementById **/
var $ = function (id) {
  for ( var i = 0 ; i < $documents.length ; i++ ) {
    if ( document.FOAM_OBJECTS && document.FOAM_OBJECTS[id] )
      return document.FOAM_OBJECTS[id];

    var ret = $documents[i].getElementById(id);

    if ( ret ) return ret;
  }
  return undefined;
};
/** Replacement for getElementByClassName **/
var $$ = function (cls) {
  for ( var i = 0 ; i < $documents.length ; i++ ) {
    var ret = $documents[i].getElementsByClassName(cls);

    if ( ret.length > 0 ) return ret;
  }
  return [];
};


var FOAM = function(map) {
   var obj = JSONUtil.mapToObj(map);
   return obj;
};

/**
 * Register a lazy factory for the specified name within a
 * specified context.
 * The first time the name is looked up, the factory will be invoked
 * and its value will be stored in the named slot and then returned.
 * Future lookups to the same slot will return the originally created
 * value.
 **/
FOAM.putFactory = function(ctx, name, factory) {
  ctx.__defineGetter__(name, function() {
    console.log('Bouncing Factory: ', name);
    delete ctx[name];
    return ctx[name] = factory();
  });
};

/*
// Simple Immediate Model Definition
var FOAModel = function(m) {
  var model = Model.create(m);

  GLOBAL[model.name] = model;
}
*/

/*
// Lazy Model Definition - Only creates Model when first referenced
var FOAModel = function(m) {
  Object.defineProperty(GLOBAL, m.name, {
    get: function () {
      // console.log('bounceFactory: ', m.name);
      Object.defineProperty(GLOBAL, m.name, {value: null});
      var model = JSONUtil.mapToObj(m, Model);
      Object.defineProperty(GLOBAL, m.name, {value: model});
      return model;
    },
    configurable: true
  });
}
*/

var UNUSED_MODELS = {};
var USED_MODELS = {};

// Lazy Model Definition - Only creates Model when first referenced
var FOAModel = function(m) {
  // Templates need to access document.currentScript in order to know
  // where to load the template from, so the instantiation of Models
  // with templates can't be delayed (yet).
  if ( m.templates ) {
    registerModel.call(this, JSONUtil.mapToObj(m, Model));
    return;
  }

  UNUSED_MODELS[m.name] = true;
  Object.defineProperty(GLOBAL, m.name, {
    get: function () {
      USED_MODELS[m.name] = true;
      delete UNUSED_MODELS[m.name];
      Object.defineProperty(GLOBAL, m.name, {value: null});
      registerModel(JSONUtil.mapToObj(m, Model));
      return this[m.name];
    },
    configurable: true
  });
}

FOAM.browse = function(model, opt_dao) {
   var dao = opt_dao || GLOBAL[model.name + 'DAO'] || GLOBAL[model.plural];

   if ( ! dao ) {
      dao = StorageDAO.create({ model: model });
      GLOBAL[model.name + 'DAO'] = dao;
   }

   var ctrl = ActionBorder.create(DAOController, DAOController.create({
      model:     model,
      dao:       dao
   }));

   ctrl.__proto__.stackView = GLOBAL.stack;
   GLOBAL.stack.pushView(ctrl, model.plural);
};


function arequire(modelName) {
  var model = GLOBAL[modelName];

  /** This is so that if the model is arequire'd concurrently the
   *  initialization isn't done more than once.
   **/
  if ( ! model.required__ ) {
    // TODO: eventually this should just call the arequire() method on the Model
    var args = [];
    for ( var i = 0 ; i < model.templates.length ; i++ ) {
      var t = model.templates[i];
      args.push(aseq(
        aevalTemplate(model.templates[i]),
        (function(t) { return function(ret, m) {
          model.getPrototype()[t.name] = m;
          ret();
        };})(t)
      ));
    }

    model.required__ = amemo(aseq(
      apar.apply(apar, args),
      aconstant(model)));
  }

  return model.required__;
}


var FOAM_POWERED = '<a style="text-decoration:none;" href="http://code.google.com/p/foam-framework/" target="_blank">\
<font size=+1 face="catull" style="text-shadow:rgba(64,64,64,0.3) 3px 3px 4px;">\
<font color="#3333FF">F</font><font color="#FF0000">O</font><font color="#FFCC00">A</font><font color="#33CC00">M</font>\
<font color="#555555" > POWERED</font></font></a>';