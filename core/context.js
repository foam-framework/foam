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

/** Create a sub-context, populating with bindings from opt_args. **/
function sub(opt_args, opt_name) {
//  var sub = Object.create(this);
  var sub = {__proto__: this};

  if ( opt_args ) for ( var key in opt_args ) {
    if ( opt_args.hasOwnProperty(key) ) {
      // It looks like the chrome debug console is overwriting sub.window
      // but this prevents it.
      Object.defineProperty(
        sub,
        key,
        {
          value: opt_args[key],
          writable: key !== 'window',
          configurable: true
        }
      );
    }
  }
  if ( opt_name ) {
    sub.NAME = opt_name;
    sub.toString = function() { return 'CONTEXT(' + opt_name + ')'; };
  }
  return sub;
}


function subWindow(w, opt_name, isBackground) {
  if ( ! w ) return this.sub();

  var document = this.subDocument ? this.subDocument(w.document) : w.document;
  var installedModels = new WeakMap();

  var map = {
    registerModel: function(model, opt_name) { // TODO: only modify cls (the proto) not this!
      if ( model.getPrototype && model.installInDocument && ! installedModels.has(model) ) {
        // TODO(kgr): If Traits have CSS then it will get installed more than once.
        for ( m = model ; m ; m = m.extendsModel && m.__proto__.model_ ) {
          // console.log('installing model: ', model.name);
          installedModels.set(m, true);
          m.installInDocument(this, document);
        }
      }
      return GLOBAL.registerModel.call(this, model, opt_name);
    },
    addStyle: function(css) {
      var s = document.createElement('style');
      s.innerHTML = css;
      this.document.head.appendChild(s);
    },
    isBackground: !!isBackground,
    window: w,
    document: document,
    console: w.console,
    log: w.console.log.bind(console),
    warn: w.console.warn.bind(console),
    info: w.console.info.bind(console),
    error: w.console.error.bind(console),
    $: function(id) {
      if ( document.FOAM_OBJECTS && document.FOAM_OBJECTS[id] )
        return document.FOAM_OBJECTS[id];

      return document.getElementById(id);
    },
    $$: function(cls) {
      return document.getElementsByClassName(cls);
    },
    dynamic: function(fn, opt_fn) { Events.dynamic(fn, opt_fn, this); },
    animate: function(duration, fn, opt_interp, opt_onEnd) {
      return Movement.animate(duration, fn, opt_interp, opt_onEnd, this);
    },
    memento: w.WindowHashValue && w.WindowHashValue.create({window: w}),
    setTimeout: w.setTimeout.bind(w),
    clearTimeout: w.clearTimeout.bind(w),
    setInterval: w.setInterval.bind(w),
    clearInterval: w.clearInterval.bind(w),
    requestAnimationFrame: function(f) { console.assert(w.requestAnimationFrame, 'requestAnimationFrame not defined'); return w.requestAnimationFrame(f); },
    cancelAnimationFrame: w.cancelAnimationFrame && w.cancelAnimationFrame.bind(w)
  };

  if ( isBackground ) {
    map.requestAnimationFrame = function(f) { return w.setTimeout(f, 16); };
    map.cancelAnimationFrame = map.clearTimeout;
  }

  var X = this.sub(map, opt_name);
  w.X = X;
  return X;
}

// Using the existence of 'process' to determine that we're running in Node.
var X = this.subWindow(window, 'DEFAULT WINDOW', typeof process === 'object').sub({IN_WINDOW: false});

function registerPackagePath(/* String */ path) {
  if ( ! path ) return this;
  if ( path ) console.log('path: ', path);
  var p = path.split('.');
  var s = this;
  for ( var i = 0 ; i < p.length ; i++ ) {
    s = s.registerPackage(p[i]);
  }
  return s;
}

function registerPackage(/* String */ name) {
  if ( ! this[name] ) {
    this[name] = {
      X: this
    };
  }

  return this[name];
}

function registerModel(model, opt_name) {
  // Register both ModName (the proto) and ModNameModel (the unadulterated definition)
  registerModelOnly_(model, opt_name);
  registerProtoOnly_(model, opt_name);
};

var registerModelOnly_ = function(model, opt_name) {
console.log("Register Model: "+model.name+" X:"+this.NAME);
  var thisX = this.registerPackagePath(model.package);

  var thisModel = thisX === GLOBAL ? model : {
    __proto__: model,
      create: function(args, opt_X) {
 //       console.log("XModel create: "+this.name_);
        return this.__proto__.create(args, thisX);
      }
  };
  Object.defineProperty(
    thisX,
    opt_name? opt_name + "Model" : model.name + "Model",
    {
      get: function() {
        return ( this === thisX ) ? thisModel : this.registerModelOnly_(model);
      },
      configurable: true
    }
  );
  return thisModel;
}
var registerProtoOnly_ = function(model, opt_name) {
console.log("Register Proto: "+model.name+" X:"+this.NAME);
  var thisX = this.registerPackagePath(model.package);
  var protoCache;

  var thisProto = // delay evaluation of prototype to avoid bootstrap problems by returning function
    this === GLOBAL ?
      function() { return model.getPrototype() }
    : function() {
        if (!protoCache)
        { console.log("Build protocache " + model.name);
          protoCache = {
            __proto__: model.getPrototype(),
            create: function(args, opt_X) {
              return this.__proto__.create(args, thisX);
          }};
        }
        return protoCache;
      };

  Object.defineProperty(
    thisX,
    opt_name || model.name,
    {
      get: function() {
if (this !== thisX)
  console.log("Mismatch! Reg Proto GET "+model.name+" from "+this.NAME+", reg'd from "+thisX.NAME);
        return ( this === thisX ) ? thisProto() : this.registerProtoOnly_(model)();
      },
      configurable: true
    }
  );

  return thisProto;
}


var registerFactory = function(model, factory) {
  // TODO
};

var registerModelForModel = function(modelType, targetModel, model) {

};

var registerFactoryForModel = function(factory, targetModel, model) {

};
