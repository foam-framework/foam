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

var CTX = {
  __proto__: window,

  FObject: { name: 'FObject', prototype: {static_: {}}, features: [], instance_: {} },
  Model:  { name: 'Model', prototype: {static_: {}}, features: [], instance_: {} },
  Method: {
    prototype: {
      create: function(args) {
        args.install = function(o) {
          o.prototype[this.name] = this;
          if (o.prototype.__proto__[this.name]) {
            o.prototype[this.name].super_ = o.prototype.__proto__[this.name];
          }
        };
        args.initialize = function(){};
        return args;
      }
    }
  }
};

CTX.Model.__proto__ = CTX.Model.prototype;
CTX.Model.__proto__.__proto__ = CTX.FObject.prototype;
CTX.Model.model_ = CTX.Model;
CTX.FObject.model_ = CTX.Model;
CTX.FObject.__proto__ = CTX.Model.prototype;

var features = [
  //  [null,         'Model', { name: 'FObject' }],
  ['FObject', 'Method',
   function addFeature(f) {
     for ( var i = 0; i < this.features.length; i++ ) {
       if (this.features[i].name === f.name) {
         var old = this.features[i];
         this.features[i] = f;
         break;
       }
     }
     if ( i == this.features.length ) this.features.push(f);
     f.install(this, old);
   }],
  ['FObject',    'Method',  function copyFrom(src) {
    for ( var key in src ) {
      // This is a workaround.  We should define model_ as a non-cloneable property.
      if ( key === 'model_' ) continue;
      this[key] = src[key];
    }
    return this;
  }],
  ['FObject',    'Method',  function create(args) {
    var obj = {
      model_: this,
      __proto__: this.prototype,
      __super__: this.prototype.__proto__,
      TYPE: this.name,
      features: [],
      prototype: { __proto__: CTX['FObject'].prototype, static_: {} },
      instance_: {}
    };
    obj.copyFrom(args);
    obj.init(args);
    return obj;
  }],
  ['FObject',    'Method',  function init(args) {
    var features = this.model_.features;
    if ( ! features ) return;
    for (var i = 0; i < features.length; i++) {
      var feature = features[i];
      feature.initialize(this, args);
    }
  }],
  ['FObject',    'Method',  function initialize() {} ],
  ['FObject',    'Method',  function clone() {
    return this.model_.create ? this.model_.create(this) : this;
  }],
  ['FObject',    'Method',  function toString() {
    return this.TYPE;
  }],
  ['FObject',  'Method',  function getProperty(name) {
    if ( ! this.features ) return;
    for ( var i = 0; i < this.features.length; i++ ) {
      var feature = this.features[i];
      if ( CTX['Property'].isInstance(feature) &&
          feature.name === name ) return feature;
    }
  }],
  ['FObject',  'Method',  function getExtends() {
    if ( ! this.features ) return;
    for ( var i = 0; i < this.features.length; i++ ) {
      var feature = this.features[i];
      if ( CTX['Extends'] && CTX['Extends'].isInstance(feature) ) return feature;
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
  ['String',   'Method', function capitalize() { return this.charAt(0).toUpperCase() + this.slice(1); }],
  ['String',   'Method', function labelize() {
    return this.replace(/[a-z][A-Z]/g, function(a) {
      return a.charAt(0) + ' ' + a.charAt(1);
    }).capitalize();
  }],
  ['Property', 'Method', function install(o, existing) {
    if ( existing ) {
      this.copyFrom(existing.clone().copyFrom(this));
    }

    o[this.name.constantize()] = this;

    var prop = this;

    if ( this.scope === 'static' ) {
      var get = this.getter || function() {
        if ( !this.static_.hasOwnProperty(prop.name) ) return prop.defaultValue;
        return this.static_[prop.name];
      }
    var set = this.setter ||
        function(value) {
          this.static_[prop.name] = value;
        };

    } else {
      var get = this.getter || function() {
        if ( !this.instance_.hasOwnProperty(prop.name) ) return prop.defaultValue;
        return this.instance_[prop.name];
      }
      var set = this.setter ||
          function(value) {
            this.instance_[prop.name] = value;
          };
    }

    Object.defineProperty(o.prototype, this.name, {
      configurable: true,
      enumerable: this.enumerable === undefined ? true : this.enumerable,
      writeable: true,
      get: get,
      set: set
    });
  }],
  ['Property', 'Property', { name: 'defaultValue', defaultValue: '' }],
  ['Property', 'Property', { name: 'defaultValueFn', defaultValue: '' }],
  ['Property', 'Property', { name: 'valueFactory', defaultValue: '' }],
  ['Property', 'Property', { name: 'enumerable', defaultValue: true }],
  ['Property', 'Property', { name: 'scope', defaultValue: '' }],
  ['Property', 'Method', function initialize(o) {
    if ( ! o.instance_.hasOwnProperty(this.name) &&
        this.valueFactory ) o.instance_[this.name] = this.valueFactory();
  }],
  ['FObject',  'Property',
   { name: 'SUPER',
     getter: function f() { return f.caller.super_.bind(this); },
     setter: function() {},
     enumerable: false }],
  ['Model',    'Property', { name: 'features',
                             valueFactory: function() { return []; } }],
  [null,       'Model',    { name: 'Feature' }],
  ['Feature',  'Property', { name: 'name' }],

  [null,       'Model', { name: 'Extends' }],
  ['Extends',  'Property', { name: 'model' }],
  ['Extends',  'Method', function create(model) {
    return this.SUPER({ model: CTX[model] });
  }],
  ['Extends',  'Method',  function install(o) {
    for ( var i = 0; i < this.model.features.length; i++ ) {
      this.model.features[i].clone().install(o);
    }
  }],


  ['Model', 'Extends', 'Feature'],
  ['Property', 'Extends', 'Feature'],

  [null, 'Model', {
    name: 'Method',
    prototype: {
      __proto__: CTX['FObject'].prototype,

      create: function(args) {
        var obj = CTX['FObject'].create(args);
        obj.install = function(o) {
          o.prototype[this.name] = this.jsCode;
          if (o.prototype.__proto__[this.name]) {
            o.prototype[this.name].super_ = o.prototype.__proto__[this.name];
          }
        };
        return obj;
      }
    }
  }],
  ['Method', 'Property', { name: 'jsCode' }],
  ['Method', 'Method', {
    name: 'install',
    jsCode: function(o) {
      o.prototype[this.name] = this.jsCode;
      if (o.prototype.__proto__[this.name]) {
        o.prototype[this.name].super_ = o.prototype.__proto__[this.name];
      }
    }
  }],
  ['Method', 'Method', {
    name: 'create',
    jsCode: function(args) {
      if ( args instanceof Function ) args = {
        name: args.name,
        jsCode: args
      };

      return this.SUPER(args);
    }
  }],
  ['Method', 'Extends', 'Feature'],

  // Standard lib stuff.
  ['Object',  'Property', {
    name: '$UID',
    enumerable: false,
    getter: (function() { var id = 1; return function() { return this.$UID__ || (this.$UID__ = id++); } })()
  }],
  ['Date', 'Method', function compareTo(o) {
    if ( o === this ) return 0;
    var d = this.getTime() - o.getTime();
    return d == 0 ? 0 : d > 0 ? 1 : -1;
  }],
  ['String', 'Method', function compareTo(o) {
    if ( o == this ) return 0;
    return this < 0 ? -1 : 1;
  }],
  ['Number', 'Method', function compareTo(o) {
    if ( o == this ) return 0;
    return this < 0 ? -1 : 1;
  }],
  ['Boolean', 'Method', function compareTo(o) {
    return (this.valueOf() ? 1 : 0) - (o ? 1 : 0);
  }],

  [null, 'Model', { name: 'EMail' }],
  ['EMail', 'Property', { name: 'sender', scope: 'static', defaultValue: 'adamvy' }],
  ['EMail', 'Method', function send() { console.log(this.sender); }],
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
      model.addFeature ? model.addFeature(feature) : feature.install(model);
   }
}


build(CTX);

var mail = CTX.EMail.create();
mail.send();
var mail2 = CTX.EMail.create({ sender: 'kgr' });
mail.send();
mail.sender = 'mike';
mail2.send();
