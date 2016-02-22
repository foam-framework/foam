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

  // Special case for unregistered global models.
  if ( ret === undefined && key.indexOf('.') == -1 ) {
    ret = GLOBAL[key];
  }

  if ( ret === undefined ) {
    var path = key.split('.');
    for ( var i = 0 ; root && i < path.length ; i++ ) root = root[path[i]];
    ret = root;
    cache[key] = ret ? ret : null; // implements negative-caching
  }

  return ret;
}


/** Update a Context binding. **/
function set(key, value) {
  // It looks like the chrome debug console is overwriting
  // sub.window, but this prevents it.
  Object.defineProperty(
    this,
    key,
    {
      value: value,
      writable: key !== 'window',
      configurable: true
    });

  if ( GLOBAL.SimpleReadOnlyValue && key !== '$' && key !== '$$' )
    this[key + '$'] = SimpleReadOnlyValue.create({value: value});
}


function setValue(key, value) {
  var X = this;

  Object.defineProperty(
    this,
    key,
    {
      get: function() { return value.get(); },
      configurable: true
    }
  );

  if ( key !== '$' && key !== '$$' ) this[key + '$'] = value;
}


/** Create a sub-context, populating with bindings from opt_args. **/
function sub(opt_args, opt_name) {
  var sub = Object.create(this);

  if ( opt_args ) for ( var key in opt_args ) {
    if ( opt_args.hasOwnProperty(key) ) {
      var asValue = key !== '$' && key != '$$' && key.charAt(key.length-1) == '$';
      if ( asValue ) {
        sub.setValue(key.substring(0, key.length-1), opt_args[key]);
      } else {
        sub.set(key, opt_args[key]);
      }
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

var X = {
  lookupCache_: GLOBAL.lookupCache_,
  sub: sub,
  subWindow: subWindow,
  set: set,
  lookup: lookup,
  setValue: setValue,
  GLOBAL: GLOBAL
};

var foam = X.foam = {};

var registerFactory = function(model, factory) {
  // TODO
};

var registerModelForModel = function(modelType, targetModel, model) {

};

var registerFactoryForModel = function(factory, targetModel, model) {

};
