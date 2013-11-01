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

(function() {
  var static_;
  Object.defineProperty(Object.prototype, 'static_', {
    enumerable: false,
    writeable: true,
    configurable: true,
    get: function() {
      return static_;
    },
    set: function(v) {
      static_ = v;
    }
  });
  Object.prototype.static_ = {};
})();

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
        args.clone = function() {
          return this;
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
  ['String', 'Method', function hashCode() {
    var hash = 0;
    if ( this.length == 0 ) return hash;

    for (i = 0; i < this.length; i++) {
      var code = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + code;
      hash &= hash;
    }

    return hash;
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
      var oldValue = this[scope][prop.name];
      this[scope][prop.name] = value;

      this.propertyChange && this.propertyChange(prop.name, oldValue, value);
    };

    Object.defineProperty(o.prototype, this.name, {
      configurable: true,
      enumerable: this.enumerable === undefined ? true : this.enumerable,
      writeable: true,
      get: get,
      set: set
    });

    if ( scope === "static_" && this.valueFactory ) {
      o.prototype[this.name] = this.valueFactory();
    }
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
    o.prototype.__proto__ = this.model.prototype;
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
      if ( args instanceof Function ) {
        args = {
          name: args.name,
          jsCode: args
        };
      }

      var obj = this.SUPER(args);

      // Capture the model's prototype as the context for the
      // method.  This allows sub-features to be accessed as if they're
      // globals.
      with ( obj.prototype ) {
        obj.jsCode = eval('(' + obj.jsCode + ')');
      }

      return obj;
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
  ['Object', 'Property', {
    name: '$UID',
    enumerable: false,
    getter: function() {
      return (this.$UID__ ||
              (this.$UID__ = (
                (++arguments.callee.count) ||
                  (arguments.callee.count = 1))));
    }
  }],

  // Events
  [null, "Model", { name: "EventService" }],
  [
    "EventService",
    "Constant",
    {
      "name": "UNSUBSCRIBE_EXCEPTION",
      "value": "unsubscribe"
    }
  ],

  [
    "EventService",
    "Constant",
    {
      "name": "WILDCARD",
      "value": "*"
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "oneTime",
      "jsCode": function (listener) {
        return function() {
          listener.apply(this, arguments);

          throw EventService.UNSUBSCRIBE_EXCEPTION;
        };
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "consoleLog",
      "jsCode": function (listener) {
        return function() {
          console.log(arguments);

          listener.apply(this, arguments);
        };
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "merged",
      "jsCode": function (listener, opt_delay) {
        var delay = opt_delay || 16;

        return function() {
          var triggered = false;
          var lastArgs  = null;

          return function() {
            lastArgs = arguments;

            if ( ! triggered ) {
              triggered = true;

              setTimeout(
                function() {
                  triggered = false;
                  var args = lastArgs;
                  lastArgs = null;

                  listener.apply(this, args);
                },
                delay);
            }
          };
        }();
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "animate",
      "jsCode": function (listener) {
        return function() {
          var triggered = false;
          var lastArgs  = null;

          return function() {
            lastArgs = arguments;

            if ( ! triggered ) {
              triggered = true;
              var window = $documents[$documents.length-1].defaultView;

              window.requestAnimationFrame(
                function() {
                  triggered = false;
                  var args = lastArgs;
                  lastArgs = null;

                  listener.apply(this, args);
                });
            }
          };
        }();
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "async",
      "jsCode": function (listener) {
        return this.delay(0, listener);
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "delay",
      "jsCode": function (delay, listener) {
        return function() {
          var args = arguments;

          // Is there a better way of doing this?
          setTimeout( function() { listener.apply(this, args); }, delay );
        };
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "hasListeners",
      "jsCode": function (topic) {
        // todo:
        return true;
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "publish",
      "jsCode": function (topic) {
        return this.subs_ ? this.pub_(this.subs_, 0, topic, this.appendArguments([this, topic], arguments, 1)) : 0;
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "publishAsync",
      "jsCode": function (topic) {
        var args = arguments;
        var me   = this;

        setTimeout( function() { me.publish.apply(me, args); }, 0 );
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "publishLazy",
      "jsCode": function (topic, fn) {
        if ( this.hasListeners(topic) ) return this.publish.apply(this, fn());

        return 0;
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "subscribe",
      "jsCode": function (topic, listener) {
        if ( ! this.subs_ ) this.subs_ = {};

        this.sub_(this.subs_, 0, topic, listener);
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "unsubscribe",
      "jsCode": function (topic, listener) {
        if ( ! this.subs_ ) return;

        this.unsub_(this.subs_, 0, topic, listener);
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "unsubscribeAll",
      "jsCode": function () {
        this.sub_ = {};
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "pub_",
      "jsCode": function (map, topicIndex, topic, msg) {
        var count = 0;

        // There are no subscribers, so nothing to do
        if ( map == null ) return 0;

        if ( topicIndex < topic.length ) {
          var t = topic[topicIndex];

          // wildcard publish, so notify all sub-topics, instead of just one
          if ( t == this.WILDCARD )
            return this.notifyListeners_(topic, map, msg);

          if ( t ) count += this.pub_(map[t], topicIndex+1, topic, msg);
        }

        count += this.notifyListeners_(topic, map[null], msg);

        return count;
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "sub_",
      "jsCode": function (map, topicIndex, topic, listener) {
        if ( topicIndex == topic.length ) {
          if ( ! map[null] ) map[null] = [];
          map[null].push(listener);
        } else {
          var key = topic[topicIndex];

          if ( ! map[key] ) map[key] = {};

          this.sub_(map[key], topicIndex+1, topic, listener);
        }
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "unsub_",
      "jsCode": function (map, topicIndex, topic, listener) {
        if ( topicIndex == topic.length ) {
          if ( ! map[null] ) return true;

          map[null].remove(listener);

          if ( ! map[null].length ) delete map[null];
        } else {
          var key = topic[topicIndex];

          if ( ! map[key] ) return false;

          if ( this.unsub_(map[key], topicIndex+1, topic, listener) )
            delete map[key];
        }
        return Object.keys(map).length == 0;
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "notifyListeners_",
      "jsCode": function (topic, listeners, msg) {
        if ( listeners == null ) return 0;

        if ( listeners instanceof Array ) {
          for ( var i = 0 ; i < listeners.length ; i++ ) {
            var listener = listeners[i];

            try {
              listener.apply(null, msg);
            } catch ( err ) {
              if ( err == this.UNSUBSCRIBE_EXCEPTION ) {
                listeners.splice(i,1);
                i--;
              }
            }
          }

          return listeners.length;
        }

        for ( var key in listeners ) {
          return this.notifyListeners_(topic, listeners[key], msg);
        }
      }
    }
  ],

  [
    "EventService",
    "Method",
    {
      "name": "appendArguments",
      "jsCode": function (a, args, start) {
        for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);

        return a;
      }
    }
  ],
  [null, "Model", { name: "PropertyChangeSupport" }],
  ["PropertyChangeSupport", "Extends", "EventService"],
  [
    "PropertyChangeSupport",
    "Constant",
    {
      "name": "PROPERTY_TOPIC",
      "value": "property"
    }
  ],

  [
    "PropertyChangeSupport",
    "Method",
    {
      "name": "propertyTopic",
      "jsCode": function (property) {
        return [ this.PROPERTY_TOPIC, property ];
      }
    }
  ],
  [
    "PropertyChangeSupport",
    "Method",
    {
      "name": "propertyChange",
      "jsCode": function (property, oldValue, newValue) {
        // don't bother firing event if there are no listeners
        if ( ! this.subs_ ) return;

        // don't fire event if value didn't change
        if ( property != null && oldValue === newValue ) return;

        this.publish(this.propertyTopic(property), oldValue, newValue);
      }
    }
  ],

  [
    "PropertyChangeSupport",
    "Method",
    {
      "name": "globalChange",
      "jsCode": function () {
        this.publish(this.propertyTopic(this.WILDCARD), null, null);
      }
    }
  ],

  [
    "PropertyChangeSupport",
    "Method",
    {
      "name": "addListener",
      "jsCode": function (listener) {
        // this.addPropertyListener([ this.PROPERTY_TOPIC ], listener);
        this.addPropertyListener(null, listener);
      }
    }
  ],

  [
    "PropertyChangeSupport",
    "Method",
    {
      "name": "removeListener",
      "jsCode": function (listener) {
        this.removePropertyListener(null, listener);
      }
    }
  ],

  [
    "PropertyChangeSupport",
    "Method",
    {
      "name": "addPropertyListener",
      "jsCode": function (property, listener) {
        this.subscribe(this.propertyTopic(property), listener);
      }
    }
  ],

  [
    "PropertyChangeSupport",
    "Method",
    {
      "name": "removePropertyListener",
      "jsCode": function (property, listener) {
        this.unsubscribe(this.propertyTopic(property), listener);
      }
    }
  ],

  [
    "PropertyChangeSupport",
    "Method",
    {
      "name": "propertyValue",
      "jsCode": function (property) {
        var obj = this;
        return {
          $UID: obj.$UID + "." + property,

          get: function() { return obj[property]; },

          set: function(val) { obj[property] = val; },

          addListener: function(listener) {
            obj.addPropertyListener(property, listener);
          },

          removeListener: function(listener) {
            obj.removePropertyListener(property, listener);
          },

          toString: function () {
            return "PropertyValue(" + obj + "," + property + ")";
          }
        };
      }
    }
  ],
  ['FObject', 'Extends', 'PropertyChangeSupport'],
  [null, "Model", { name: "Events" }],
  ["Events", "Property", {
    name: "listeners_",
    scope: "static_",
    valueFactory: function() { return {}; }
  }],
  [
    "Events",
    "Method",
    {
      "name": "identity",
      "jsCode": function (x) { return x; }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "follow",
      "jsCode": function (srcValue, dstValue) {
        if ( ! srcValue || ! dstValue ) return;

        dstValue.set(srcValue.get());

        var listener = function () {
          dstValue.set(srcValue.get());
        };

        this.listeners_[[srcValue.$UID, dstValue.$UID]] = listener;

        srcValue.addListener(listener);
      }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "map",
      "jsCode": function (srcValue, dstValue, f) {
        if ( ! srcValue || ! dstValue ) return;

        var listener = function () {
          dstValue.set(f(srcValue.get()));
        };

        listener(); // copy initial value

        this.listeners_[[srcValue.$UID, dstValue.$UID]] = listener;

        srcValue.addListener(listener);
      }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "unfollow",
      "jsCode": function (srcValue, dstValue) {
        if ( ! srcValue || ! dstValue ) return;

        var key      = [srcValue.$UID, dstValue.$UID];
        var listener = this.listeners_[key];

        delete this.listeners_[key];

        srcValue.removeListener(listener);
      }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "link",
      "jsCode": function (value1, model2) {
        this.follow(value1, model2);
        this.follow(model2, value1);
      }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "relate",
      "jsCode": function (value1, value2, f, fprime) {
        this.map(value1, value2, f);
        this.map(value2, value1, fprime);
      }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "unlink",
      "jsCode": function (value1, value2) {
        this.unfollow(value1, value2);
        this.unfollow(value2, value1);
      }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "dynamic",
      "jsCode": function (fn, opt_fn) {
        var fn2 = opt_fn ? function() { fn(opt_fn()); } : fn;
        var oldOnGet = Events.onGet;
        var listener = EventService.merged(fn2, 5);
        Events.onGet = function(obj, name, value) {
          obj.propertyValue(name).addListener(listener);
        };
        var ret = fn();
        Events.onGet = oldOnGet;
        opt_fn && opt_fn(ret);
      }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "onSet",
      "jsCode": function (obj, name, newValue) {
        return true;
      }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "onGet",
      "jsCode": function (obj, name, value) {
      }
    }
  ],
  ['Function', 'Method', function o(f2) {
    var f1 = this;
    return function() { return f1.call(this, f2.apply(this, arguments)); };
  }],
  [null, "Model", { name: "Movement" }],
  [
    "Movement",
    "Method",
    {
      "name": "distance",
      "jsCode": function (x, y) { return Math.sqrt(x*x + y*y); }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "o",
      "jsCode": function (f1, f2) { return function(x) { return f1(f2(x)); }; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "avg",
      "jsCode": function (f1, f2) { return function(x) { return (f1(x) + f2(x))/2; }; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "linear",
      "jsCode": function (x) { return x; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "back",
      "jsCode": function (x) { return x < 0.5 ? 2*x : 2-2*x; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "accelerate",
      "jsCode": function (x) { return (Math.sin(x * Math.PI - Math.PI/2)+1)/2; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "easeIn",
      "jsCode": function (a) {
        var v = 1/(1-a/2);
        return function(x) {
          var x1 = Math.min(x, a);
          var x2 = Math.max(x-a, 0);
          return (a ? 0.5*x1*(x1/a)*v : 0) + x2*v;
        };
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "reverse",
      "jsCode": function (f) { return function(x) { return 1-f(1-x); }; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "easeOut",
      "jsCode": function (b) { return Movement.reverse(Movement.easeIn(b)); }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "oscillate",
      "jsCode": function (b,a,opt_c) {
        var c = opt_c || 3;
        return function(x) {
          if ( x < (1-b) ) return x/(1-b);
          var t = (x-1+b)/b;
          return 1+(1-t)*2*a*Math.sin(2*c*Math.PI * t);
        };
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "bounce",
      "jsCode": function (b,a,opt_c) {
        var c = opt_c || 3;
        return function(x) {
          if ( x < (1-b) ) return x/(1-b);
          var t = (x-1+b)/b;
          return 1-(1-t)*2*a*Math.abs(Math.sin(2*c*Math.PI * t));
        };
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "bounce2",
      "jsCode": function (a) {
        var v = 1 / (1-a);
        return function(x) {
          if ( x < (1-a) ) return v*x;
          var p = (x-1+a)/a;
          return 1-(x-1+a)*v/2;
        };
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "stepBack",
      "jsCode": function (a) {
        return function(x) {
          return ( x < a ) ? -x : -2*a+(1+2*a)*x;
        };
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "ease",
      "jsCode": function (a, b) {
        return Movement.o(Movement.easeIn(a), Movement.easeOut(b));
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "seq",
      "jsCode": function (f1, f2) {
        return ( f1 && f2 ) ? function() { f1.apply(this, arguments); f2(); } :
        f1 ? f1
          : f2 ;
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "animate",
      "jsCode": function (duration, fn, opt_interp, opt_onEnd) {
        if ( duration == 0 ) return Movement.seq(fn, opt_onEnd);

        var interp = opt_interp || Movement.linear;

        return function() {
          var startTime = Date.now();
          var oldOnSet  = Events.onSet;
          var ranges = [];

          Events.onSet = function(obj, name, value2) {
            ranges.push([obj, name, obj[name], value2]);
          };
          fn && fn.apply(this, arguments);
          Events.onSet = oldOnSet;

          if ( ranges.length > 0 || true ) {
            var timer = setInterval(function() {
              var now = Math.min(Date.now(), startTime + duration);
              var p   = interp((now-startTime)/duration);

              for ( var i = 0 ; i < ranges.length ; i++ ) {
                var r = ranges[i];
                var obj = r[0];
                var name = r[1];
                var value1 = r[2];
                var value2 = r[3];

                obj[name] = value1 + (value2-value1) * p;
              }

              if ( now >= startTime + duration ) {
                clearTimeout(timer);
                opt_onEnd && opt_onEnd();
              }
            }, 30);
          }
        };
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "animate2",
      "jsCode": function (timer, duration, fn) {
        return function() {
          var startTime = timer.time;
          var oldOnSet  = Events.onSet;
          Events.onSet = function(obj, name, value2)
          {
            var value1 = obj[name];

            Events.dynamic(function() {
              var now = timer.time;

              obj[name] = value1 + (value2-value1) * (now-startTime)/duration;

              if ( now > startTime + duration ) throw EventService.UNSUBSCRIBE_EXCEPTION;
            });

            return false;
          };
          fn.apply(this, arguments);
          Events.onSet = oldOnSet;
          update();
        };
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "compile",
      "jsCode": function (a, opt_rest) {
        function noop() {}

        function isSimple(op) {
          return Array.isArray(op) && typeof op[0] === 'number';
        }

        function compileSimple(op, rest) {
          op[3] = Movement.seq(op[3], rest);
          return function() { Movement.animate.apply(null, op)(); };
        }

        function isParallel(op) {
          return Array.isArray(op) && Array.isArray(op[0]);
        }

        function compileParallel(op, rest) {
          var join = (function(num) {
            return function() { --num || rest(); };
          })(op.length);

          return function() {
            for ( var i = 0 ; i < op.length ; i++ )
              if ( isSimple(op[i]) )
                Movement.animate(op[i][0], op[i][1], op[i][2], Movement.seq(op[i][3], join))();
            else
              Movement.compile(op[i], join)();
          };
        }

        function compileFn(fn, rest) {
          return Movement.seq(fn, rest);
        }

        function compile_(a, i) {
          if ( i >= a.length ) return opt_rest || noop;

          var rest = compile_(a, i+1);
          var op = a[i];

          if ( isSimple(op)   ) return compileSimple(op, rest);
          if ( isParallel(op) ) return compileParallel(op, rest);

          return compileFn(op, rest);
        }

        return compile_(a, 0);
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "onIntersect",
      "jsCode": function (o1, o2, fn) {

      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "stepTowards",
      "jsCode": function (src, dst, maxStep) {
        var dx = src.x - dst.x;
        var dy = src.y - dst.y;
        var theta = Math.atan2(dy,dx);
        var r     = Math.sqrt(dx*dx+dy*dy);
        r = r < 0 ? Math.max(-maxStep, r) : Math.min(maxStep, r);

        dst.x += r*Math.cos(-theta);
        dst.y -= r*Math.sin(-theta);
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "moveTowards",
      "jsCode": function (t, body, sat, v) {
        var bodyX = body.propertyValue('x');
        var bodyY = body.propertyValue('y');
        var satX  = sat.propertyValue('x');
        var satY  = sat.propertyValue('y');

        t.addListener(function() {
          var dx = bodyX.get() - satX.get();
          var dy = (bodyY.get() - satY.get());
          var theta = Math.atan2(dy,dx);
          var r     = Math.sqrt(dx*dx+dy*dy);

          r = r < 0 ? Math.max(-v, r) : Math.min(v, r);

          satX.set(satX.get() + r*Math.cos(-theta));
          satY.set(satY.get() - r*Math.sin(-theta));
        });
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "orbit",
      "jsCode": function (t, body, sat, r, p)
      {
        var bodyX = body.propertyValue('x');
        var bodyY = body.propertyValue('y');
        var satX  = sat.propertyValue('x');
        var satY  = sat.propertyValue('y');

        t.addListener(function() {
          var time = t.time;
          satX.set(bodyX.get() + r*Math.sin(time/p*Math.PI*2));
          satY.set(bodyY.get() + r*Math.cos(time/p*Math.PI*2));
        });
      }
    }
  ],

  // Finish up FObject
  ['FObject', 'Method', function hasOwnProperty(name) {
    return this.instance_.hasOwnProperty(name);
  }],
  // Should this really be here?  It skips all the property stuff.
  ['FObject', 'Method', function clearProperty(name) {
    delete this.instance_[name];
  }],
  ['FObject', 'Method', function hashCode() {
    var hash = 17;

    for ( var i = 0; i < this.model_.features.length ; i++ ) {
      var feature = this.model_.features[i].name;
      if ( !Property.isInstance(feature) ) continue;

      var prop = this[feature.name];
      var code = ! prop ? 0 :
        prop.hashCode   ? prop.hashCode()
                        : prop.toString().hashCode();

      hash = ((hash << 5) - hash) + code;
      hash &= hash;
    }

    return hash;
  }],


  [null, 'Model', { name: 'StringProperty' }],
  ['StringProperty', 'Extends', 'Property'],
  ['StringProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'String',
    displayWidth: 20
  }],

  ['Feature', 'StringProperty', { name: 'help' }],

  ['Property', 'StringProperty', {
    name: 'type',
    help: 'The FOAM type of this property.'
  }],
  ['Property', 'StringProperty', {
    name: 'javaType',
    help: 'The Java type of this property.'
  }],
  ['StringProperty', 'StringProperty', {
    name: 'javaType',
    defaultValue: 'String'
  }],

  // Some test models.
  [null, 'Model', { name: 'Mail' }],
  ['Mail', 'Model', { name: 'EMail' }],
  ['Mail.EMail', 'Property', { name: 'sender', defaultValue: 'adamvy' }],
  ['Mail.EMail', 'Method', function send() { console.log(this.sender); }],
  ['Mail.EMail', 'Method', function test() { console.log(testHelper()); }],
  ['Mail.EMail.test', 'Method', function testHelper() { return 12; }],
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
  var mails = Mail.create();
  var mail = mails.EMail.create();
  mail.send();
  mail.test();
  var mail2 = mails.EMail.create({ sender: 'kgr' });
  mail.send();
  mail.sender = 'mike';
  mail2.send();
  mail2.test();
}
