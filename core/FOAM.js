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
    if ( ! $documents[i].defaultView || $documents[i].defaultView === w )
      $documents.splice(i,1);
  }
}

/** Replacement for getElementById **/
// TODO(kgr): remove this is deprecated, use X.$ instead()
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
// TODO(kgr): remove this is deprecated, use X.$$ instead()
var $$ = function (cls) {
  for ( var i = 0 ; i < $documents.length ; i++ ) {
    var ret = $documents[i].getElementsByClassName(cls);

    if ( ret.length > 0 ) return ret;
  }
  return [];
};


var FOAM = function(map, opt_X) {
   var obj = JSONUtil.mapToObj(opt_X || X, map);
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

var UNUSED_MODELS = {};
var USED_MODELS   = {};

function packagePath(X, path) {
  function packagePath_(root, parent, path, i) {
    if ( i == path.length ) return parent;
    
    var head = path[i];
    if ( ! parent[head] ) {
      var map = { __this__: root };
      
      defineLocalProperty(parent, head, function(o) {
        return o == parent ? map : { __proto__: map, __this__: o.__this__ || o };
      });
    }
    
    return packagePath_(root, parent[head], path, i+1);
  }

  return path ? packagePath_(X, X, path.split('.'), 0) : X;
}

function registerModel(/* this = X, */ model, opt_name) {
  function contextualizeModel(X, path, name, model) {
    // Model which creates Objects with Context X
    var xModel = {
      __proto__: model,
      create: function(args, opt_X) {
        return this.__proto__.create(args, X);
      }
    };
    Object.defineProperty(path, name, { get: function() {
      var THIS = this.__this__ || this;
      return THIS == X ? xModel : THIS.registerModel(model, name); 
    } });
  }

  var name    = model.name;
  var package = model.package;
  
  if ( opt_name ) {
    var a = opt_name.split('.');
    name = a.pop();
    package = a.join('.');
  }

  var path = packagePath(this, package);

  contextualizeModel(this, path, name, model)

  this.registerModel_(model);

  return path[name];
}


function MODEL(m) {

  /** Lazily create and register Model first time it's accessed. **/
  function registerModelLatch(path, m) {
    UNUSED_MODELS[m.name] = true;

    Object.defineProperty(path, m.name, {
      get: function () {
        USED_MODELS[m.name] = true;
        delete UNUSED_MODELS[m.name];
        Object.defineProperty(this, m.name, {value: null, configurable: true});
        return registerModel(JSONUtil.mapToObj(X, m, Model));
      },
      configurable: true
    });
  }

  if ( document && document.currentScript ) m.sourcePath = document.currentScript.src;
  
  registerModelLatch(packagePath(GLOBAL, m.package), m);
}

var CLASS = MODEL;

function registerModel_(m) {
  // NOP
}

function registerModel(model, opt_name) {

}


FOAM.browse = function(model, opt_dao, opt_X) {
   var Y = opt_X || X.sub(undefined, "FOAM BROWSER");

   if ( typeof model === 'string' ) model = Y[model];

   var dao = opt_dao || Y[model.name + 'DAO'] || Y[model.plural];

   if ( ! dao ) {
      dao = Y.StorageDAO.create({ model: model });
      Y[model.name + 'DAO'] = dao;
   }

   var ctrl = Y.DAOController.create({
     model:     model,
     dao:       dao,
     useSearchView: false
   });

  if ( ! Y.stack ) {
    var w = opt_X ? opt_X.window : window;
    var win = Y.Window.create({ window: w });

    Y.stack = Y.StackView.create();
    win.view = Y.stack;
    Y.stack.setTopView(ctrl);
  } else {
    Y.stack.pushView(ctrl);
  }
};


FOAM.lookup = function(key, opt_X) {
  if ( ! ( typeof key === 'string' ) ) return key;

  var path = key.split('.');
  var root = opt_X || GLOBAL;
  for ( var i = 0 ; i < path.length ; i++ ) root = root[path[i]];

  return root;
};


function arequire(modelName, opt_X) {
  var X = opt_X || GLOBAL;
  var model = FOAM.lookup(modelName, X);

  /** This is so that if the model is arequire'd concurrently the
   *  initialization isn't done more than once.
   **/
  if ( ! model ) console.log(modelName, 'not found');
  if ( ! model.required__ ) {
    // TODO: eventually this should just call the arequire() method on the Model
    var args = [];
    if ( model.templates ) for ( var i = 0 ; i < model.templates.length ; i++ ) {
      var t = model.templates[i];
      args.push(aseq(
        aevalTemplate(model.templates[i]),
        (function(t) { return function(ret, m) {
          model.getPrototype()[t.name] = m;
          ret();
        };})(t)
      ));
    }

    // Also arequire required Models.
    for ( var i = 0 ; i < model.requires.length ; i++ ) {
      var r = model.requires[i];
      var m = r.split(' as ');
      args.push(arequire(m[0]));
    }

    model.required__ = amemo(aseq(
      apar.apply(apar, args),
      aconstant(model)));
  }

  return model.required__;
}


var FOAM_POWERED = '<a style="text-decoration:none;" href="https://github.com/foam-framework/foam/" target="_blank">\
<font size=+1 face="catull" style="text-shadow:rgba(64,64,64,0.3) 3px 3px 4px;">\
<font color="#3333FF">F</font><font color="#FF0000">O</font><font color="#FFCC00">A</font><font color="#33CC00">M</font>\
<font color="#555555" > POWERED</font></font></a>';
