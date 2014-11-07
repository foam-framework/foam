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

/** Update a Context binding. **/
function set(key, value) {
  // It looks like the chrome debug console is overwriting sub.window
  // but this prevents it.
  Object.defineProperty(
    this,
    key,
    {
      value: value,
      writable: key !== 'window',
      configurable: true
    }
  );
}


/** Create a sub-context, populating with bindings from opt_args. **/
function sub(opt_args, opt_name) {
//  var sub = Object.create(this);
  var sub = {__proto__: this};

  if ( opt_args ) for ( var key in opt_args ) {
    if ( opt_args.hasOwnProperty(key) ) {
      sub.set(key, opt_args[key]);
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

  var document        = this.subDocument ? this.subDocument(w.document) : w.document;
  var installedModels = document.installedModels || ( document.installedModels = {});

  var map = {
    registerModel_: function(model) {
      // TODO(kgr): If Traits have CSS then it will get installed more than once.
      // TODO(kgr): Add package support.
      for ( var m = model ; m && m.getPrototype ; m = m.extendsModel && this[m.extendsModel] ) {
        if ( installedModels[m.id] ) return;
        installedModels[m.id] = true;
        m.getPrototype().installInDocument(this, document);
      }
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
var X = this.subWindow(window, 'DEFAULT WINDOW', typeof process === 'object').sub({IN_WINDOW: false}, 'TOP-X');
var _ROOT_X = X;

var registerFactory = function(model, factory) {
  // TODO
};

var registerModelForModel = function(modelType, targetModel, model) {

};

var registerFactoryForModel = function(factory, targetModel, model) {

};
