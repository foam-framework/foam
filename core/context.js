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
      Object.defineProperty(sub, key, {value: opt_args[key], writable: false});
    }
  }
  if ( opt_name ) {
    sub.NAME = opt_name;
    sub.toString = function() { return 'CONTEXT(' + opt_name + ')'; };
  }
  return sub;
}


function subWindow(w, opt_name) {
  if ( ! w ) return sub();

  var document = w.document;
  return sub({
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
    setTimeout: w.setTimeout.bind(w),
    clearTimeout: w.clearTimeout.bind(w),
    setInterval: w.setInterval.bind(w),
    clearInterval: w.clearInterval.bind(w),
    requestAnimationFrame: w.requestAnimationFrame && w.requestAnimationFrame.bind(w),
    cancelAnimationFrame: w.cancelAnimationFrame && w.cancelAnimationFrame.bind(w)
  }, opt_name);
}

var X = this.subWindow(window, 'DEFAULT WINDOW');

var registerModel = function(model) {
  /*
  if ( model.X === this ) {
    this[model.name] = model;

    return model;
  }
  */
  var thisX = this;

  var thisModel = this === GLOBAL ? model : {
    __proto__: model,
      create: function(args, opt_X) {
        return this.__proto__.create(args, thisX);
      }
  };

  Object.defineProperty(
    this,
    model.name,
    {
      get: function() {
        return ( this === thisX ) ? thisModel : this.registerModel(model);
      },
      configurabe: true
    }
  );

  return thisModel;
};

var registerFactory = function(model, factory) {
  // TODO
};

var registerModelForModel = function(modelType, targetModel, model) {

};

var registerFactoryForModel = function(factory, targetModel, model) {

};
