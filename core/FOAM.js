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
  console.log('Deprecated use of GLOBAL.$.');
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
  console.log('Deprecated use of GLOBAL.$$.');
  for ( var i = 0 ; i < $documents.length ; i++ ) {
    var ret = $documents[i].getElementsByClassName(cls);

    if ( ret.length > 0 ) return ret;
  }
  return [];
};


var FOAM = function(map, opt_X, seq) {
   var obj = JSONUtil.mapToObj(opt_X || X, map, undefined, seq);
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
      Y[model.name + 'DAO'] = [].dao;
   }

   var ctrl = Y.foam.ui.DAOController.create({
     model:     model,
     dao:       dao,
     useSearchView: false
   });

  if ( ! Y.stack ) {
    var w = opt_X ? opt_X.window : window;
    Y.stack = Y.foam.ui.StackView.create();
    var win = Y.foam.ui.layout.Window.create({ window: w, data: Y.stack }, Y);
    document.body.insertAdjacentHTML('beforeend', win.toHTML());
    win.initHTML();
    Y.stack.setTopView(ctrl);
  } else {
    Y.stack.pushView(ctrl);
  }
};


var arequire = function(modelName) {
  // If arequire is called as a global function, default to the
  // top level context X.
  var THIS = this === GLOBAL ? X : this;

  var model = THIS.lookup(modelName);
  if ( ! model ) {
    if ( ! THIS.ModelDAO ) {
      // if ( modelName !== 'Template' ) console.warn('Unknown Model in arequire: ', modelName);
      return aconstant();
    }

    // check whether we have already hit the ModelDAO to load the model
    if ( ! THIS.arequire$ModelLoadsInProgress ) {
      THIS.set('arequire$ModelLoadsInProgress', {} );
    } else {
      if ( THIS.arequire$ModelLoadsInProgress[modelName] ) {
        return THIS.arequire$ModelLoadsInProgress[modelName];
      }
    }

    var future = afuture();
    THIS.arequire$ModelLoadsInProgress[modelName] = future.get;

    THIS.ModelDAO.find(modelName, {
      put: function(m) {
        // Contextualize the model for THIS context
        m.X = THIS;

        var next_ = function(m) {
          THIS.arequire$ModelLoadsInProgress[modelName] = false;
          THIS.GLOBAL.X.registerModel(m);

          if ( ! THIS.lookupCache_[m.id] )
            THIS.lookupCache_[m.id] = m;
          future.set(m);
        };

        if ( m.arequire ) {
          m.arequire()(next_);
        } else {
          next_(m);
        }
      },
      error: function() {
        var args = argsToArray(arguments);
        if ( modelName !== 'DocumentationProperty' )
          console.warn.apply(console, ['Could not load model: ', modelName].concat(args));
        THIS.arequire$ModelLoadsInProgress[modelName] = false;
        future.set(undefined);
      }
    });

    return future.get;
  }

  return model.arequire ? model.arequire() : aconstant(model);
}

var FOAM_POWERED = '<a style="text-decoration:none;" href="https://github.com/foam-framework/foam/" target="_blank">\
<font size=+1 face="catull" style="text-shadow:rgba(64,64,64,0.3) 3px 3px 4px;">\
<font color="#3333FF">F</font><font color="#FF0000">O</font><font color="#FFCC00">A</font><font color="#33CC00">M</font>\
<font color="#555555" > POWERED</font></font></a>';

/** Lookup a '.'-separated package path, creating sub-packages as required. **/
function packagePath(X, path) {
  function packagePath_(Y, path, i) {
    if ( i === path.length ) return Y;
    if ( ! Y[path[i]] ) {
      Y[path[i]] = {};
      // console.log('************ Creating sub-path: ', path[i]);
      if ( i == 0 ) GLOBAL[path[i]] = Y[path[i]];
    }
    return packagePath_(Y[path[i]], path, i+1);
  }
  return path ? packagePath_(X, path.split('.'), 0) : GLOBAL;
}

