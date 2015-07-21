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

GLOBAL.lookupCache_ = {};
GLOBAL.modelForModel_ = {};

function lookup(key) {
  if ( ! key ) return undefined;
  if ( ! ( typeof key === 'string' ) ) return key;

  var root  = this

  var cache;

//  if ( this.hasOwnProperty('lookupCache_') ) {
    cache = this.lookupCache_;
//  } else {
//    cache = this.lookupCache_ = {};
//  }

  var ret = cache[key];

  if ( ret === undefined ) {
    var path = key.split('.');
    for ( var i = 0 ; root && i < path.length ; i++ ) root = root[path[i]];
    ret = root;
    cache[key] = ret ? ret : null; // implements negative-caching
  }

  return ret;
}

function registerModelForModel(baseModel, specifierModel, newModel) {
  // Accepts string names or Model instances. Only strings are stored.
  //
  // Registration replaces the base model with the new model, when
  // the given specifier is indicated (such as .create() using the .model
  // argument as a specifier). Only cases where modelForModel() is consulted
  // will result in replacement.
  //
  // E.g. MetaEditor might register:
  //      foam.ui.DetailView + IntProperty => foam.meta.types.IntPropertyView
  //      base                 specifier      new
  if ( ! baseModel || ! specifierModel ) return;
  var base = baseModel.id || baseModel;
  var specifier = specifierModel.id || specifierModel;

  // we return true if we created a new subcontext cache, or stored a new value
  var changed = false;

  // isolate model-for-model registrations in subcontexts the same way as lookupCache_
  if ( ! Object.hasOwnProperty.call(this, 'modelForModel_') ) {
    this.modelForModel_ = Object.create(this.modelForModel_ || Object.prototype);
    changed = true;
  }
  var newId = (newModel.id || newModel);
  if ( this.modelForModel_[base+"_"+specifier] !== newId ) {
    changed = true;
  }
  this.modelForModel_[base+"_"+specifier] = newId;

  return changed;
}

function modelForModel(baseModel, specifierModel) {
  // Accepts strings or Model instances. A string model id is returned, or null.
  if ( ! baseModel ) return null;
  var base = baseModel.id || baseModel;
  var specifier = specifierModel.id || specifierModel || "";

  var model = this.modelForModel_[base+"_"+specifier];
  return model || baseModel; // if not found, return base model
}

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


function setValue(key, value) {
  var X = this;
  Object.defineProperty(
    this,
    key,
    {
      get: function() { X.set(key, value.get()); return X[key]; },
      configurable: true
    }
  );
}


/** Create a sub-context, populating with bindings from opt_args. **/
function sub(opt_args, opt_name) {
  var sub = Object.create(this);

  if ( opt_args ) for ( var key in opt_args ) {
    if ( opt_args.hasOwnProperty(key) ) {
      sub.set(key, opt_args[key]);
    }
  }

  if ( opt_name ) {
    sub.NAME = opt_name;
    // This was commented out because it appears to be very slow
//    sub.toString = function() { return 'CONTEXT(' + opt_name + ')'; };
//    sub.toString = function() { return 'CONTEXT(' + opt_name + ', ' + this.toString() + ')'; };
  }

//  console.assert(this.lookupCache_, 'Missing cache.');
//  sub.lookupCache_ = Object.create(this.lookupCache_);

  return sub;
}


function subWindow(w, opt_name, isBackground) {
  if ( ! w ) return this.sub();

  return foam.ui.Window.create({window: w, name: opt_name, isBackground: isBackground}, this).Y;
}

var X = sub({});

var foam = X.foam = {};





var registerFactory = function(model, factory) {
  // TODO
};

var registerFactoryForModel = function(factory, targetModel, model) {

};
