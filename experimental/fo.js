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

Object.name = 'Object';
String.name = 'String';
Boolean.name = 'Boolean';
Number.name = 'Number';
Date.name = 'Date';
Function.name = 'Function';

var CTX = {
  name: 'ROOT',
  instance_: {},
  features: [
    Object,
    String,
    Boolean,
    Number,
    Date,
    Function,
  ],

  prototype: {
    Object: Object,
    String: String,
    Boolean: Boolean,
    Number: Number,
    Date: Date,
    Function: Function
  }
};

(function() {
  var FObject = { name: 'FObject', prototype: {static_: {}}, features: [], instance_: {} };
  var Model = { name: 'Model', prototype: {static_: {}}, features: [], instance_: {} };
  var Method = {
    name: 'Method',
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
  };

  CTX.features.push(FObject);
  CTX.features.push(Model);
  CTX.features.push(Method);

  CTX.prototype.Model = Model;
  CTX.prototype.FObject = FObject;
  CTX.prototype.Method = Method;

  Model.__proto__ = Model.prototype;
  Model.prototype.__proto__ = FObject.prototype;
  Model.model_ = Model;
  FObject.model_ = Model;
  FObject.__proto__ = Model.prototype;

  CTX.__proto__ = Model.prototype;
  CTX.model_ = Model;
  CTX.prototype.__proto__ = FObject.prototype;
})();

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
      prototype: { __proto__: CTX.prototype['FObject'].prototype, static_: {} },
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
      feature.initialize && feature.initialize(this, args);
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
      if ( CTX.prototype['Property'].isInstance(feature) &&
          feature.name === name ) return feature;
    }
  }],
  ['FObject',  'Method',  function getExtends() {
    if ( ! this.features ) return;
    for ( var i = 0; i < this.features.length; i++ ) {
      var feature = this.features[i];
      if ( CTX.prototype['Extends'] && CTX.prototype['Extends'].isInstance(feature) ) return feature;
    }
  }],
  ['Model',    'Method',  function install(o) {
    o.prototype[this.name] = this;
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

    var scope = this.scope;
    var get = this.getter || function() {
      if ( !this[scope].hasOwnProperty(prop.name) ) return prop.defaultValue;
      return this[scope][prop.name];
    };
    var set = this.setter || function(value) {
      this[scope][prop.name] = value;
    };

    Object.defineProperty(o.prototype, this.name, {
      configurable: true,
      enumerable: this.enumerable === undefined ? true : this.enumerable,
      writeable: true,
      get: get,
      set: set
    });
  }],
  ['Property', 'Property', { name: 'scope', scope: 'instance_', defaultValue: 'instance_' }],
  ['Property', 'Property', { name: 'defaultValue', defaultValue: '' }],
  ['Property', 'Property', { name: 'defaultValueFn', defaultValue: '' }],
  ['Property', 'Property', { name: 'valueFactory', defaultValue: '' }],
  ['Property', 'Property', { name: 'enumerable', defaultValue: true }],
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
    return this.SUPER({ model: CTX.prototype[model] });
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
      __proto__: CTX.prototype['FObject'].prototype,

      create: function(args) {
        var obj = CTX.prototype['FObject'].create(args);
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
      if ( o.prototype[this.name] ) this.jsCode.super_ = o.prototype[this.name];
      o.prototype[this.name] = this.jsCode;
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
  [null, 'Model', { name: 'Constant' }],
  ['Constant', 'Extends', 'Feature'],
  ['Constant', 'Property', { name: 'value' }],
  ['Constant', 'Method', function install(o, old) {
    if ( old ) console.warn('Variable constant: ' + this.name);
    o.prototype[this.name] = this.value;
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
  [null, 'Method', function constantFn(v) { return function() { return v; }; }],
  ['Function', 'Method', function simpleBind(f, self) {
    var ret = function() { return f.apply(self, arguments); };
    ret.toString = function() {
      return f.toString();
    };
    return ret;
  }],
  ['Function', 'Method', function bind(f, self) {
    return arguments.length == 1 ?
      Function.prototype.simpleBind(this, arguments[0]) :
      arguments.callee.super_.apply(this, arguments);
  }],
  ['String', 'Method', function equalsIC(o) {
    return other && this.toUpperCase() === other.toUpperCase();
  }],
  ['Number', 'Method', function compareTo(o) {
    if ( o == this ) return 0;
    return this < 0 ? -1 : 1;
  }],
  ['Boolean', 'Method', function compareTo(o) {
    return (this.valueOf() ? 1 : 0) - (o ? 1 : 0);
  }],

  // Events


  // Some test models.
  [null, 'Model', { name: 'Mail' }],
  ['Mail', 'Model', { name: 'EMail' }],
  ['Mail.EMail', 'Property', { name: 'sender', scope: 'static_', defaultValue: 'adamvy' }],
  ['Mail.EMail', 'Method', function send() { console.log(this.sender); }],
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

function lookup(address, model) {
  if ( ! address ) return model;

  var split = address.indexOf('.');
  if ( split > 0 ) {
    var rest = address.substring(split + 1);
    address = address.substring(0, split);
  }

  if ( ! model.features ) return;
  for ( var i = 0; i < model.features.length; i++ ) {
    if ( model.features[i].name === address ) {
      var feature = model.features[i];
      break;
    }
  }
  if ( rest ) return lookup(rest, feature);
  return feature;
}

function build(scope) {
   for ( var i = 0 ; i < features.length ; i++ ) {
      var f = features[i];
      if (f[3]) debugger;

      var model = lookup(f[0], scope);
      if ( ! model ) throw "Model not found: " + f[0];

      var feature = lookup(f[1], scope);
      if ( !feature ) throw "Feature not found: " + f[1];

      var args = f[2];
      var feature = feature.prototype.create.call(feature, args);
      model.addFeature ? model.addFeature(feature) : feature.install(model);
   }
}


build(CTX);

var env = CTX.create();

with (env) {
  var a = function() {console.log(this.a);};
  var b = {a: 12};
  var c = a.bind(b);
  c();
  var mails = Mail.create();

  var mail = mails.EMail.create();
  mail.send();
  var mail2 = mails.EMail.create({ sender: 'kgr' });
  mail.send();
  mail.sender = 'mike';
  mail2.send();
}