function registerModel(model, opt_name, fastMode) {
  var root = model.package ? this : GLOBAL;
  var name = model.name;
  var pack = model.package;

  if ( opt_name ) {
    var a = opt_name.split('.');
    name = a.pop();
    pack = a.join('.');
  }

  var modelRegName = (pack ? pack + '.' : '') + name;

  if ( root === GLOBAL || root === X ) {
    var path = packagePath(root, pack);
    if ( fastMode )
      path[name] = model;
    else
      Object.defineProperty(path, name, { value: model, configurable: true });
    if ( path === GLOBAL ) {
      path = X;
      if ( fastMode )
        path[name] = model;
      else
        Object.defineProperty(path, name, { value: model, configurable: true });
    }
  }

  if ( ! Object.hasOwnProperty.call(this, 'lookupCache_') ) {
    this.lookupCache_ = Object.create(this.lookupCache_ || Object.prototype);
  }
  this.lookupCache_[modelRegName] = model;

  this.onRegisterModel(model);
}


var CLASS = function(m) {

  // Don't Latch these Models, as we know that we'll need them on startup
  var EAGER = {
    'Method': true,
    'BooleanProperty': true,
    'Action': true,
    'FunctionProperty': true,
    'Constant': true,
    'Message': true,
    'ArrayProperty': true,
    'StringArrayProperty': true,
    'Template': true,
    'Arg': true,
    'Relationship': true,
    'ViewFactoryProperty': true,
    'FactoryProperty': true,
    'foam.ui.Window': true,
    'StringProperty': true,
    'foam.html.Element': true,
    'Expr': true,
    'AbstractDAO': true
  };

  /** Lazily create and register Model first time it's accessed. **/
  function registerModelLatch(path, m) {
    var id = m.package ? m.package + '.' + m.name : m.name;

    if ( EAGER[id] ) {
      USED_MODELS[id] = true;
      var work = [];
      var model = JSONUtil.mapToObj(X, m, Model, work);
      if ( work.length > 0 ) {
        model.extra__ = aseq.apply(null, work);
      }

      X.registerModel(model, undefined, true);

      return model;
    }

    GLOBAL.lookupCache_[id] = undefined;
    UNUSED_MODELS[id] = true;
    var triggered = false;

    //console.log("Model Getting defined: ", m.name, X.NAME);
    Object.defineProperty(m.package ? path : GLOBAL, m.name, {
      get: function triggerModelLatch() {
        if ( triggered ) return null;
        triggered = true;
        // console.time('registerModel: ' + id);
        USED_MODELS[id] = true;
        UNUSED_MODELS[id] = undefined;

        var work = [];
        // console.time('buildModel: ' + id);
        var model = JSONUtil.mapToObj(X, m, Model, work);
        // console.timeEnd('buildModel: ' + id);

        if ( work.length > 0 ) {
          model.extra__ = aseq.apply(null, work);
        }

        X.registerModel(model);

        // console.timeEnd('registerModel: ' + id);
        return model;
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

// For non-CLASS modeled things, like Enums.
function __DATA(obj) {
  var package = obj.package ?
      obj.package :
      obj.id.substring(0, obj.id.lastIndexOf('.'));

  var name = obj.name ?
      obj.name :
      obj.id.substring(obj.id.lastIndexOf('.') + 1);

  var path = packagePath(X, package);

  var triggered  = false;

  Object.defineProperty(path, name, {
    get: function triggerDataLatch() {
      if ( triggered ) return null;
      triggered = true;

      var object = JSONUtil.mapToObj(X, obj);

      X.registerModel(object);

      return object;
    },
    configurable: true
  });
}

/** Called when a Model is registered. **/
function onRegisterModel(m) {
  if ( ! m.package ) {
    GLOBAL[m.name] = m;
  }
}

X.$ = $;
X.$$ =$$;
X.registerModel = registerModel;
X.arequire = arequire;
X.onRegisterModel = onRegisterModel;
