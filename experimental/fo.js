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
// TODO: bootstrap 'install'

var features = [
//  [null,         'Model', { name: 'FObject' }],
  ['FObject',    'Method',  function copyFrom(src) {
    for ( var key in src ) {
      this[key] = src[key];
    }
  }],
  ['FObject',    'Method',  function create(args) {
    var obj = {
      model_: this,
      __proto__: this.prototype,
      __super__: this.prototype.__proto__,
      TYPE: this.name,
      features: [],
      prototype: { __proto__: CTX['FObject'].prototype },
      instance_: {}
    };
    obj.copyFrom(args);
    return obj;
  }],
  ['FObject',    'Method',  function clone() {
    return this.model_.create ? this.mdoel_.create(this) : this;
  }],
  ['FObject',    'Method',  function toString() {
    return this.TYPE;
  }],
  ['FObject',  'Method',  function getProperty(name) {
    if ( ! this.features ) return;
    for ( var i = 0; i < this.features.length; i++ ) {
      var feature = this.features[i];
      if ( CTX['Property'].isInstance(feature) ) return feature;
    }
  }],
  ['Model',    'Method',  function install(o) {
    o[this.name] = this;
  }],
  ['Model',    'Method',  function isSubModel(model) {
    try {
      return model && (model === this || this.isSubModel(model.prototype.__proto__.model_) );
    } catch(x) {
      return false;
    }
  }],
  ['Model',    'Method',  function isInstance(obj) {
    return obj && obj.model_ && this.isSubModel(obj.model_);
  }],
  [null,       'Model', { name: 'Property' }],
  ['String',   'Method', function constantize() { return this.replace(/[a-z][^a-z]/g, function(a) { return a.substring(0,1) + '_' + a.substring(1,2); }).toUpperCase(); } ],
  ['Property', 'Method', function install(o) {
    if ( ! o.features ) o.features = [this];
    else {
      // TODO this is broken, need to get property from the actual
      // super class.
      var superProp = o.getProperty(this.name);
      if (superProp) {
        superProp = superProp.clone();
        this.copyFrom(superProp);
      }
    }
    o[this.name.constantize()] = this;

    var prop = this;

    var get = this.getter ||
        function() {
          if ( !this.instance_.hasOwnProperty(prop.name) ) return prop.defaultValue;
          return this.instance_[prop.name];
        };
    var set = this.setter ||
        function(value) {
          this.instance_[prop.name] = value;
        };
    Object.defineProperty(o.prototype, this.name, {
      configurable: false,
      enumerable: true,
      writeable: true,
      get: get,
      set: set
    });
  }],
  ['FObject',  'Property',
   { name: 'SUPER',
     getter: function f() { return f.caller.super_.bind(this); },
     setter: function() {} }],
  ['Model',    'Property', { name: 'features' }],
  [null,       'Model',    { name: 'Feature' }],
  ['Feature',  'Property', { name: 'name' }],
  ['Property', 'Property', { name: 'defaultValue', defaultValue: '' }],
  [null,       'Model', { name: 'Extends' }],
  ['Extends',  'Property', { name: 'model' }],
  ['Extends',  'Method', function create(model) {
    return this.SUPER({ model: CTX[model] });
  }],
  ['Extends',  'Method',  function install(o) {
    for ( var i = 0; i < this.model.features.length; i++ ) {
      this.model.features[i].install(o);
    }
  }],
  ['Feature', 'Property', { name: 'asdf' }],
  ['Model', 'Property', { name: 'asdf', defaultValue: '12' }],
  ['Model', 'Extends', 'Feature'],
  ['Property', 'Extends', 'Feature' ],
  ['Method', 'Extends', 'Feature' ],
];


function expandFeatures(f, opt_prefix) {
  var prefix = opt_prefix || [];
  var g = [];
  for ( var i = 0 ; i < f.length ; i++ ) {
     expandFeature(f[i], g);
  }
  return g;
}

function expandFeature(f, a, prefix) {
   return f;
}

function build(scope, opt_whereModel) {
   for ( var i = 0 ; i < features.length ; i++ ) {
      var f = features[i];
     if (f[3]) debugger;
      if ( opt_whereModel && f[0] !== opt_whereModel ) continue;
      var model = f[0] ? scope[f[0]] : scope;

      if ( ! model ) throw "Model not found: " + f[0];

      var fname = f[1];
      if ( !scope[fname] ) continue;

      var args = f[2];
      var feature = scope[fname].prototype.create.call(scope[fname], args);
      feature.install(model);
   }
}

var CTX = {
  __proto__: window,

  FObject: { name: 'FObject', prototype: {}, features: [], instance_: {} },
  Model:  { name: 'Model', prototype: {}, features: [], instance_: {} },
  Method: {
    prototype: {
      create: function(args) {
        args.install = function(o) {
          o.prototype[this.name] = this;
          if (o.prototype.__proto__[this.name]) {
            o.prototype[this.name].super_ = o.prototype.__proto__[this.name];
          }
        };
        return args;
      }
    }
  }
};

CTX.Model.__proto__ = CTX.Model.prototype;
CTX.Model.__proto__.__proto__ = CTX.FObject.prototype;
CTX.FObject.__proto__ = CTX.Model.prototype;
CTX.Model.model_ = CTX.Model;
CTX.FObject.model_ = CTX.Model;
build(CTX);
