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
  var sub = Object.create(this);
  for ( key in opt_args ) sub[key] = opt_args[key];
  if ( opt_name ) {
    sub.NAME = opt_name;
    sub.toString = function() { return 'CONTEXT(' + opt_name + ')'; };
  }
  return sub;
}


function subWindow(window, opt_name) {
  if ( ! window ) return sub();

  var document = window.document;
  return sub({
    window: window,
    document: document,
    console: window.console,
    log: window.console.log.bind(console),
    warn: window.console.warn.bind(console),
    info: window.console.info.bind(console),
    error: window.console.error.bind(console),
    $: function(id) {
      if ( document.FOAM_OBJECTS && document.FOAM_OBJECTS[id] )
        return document.FOAM_OBJECTS[id];

      return document.getElementById(id);
    },
    $$: function(cls) {
      return document.getElementsByClassName(cls);
    },
    setTimeout: window.setTimeout.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
    setInterval: window.setInterval.bind(window),
    clearInterval: window.clearInterval.bind(window),
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window)
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
      }
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