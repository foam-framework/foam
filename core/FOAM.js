/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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


var   USED_MODELS = {};
var UNUSED_MODELS = {};
var NONMODEL_INSTANCES = {}; // for things such as interfaces

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
  var root = opt_X || X;
  for ( var i = 0 ; root && i < path.length ; i++ ) root = root[path[i]];

  return root;
};


function arequire(modelName, opt_X) {
  var X = opt_X || X;
  var model = FOAM.lookup(modelName, X);

  if ( ! model ) {
    console.warn('Unknown Model in arequire: ', modelName);
    return aconstant(undefined);
  }

  /** This is so that if the model is arequire'd concurrently the
   *  initialization isn't done more than once.
   **/
  if ( ! model ) { console.log(modelName, 'not found'); return; }

  return arequireModel(model);
}

function arequireModel(model) {
  if ( ! model.required__ ) {
    // TODO(kgr): eventually this should just call the arequire() method on the Model
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


function packagePath(X, path) {
  function packagePath_(Y, path, i) {
    return i == path.length ? Y : packagePath_(Y[path[i]] || ( Y[path[i]] = {} ), path, i+1);
  }
  return path ? packagePath_(X, path.split('.'), 0) : X;
}


function registerModel(model, opt_name) {
  var root = this;

  function contextualizeModel(path, model, name) {
    if ( ! model.getPrototype ) debugger;

//    console.log('contextulizeModel: ', model.name, ' in ', this.toString());

    // Model which creates Objects with Context X
    var xModel = root == X ? model : {
      __proto__: model,
      create: function(args, opt_X) {
        return model.create(args, opt_X || root);
      }
    };

    Object.defineProperty(
      path,
      name,
      {
        get: function() {
          var THIS = this.__this__ || this;
          if ( THIS === root ) return xModel;
          THIS.registerModel(model, name);
          return THIS[name];
        },
        configurable: true
      });
  }

  var name    = model.name;
  var package = model.package;

  if ( opt_name ) {
    var a = opt_name.split('.');
    name = a.pop();
    package = a.join('.');
  }

  if ( package ) {
    var path = packagePath(root, package);
    Object.defineProperty(path, name, { value: model, configurable: true });
  } else {
    contextualizeModel(root, model, name)
  }

  this.registerModel_(model);
}


function CLASS(m) {

  /** Lazily create and register Model first time it's accessed. **/
  function registerModelLatch(path, m) {
    var id = m.package ? m.package + '.' + m.name : m.name;

    UNUSED_MODELS[id] = true;

    // TODO(adamvy): Remove this once we no longer have code depending on models to being in the global scope.
    Object.defineProperty(GLOBAL, m.name, { get: function() { return path[m.name]; }, configurable: true });

    Object.defineProperty(path, m.name, {
      get: function () {
        USED_MODELS[id] = true;
        delete UNUSED_MODELS[id];
        Object.defineProperty(path, m.name, {value: null, configurable: true});
        // TODO: Workaround for apps that redefine the top level X
        _ROOT_X.registerModel(JSONUtil.mapToObj(X, m, Model));
        return this[m.name];
      },
      configurable: true
    });
  }

  if ( document && document.currentScript ) m.sourcePath = document.currentScript.src;

  registerModelLatch(packagePath(X, m.package), m);
}

var MODEL = CLASS;

function INTERFACE(imodel) {
  // Unless in DEBUG mode, just discard interfaces as they're only used for type checking.
  // if ( ! DEBUG ) return;
  var i = JSONUtil.mapToObj(X, imodel, Interface);
  packagePath(X, i.package)[i.name] = i;

  var id = i.package ? i.package + '.' + i.name : i.name;
  NONMODEL_INSTANCES[id] = true;
}


/** Called when a Model is registered. **/
function registerModel_(m) {
  // NOP
}
