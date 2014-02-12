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

function defineProperties(proto, fns) {
  for ( var key in fns ) {
    try {
      Object.defineProperty(proto, key, {
        value: fns[key],
        configurable: true,
        writable: true
      });
    } catch (x) {
      console.log('Warning: ' + x);
    }
  }
}

defineProperties(Array.prototype, {
  get: function(name) {
    for ( var idx = 0; idx < this.length; idx++ ) {
      if ( this[idx].name === name ) return this[idx];
    }
    return this.__super__ && this.__super__.get(name);
  },

  listen: function(listener) {
    if ( ! this.listeners_ ) this.listeners_ = [];
    this.listeners_.push(listener);
  },

  unlisten: function(l) {
    if ( ! this.listeners_ ) return;
    this.listeners_ =
      this.listeners_.filter(function(l2) { return l === l2; });
  },

  put: function(obj) {
    for ( var i = 0; i < this.length; i++) {
      // TODO this should be id
      if ( this[i].name === obj.name ) {
        var old = this[i];
        this[i] = obj;
        break;
      }
    }
    if ( i == this.length ) this.push(obj);

    this.listeners_ && this.listeners_.forEach(function(l) {
      l.put(obj, old);
    });
  },

  select: function(sink) {
    this.forEach(function(item) { sink.put(item); });
  },

  pipe: function(sink) {
    this.select(sink);
    this.listen(sink);
  }
});

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

var CTX;

(function() {
  var FObject, Model, Method, Property;

  FObject = {
    instance_: {
      name: 'FObject',
      prototype: {
        TYPE_: 'FObjectPrototype',
        instance_: {},
        create: function (args) {
          var obj = {
            __proto__: this,
            instance_: {}
          };
          obj.model_ = this.model_;
          obj.copyFrom(args);
          obj.init(args);
          return obj;
        },
        copyFrom: function(src) {
          if ( src && src.instance_ ) src = src.instance_;

          for ( var key in src ) {
            this[key] = src[key];
          }
          return this;
        },
        init: function(args) {
          var features = this.model_.features;
          if ( ! features ) return;
          for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            feature.initialize && feature.initialize(this, args);
          }
        }
      },
      features: []
    }
  };

  Model = {
    instance_: {
      TYPE_: 'ModelPrototype',
      name: 'Model',
      features: []
    }
  };

  function simpleProperty(obj, name) {
    Object.defineProperty(obj, name, {
      configurable: true,
      writeable: true,
      enumerable: false,
      get: function() { return this.instance_[name]; },
      set: function(v) { this.instance_[name] = v; }
    });
  }

  simpleProperty(Model, "prototype");
  simpleProperty(Model, "features");
  Model.prototype = Model;

  FObject.__proto__ = Model.prototype;
  Model.__proto__ = FObject.prototype;

  simpleProperty(FObject.prototype, "name");
  simpleProperty(FObject.prototype, "model_");

  FObject.model_ = Model;
  Model.prototype.model_ = Model;
  FObject.prototype.model_ = Model;

  Method = {
    __proto__: Model.prototype,
    instance_: {
      name: 'Method',
      prototype: {
        __proto__: FObject.prototype,
        TYPE_: 'MethodPrototype',
        instance_: {},
        install: function(o) {
          o.prototype[this.name] = this.code;
          o.prototype[this.name].super_ = o.prototype.__proto__[this.name];
        },
        create: function(args) {
          if ( args instanceof Function ) {
            args = {
              name: args.name,
              code: args
            }
          }
          return FObject.prototype.create.call(this, args);
        }
      },
      features: []
    }
  };

  Method.model_ = Model;
  Method.prototype.model_ = Method;

  simpleProperty(Method.prototype, "code");

  Property = {
    __proto__: Model.prototype,
    instance_: {
      name: 'Property',
      prototype: {
        __proto__: FObject.prototype,
        TYPE_: 'PropertyPrototype',
        instance_: {},
      },
      features: [],
    }
  };

  Property.model_ = Model;
  Property.prototype.model_ = Property;

  CTX = {
    __proto__: Model.prototype,
    instance_: {
      name: "name",
      features: [
        String,
        Object,
        Date,
        Number,
        Boolean,
        Function,
      ],
      prototype: {
        __proto__: FObject.prototype,
        TYPE_: 'CTXPrototype',
      }
    }
  };

  CTX.features.push(FObject);
  CTX.features.push(Model);
  CTX.features.push(Method);
  CTX.features.push(Property);

  CTX.Model = Model;
  CTX.FObject = FObject;
  CTX.Method = Method;
  CTX.Property = Property;

  [FObject, Model, Method, Property].forEach(function(m) {
    Object.defineProperty(CTX.prototype, m.name, {
      configurable: true,
      writeable: true,
      enumerable: true,
      get: function() {
        return m
      }
    });
  });

  FObject.prototype.onFeatureInstall = function(f, old) {
    f.install && f.install(this, old);
  };

  Model.features.pipe({ put: FObject.prototype.onFeatureInstall.bind(Model) });
  CTX.features.pipe({ put: FObject.prototype.onFeatureInstall.bind(CTX) });
  FObject.features.pipe({ put: FObject.prototype.onFeatureInstall.bind(FObject) });
  Method.features.pipe({ put: FObject.prototype.onFeatureInstall.bind(Method) });
  Property.features.pipe({ put: FObject.prototype.onFeatureInstall.bind(Property) });
})();

var features = [
  ['FObject',    'Method',  function initialize() {} ],
  ['FObject',    'Method',  function clone() {
    var self = this;
    this.model_.features.forEach(function(f) {
      if ( CTX.Property.isInstance(f) ) {
        if ( Object.prototype.hasOwnProperty.call(self, f.name) ) {
          var value = self[f.name];
          delete self[f.name];
          self[f.name] = value;
        }
      }
    });
    return this.model_.prototype.create ? this.model_.prototype.create(this) : this;
  }],
  ['FObject',    'Method',  function toString() {
    return this.TYPE_;
  }],
  ['FObject',  'Method',  function getFeature(name) {
    return this.features && this.features.get(name);
  }],
  ['Model', 'Method', function create(args) {
    var obj = CTX.FObject.prototype.create.call(this, args);
    obj.prototype = {
      // TODO: A better way to lookup FObject.
      __proto__: CTX.FObject.prototype,
      TYPE_: obj.name + "Prototype",
      instance_: {},
    }
    obj.prototype.model_ = obj;

    obj.features.pipe({ put: obj.onFeatureInstall.bind(obj) });
    return obj;
  }],
  ['Model',    'Method',  function install(o) {
    o[this.name] = this;
    // TODO Better way to lookup CTX.Property.
    var name = this.name;
    var prop = CTX.Property.prototype.create({
      name: this.name,
      defaultValue: this,
      getter: function() {
        if ( this.ctx_ ) return this.ctx_.$get(name);
        return prop.defaultValue;
      },
      setter: function(v) {
        if ( this.ctx_ ) this.ctx_.$set(name, v);
      },
    });
    prop.install && prop.install(o);
  }],
  ['Model',    'Method',  function isSubModel(model) {
    try {
      return model && (model === this || this.isSubModel(
        (model.features.get("extends") || {}).model) );
    } catch(x) {
      return false;
    }
  }],
  ['Model',    'Method',  function isInstance(obj) {
    return obj && obj.model_ && this.isSubModel(obj.model_);
  }],
//  [null,       'Model', { name: 'Property' }],
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
    var parent = o.features && o.features.get('extends');
    if ( parent ) {
      var parentFeature = parent.model.features.get(this.name);
      if ( parentFeature ) {
        this.instance_.__proto__ = parentFeature.instance_;
      }
    }

    o[this.scopeName.constantize()] = this;

    var prop = this;

    var scope = this.scope;
    var scopeName = this.scopeName;
    var name = this.name;
    var defaultValueFn = this.defaultValueFn;
    var defaultValue = this.defaultValue;
    var valueFactory = this.valueFactory;
    var preSet = this.preSet;
    var postSet = this.postSet;

    var get = this.getter || (
      defaultValueFn ?
        (function() {
          if ( this[scope][scopeName] === undefined ) {
            if ( valueFactory ) {
              return this[scope][scopeName] = valueFactory.call(this);
            }
            return defaultValueFn.call(this, prop);
          }
          return this[scope][scopeName];
        }) :
        (function() {
          if ( this[scope][scopeName] === undefined ) {
            if ( valueFactory ) {
              return this[scope][scopeName] = valueFactory.call(this);
            }
            return defaultValue;
          }
          return this[scope][scopeName]
        }));

    var set = this.setter || function(value) {
      // Do we want to restirct oldValue to just the local instance, not parent instances_?
      var oldValue = this[scope][scopeName];

      if ( preSet ) value = preSet.call(this, value, oldValue, prop);

      this[scope][scopeName] = value;

      if ( postSet ) postSet.call(this, oldValue, value, prop)

      this.propertyChange && this.propertyChange(scopeName, oldValue, value);
    };

    Object.defineProperty(o.prototype, this.scopeName, {
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
  ['Property', 'Property', { name: 'scope', scope: 'instance_', scopeName: 'scope', defaultValue: 'instance_' }],
  ['Property', 'Property', { name: 'scopeName', scopeName: 'scopeName', defaultValueFn: function() { return this.name } }],
  ['Property', 'Property', { name: 'name' }],
  ['Property', 'Property', {
    name: 'defaultValue',
    defaultValue: '',
    help: 'The property\'s default value.'
  }],

  ['Property', 'Property', {
    name: 'defaultValueFn'
  }],

  ['Property', 'Property', {
    name: 'valueFactory'
  }],

  ['Property', 'Property', { name: 'enumerable', defaultValue: true }],
  ['Property', 'Method', function f(o) {
    return o[this.name];
  }],
  ['Property', 'Method', function initialize(o) {
    if ( ! o.instance_.hasOwnProperty(this.name) &&
        this.valueFactory ) o.instance_[this.name] = this.valueFactory();
  }],

  ['Method', 'Property', {
    name: 'name',
  }],
  ['Method', 'Property', {
    name: 'code'
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
    // TODO this can be cleand up.
    var model = CTX[model] || GLOBAL[model];
    return this.SUPER({
      model: model,
      name: 'extends'
    });
  }],
  ['Extends',  'Method',  function install(o) {
/*    this.model.features.pipe({
      put: function(f) {
        if ( f.name == "extends" ) return;
        var feature = f.clone();
        feature.__parent__ = f;
        o.features.put(feature);
      }
    });*/
    o.prototype.__proto__ = this.model.prototype;
  }],

  ['Property', 'Extends', 'Feature'],
  ['Model', 'Extends', 'Feature'],
  ['Extends', 'Extends', 'Feature'],
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
  [
    "FObject",
    "Constant",
    {
      "name": "UNSUBSCRIBE_EXCEPTION",
      "value": "unsubscribe"
    }
  ],

  [
    "FObject",
    "Constant",
    {
      "name": "WILDCARD",
      "value": "*"
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "oneTime",
      "code": function (listener) {
        return function() {
          listener.apply(this, arguments);

          throw FObject.prototype.UNSUBSCRIBE_EXCEPTION;
        };
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "consoleLog",
      "code": function (listener) {
        return function() {
          console.log(arguments);

          listener.apply(this, arguments);
        };
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "merged",
      "code": function (listener, opt_delay) {
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
    "FObject",
    "Method",
    {
      "name": "animate",
      "code": function (listener) {
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
    "FObject",
    "Method",
    {
      "name": "async",
      "code": function (listener) {
        return this.delay(0, listener);
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "delay",
      "code": function (delay, listener) {
        return function() {
          var args = arguments;

          // Is there a better way of doing this?
          setTimeout( function() { listener.apply(this, args); }, delay );
        };
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "hasListeners",
      "code": function (topic) {
        // todo:
        return true;
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "publish",
      "code": function (topic) {
        return this.subs_ ? this.pub_(this.subs_, 0, topic, this.appendArguments([this, topic], arguments, 1)) : 0;
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "publishAsync",
      "code": function (topic) {
        var args = arguments;
        var me   = this;

        setTimeout( function() { me.publish.apply(me, args); }, 0 );
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "publishLazy",
      "code": function (topic, fn) {
        if ( this.hasListeners(topic) ) return this.publish.apply(this, fn());

        return 0;
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "subscribe",
      "code": function (topic, listener) {
        if ( ! this.subs_ ) this.subs_ = {};

        this.sub_(this.subs_, 0, topic, listener);
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "unsubscribe",
      "code": function (topic, listener) {
        if ( ! this.subs_ ) return;

        this.unsub_(this.subs_, 0, topic, listener);
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "unsubscribeAll",
      "code": function () {
        this.sub_ = {};
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "pub_",
      "code": function (map, topicIndex, topic, msg) {
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
    "FObject",
    "Method",
    {
      "name": "sub_",
      "code": function (map, topicIndex, topic, listener) {
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
    "FObject",
    "Method",
    {
      "name": "unsub_",
      "code": function (map, topicIndex, topic, listener) {
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
    "FObject",
    "Method",
    {
      "name": "notifyListeners_",
      "code": function (topic, listeners, msg) {
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
    "FObject",
    "Method",
    {
      "name": "appendArguments",
      "code": function (a, args, start) {
        for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);

        return a;
      }
    }
  ],
  [
    "FObject",
    "Constant",
    {
      "name": "PROPERTY_TOPIC",
      "value": "property"
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "propertyTopic",
      "code": function (property) {
        return [ this.PROPERTY_TOPIC, property ];
      }
    }
  ],
  [
    "FObject",
    "Method",
    {
      "name": "propertyChange",
      "code": function (property, oldValue, newValue) {
        // don't bother firing event if there are no listeners
        if ( ! this.subs_ ) return;

        // don't fire event if value didn't change
        if ( property != null && oldValue === newValue ) return;

        this.publish(this.propertyTopic(property), oldValue, newValue);
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "globalChange",
      "code": function () {
        this.publish(this.propertyTopic(this.WILDCARD), null, null);
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "addListener",
      "code": function (listener) {
        // this.addPropertyListener([ this.PROPERTY_TOPIC ], listener);
        this.addPropertyListener(null, listener);
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "removeListener",
      "code": function (listener) {
        this.removePropertyListener(null, listener);
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "addPropertyListener",
      "code": function (property, listener) {
        this.subscribe(this.propertyTopic(property), listener);
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "removePropertyListener",
      "code": function (property, listener) {
        this.unsubscribe(this.propertyTopic(property), listener);
      }
    }
  ],

  [
    "FObject",
    "Method",
    {
      "name": "propertyValue",
      "code": function (property) {
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
      "code": function (x) { return x; }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "follow",
      "code": function (srcValue, dstValue) {
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
      "code": function (srcValue, dstValue, f) {
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
      "code": function (srcValue, dstValue) {
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
      "code": function (value1, model2) {
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
      "code": function (value1, value2, f, fprime) {
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
      "code": function (value1, value2) {
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
      "code": function (fn, opt_fn) {
        var fn2 = opt_fn ? function() { fn(opt_fn()); } : fn;
        var oldOnGet = Events.prototype.onGet;
        var listener = FObject.prototype.merged(fn2, 5);
        Events.prototype.onGet = function(obj, name, value) {
          obj.propertyValue(name).addListener(listener);
        };
        var ret = fn();
        Events.prototype.onGet = oldOnGet;
        opt_fn && opt_fn(ret);
      }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "onSet",
      "code": function (obj, name, newValue) {
        return true;
      }
    }
  ],

  [
    "Events",
    "Method",
    {
      "name": "onGet",
      "code": function (obj, name, value) {
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
      "code": function (x, y) { return Math.sqrt(x*x + y*y); }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "o",
      "code": function (f1, f2) { return function(x) { return f1(f2(x)); }; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "avg",
      "code": function (f1, f2) { return function(x) { return (f1(x) + f2(x))/2; }; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "linear",
      "code": function (x) { return x; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "back",
      "code": function (x) { return x < 0.5 ? 2*x : 2-2*x; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "accelerate",
      "code": function (x) { return (Math.sin(x * Math.PI - Math.PI/2)+1)/2; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "easeIn",
      "code": function (a) {
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
      "code": function (f) { return function(x) { return 1-f(1-x); }; }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "easeOut",
      "code": function (b) { return Movement.reverse(Movement.easeIn(b)); }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "oscillate",
      "code": function (b,a,opt_c) {
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
      "code": function (b,a,opt_c) {
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
      "code": function (a) {
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
      "code": function (a) {
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
      "code": function (a, b) {
        return Movement.o(Movement.easeIn(a), Movement.easeOut(b));
      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "seq",
      "code": function (f1, f2) {
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
      "code": function (duration, fn, opt_interp, opt_onEnd) {
        if ( duration == 0 ) return Movement.seq(fn, opt_onEnd);

        var interp = opt_interp || Movement.linear;

        return function() {
          var startTime = Date.now();
          var oldOnSet  = Events.prototype.onSet;
          var ranges = [];

          Events.prototype.onSet = function(obj, name, value2) {
            ranges.push([obj, name, obj[name], value2]);
          };
          fn && fn.apply(this, arguments);
          Events.prototype.onSet = oldOnSet;

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
      "code": function (timer, duration, fn) {
        return function() {
          var startTime = timer.time;
          var oldOnSet  = Events.prototype.onSet;
          Events.prototype.onSet = function(obj, name, value2)
          {
            var value1 = obj[name];

            Events.prototype.dynamic(function() {
              var now = timer.time;

              obj[name] = value1 + (value2-value1) * (now-startTime)/duration;

              if ( now > startTime + duration ) throw FObject.prototype.UNSUBSCRIBE_EXCEPTION;
            });

            return false;
          };
          fn.apply(this, arguments);
          Events.prototype.onSet = oldOnSet;
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
      "code": function (a, opt_rest) {
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
      "code": function (o1, o2, fn) {

      }
    }
  ],

  [
    "Movement",
    "Method",
    {
      "name": "stepTowards",
      "code": function (src, dst, maxStep) {
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
      "code": function (t, body, sat, v) {
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
      "code": function (t, body, sat, r, p)
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
  ['FObject', 'Method', function output(out) {
    JSONUtil.output(out, this);
  }],
  ['FObject', 'Method', function toJSON() {
    return JSONUtil.stringify(this);
  }],
  ['FObject', 'Method', function toXML() {
    return XMLUtil.stringify(this);
  }],
  ['FObject', 'Method', function write() {
    var view = ActionBorder.create(
      this.model_,
      DetailView.create({model: this.model_}));

    document.wrintln(view.toHTML());
    view.value.set(this);
    view.initHTML();
  }],

  [null, 'Model', { name: 'StringProperty' }],
  ['StringProperty', 'Extends', 'Property'],
  ['Feature', 'StringProperty', {
    name: 'help',
    help: 'Help text associated with the feature.'
  }],
  ['Feature', 'StringProperty', {
    name: 'name',
    help: 'The name of the feature.'
  }],
  ['Property', 'StringProperty', {
    name: 'name',
    help: 'The coding identifier for the property'
  }],
  ['Feature', 'StringProperty', {
    name: 'label',
    help: 'The display label for the feature.',
    defaultValueFn: function() { return this.name.labelize(); }
  }],
  ['Feature', 'StringProperty', {
    name: 'tableLabel',
    help: 'The table display label for the feature.',
    defaultValueFn: function() { return this.name.labelize(); }
  }],
  ['Property', 'StringProperty', {
    name: 'type',
    required: true,
    help: 'The FOAM type of this property.'
  }],
  ['StringProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'String',
  }],
  ['Property', 'StringProperty', {
    name: 'javaType',
    help: 'The Java type of this property.'
  }],
  ['StringProperty', 'StringProperty', {
    name: 'javaType',
    defaultValue: 'String'
  }],

  [null, 'Model', { name: 'IntegerProperty' }],
  ['IntegerProperty', 'Extends', 'Property'],
  ['IntegerProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'Integer'
  }],
  ['IntegerProperty', 'StringProperty', {
    name: 'javaType',
    defaultValue: 'int'
  }],
  ['IntegerProperty', 'IntegerProperty', {
    name: 'defaultValue',
    defaultValue: 0
  }],
  ['Property', 'IntegerProperty', {
    name: 'displayWidth',
    defaultValue: 30,
    help: 'The display width of the property.'
  }],
  ['Property', 'IntegerProperty', {
    name: 'displayHeight',
    defaultValue: 1,
    help: 'The display height of the property.'
  }],
  ['IntegerProperty', 'IntegerProperty', {
    name: 'displayWidth',
    defaultValue: 8
  }],
  ['StringProperty', 'IntegerProperty', {
    name: 'displayHeight',
    displayWidth: 8,
    defaultValue: 1,
  }],

  [null, 'Model', { name: 'BooleanProperty' }],
  ['BooleanProperty', 'Extends', 'Property'],
  ['BooleanProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'Boolean'
  }],
  ['BooleanProperty', 'StringProperty', {
    name: 'javaType',
    defaultValue: 'Boolean'
  }],
  ['Property', 'BooleanProperty', {
    name: 'required',
    defaultValue: false
  }],
  [null, 'Model', { name: 'FunctionProperty' }],
  ['FunctionProperty', 'Extends', 'Property'],
  ['Property', 'FunctionProperty', {
    name: 'defaultValueFn',
    help: 'The property\'s default value function.'
  }],
  ['Property', 'FunctionProperty', {
    name: 'valueFactory',
    help: 'Factory for creating inital value when object instantiated.'
  }],

  ['FunctionProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'Function'
  }],
  ['FunctionProperty', 'StringProperty', {
    name: 'view',
    defaultValue: 'FunctionView'
  }],

  ['Property', 'FunctionProperty', {
    name: 'preSet',
    help: 'An adapter function called before normal setter logic.'
  }],
  ['Property', 'FunctionProperty', {
    name: 'postSet',
    help: 'A function called after normal setter logic, but before property change event fired.'
  }],
  ['Property', 'FunctionProperty', {
    name: 'setter',
    help: 'The property\'s setter function.'
  }],
  ['Property', 'FunctionProperty', {
    name: 'getter',
    help: 'The prpoerty\'s getter function.'
  }],
  ['Property', 'FunctionProperty', {
    name: 'tableFormatter',
    label: 'Table View Cell Formatter',
    help: 'Function to format value for display in TableView'
  }],
  ['Property', 'FunctionProperty', {
    name: 'summaryFormatter',
    label: 'Summary View Formatter',
    help: 'Function to format value for display in SummarView'
  }],

  [null, 'Model', { name: 'ArrayProperty' }],
  ['ArrayProperty', 'Extends', 'Property'],
  ['ArrayProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'Array'
  }],
  ['ArrayProperty', 'StringProperty', {
    name: 'subType',
    help: 'The FOAM sub-type of this property'
  }],
  ['ArrayProperty', 'FunctionProperty', {
    name: 'preSet',
    defaultValue: function(value, oldValue, prop) {
      // TODO There is no GLOBAL currently
      var m;// = GLOBAL[prop.subType];

      if ( ! m ) {
        return value;
      }

      for ( var i = 0; i < value.length; i++ ) {
        if ( ! m.isInstance(value[i]) ) {
          value[i] = m.prototype.create(value[i]);
        }
      }
    }
  }],
  ['ArrayProperty', 'StringProperty', {
    name: 'javaType',
    defaultValueFn: function(p) { return p.subType + '[]'; }
  }],
  ['ArrayProperty', 'StringProperty', {
    name: 'view',
    defaultvlaue: 'ArrayView'
  }],
  ['ArrayProperty', 'FunctionProperty', {
    name: 'valueFactory',
    defaultValue: function() { return []; }
  }],

  [null, 'Model', {
    name: 'ReferenceProperty',
    help: 'A foreign key reference to another Entity.'
  }],
  ['ReferenceProperty', 'Extends', 'Property'],
  ['ReferenceProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'Reference'
  }],
  ['ReferenceProperty', 'StringProperty', {
    name: 'javaType',
    // TODO: should obtain primary-key type from subType
    defaultValueFn: function(p) { return 'Object'; },
  }],
  ['ReferenceProperty', 'StringProperty', {
    name: 'view',
    // TODO: should be 'KeyView'
    defaultValue: 'TextFieldView'
  }],

  [null, 'Model', {
    name: 'StringArrayProperty',
    help: 'An array of String values.'
  }],
  ['StringArrayProperty', 'Extends', 'ArrayProperty'],
  ['StringArrayProperty', 'StringProperty', {
    name: 'subType',
    defaultValue: 'String'
  }],
  ['StringArrayProperty', 'StringProperty', {
    name: 'view',
    defaultValue: 'StringArrayView'
  }],
  [null, 'Model', { name: 'DateProperty' }],
  ['DateProperty', 'Extends', 'Property'],
  ['DateProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'Date',
  }],
  ['DateProperty', 'StringProperty', {
    name: 'javaType',
    defaultValue: 'Date'
  }],
  ['DateProperty', 'StringProperty', {
    name: 'view',
    defaultValue: 'DateFieldView'
  }],
  ['DateProperty', 'FunctionProperty', {
    name: 'preSet',
    defaultValue: function(d) {
      return typeof d === 'string' ? new Date(d) : d;
    }
  }],
  ['DateProperty', 'FunctionProperty', {
    name: 'tableFormatter',
    defaultValue: function(d) {
      var now = new Date();
      var seconds = Math.floor((now - d)/1000);
      if (seconds < 60) return 'moments ago';
      var minutes = Math.floor((seconds)/60);
      if (minutes == 1) {
        return '1 minute ago';
      } else if (minutes < 60) {
        return minutes + ' minutes ago';
      } else {
        var hours = Math.floor(minutes/60);
        if (hours < 24) {
          return hours + ' hours ago';
        }
        var days = Math.floor(hours / 24);
        if (days < 7) {
          return days + ' days ago';
        } else if (days < 365) {
          var year = 1900+d.getYear();
          var noyear = d.toDateString().replace(" " + year, "");
          return /....(.*)/.exec(noyear)[1];
        }
      }
      return d.toDateString();
    }
  }],

  [null, 'Model', { name: 'DateTimeProperty' }],
  ['DateTimeProperty', 'Extends', 'DateProperty'],
  ['DateTimeProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'datetime'
  }],
  ['DateTimeProperty', 'StringProperty', {
    name: 'view',
    defaultValue: 'DateTimeFieldView'
  }],

  [null, 'Model', { name: 'FloatProperty' }],
  ['FloatProperty', 'Extends', 'Property'],
  ['FloatProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'Float'
  }],
  ['FloatProperty', 'StringProperty', {
    name: 'javaType',
    defaultValue: 'double'
  }],
  ['FloatProperty', 'IntegerProperty', {
    name: 'displayWidth',
    defaultValue: 15
  }],

  [null, 'Model', { name: 'ReferenceArrayProperty' }],
  ['ReferenceArrayProperty', 'Extends', 'StringArrayProperty'],
  [null, 'Model', { name: 'EMailProperty' }],
  ['EMailProperty', 'Extends', 'StringProperty'],
  [null, 'Model', { name: 'URLProperty' }],
  ['URLProperty', 'Extends', 'StringProperty'],

  ['Property', 'FunctionProperty', {
    name: 'detailViewPreRow',
    defaultValue: function() { return ""; },
    help: 'Inject HTML before row in DetailView.'
  }],
  ['Property', 'FunctionProperty', {
    name: 'detailViewPostRow',
    defaultValue: function() { return ""; },
    help: 'Inject HTML before row in DetailView.'
  }],


  // Actions
  [null, 'Model', { name: 'Action' }],
  ['Action', 'BooleanProperty', {
    name: 'default',
    help: 'Indicates if this is the default action.'
  }],
  ['Action', 'FunctionProperty', {
    name: 'isAvailable',
    help: 'Function to determine if the action is available.',
    defaultValue: function() { return true; }
  }],
  ['Action', 'FunctionProperty', {
    name: 'isEnabled',
    help: 'Function to determine if the action is enabled.',
    defaultValue: function() { return true; }
  }],
  ['Action', 'FunctionProperty', {
    name: 'action',
    getter: function() {
      return this.code;
    }
  }],
  ['Action', 'Extends', 'Method'],
  ['Action', 'Method', function create(args) {
    args.code = args.action || args.code;
    return this.SUPER(args);
  }],

  [null, 'Model', { name: 'Listener' }],
  ['Listener', 'Extends', 'Method'],
  ['Listener', 'IntegerProperty', {
    name: 'merged',
    preSet: function ( value ) {
      if ( value === true ) return 16;
    },
    help: 'If greater than zero, the listener will be merged to this value.  Set to true to merge to 16ms'
  }],
  ['Listener', 'BooleanProperty', {
    name: 'animate',
    help: 'If true, this listener will be animated.'
  }],
  ['Listener', 'Method', function install(o) {
    var listener = this;
    Object.defineProperty(o.prototype, listener.name, {
      get: function() {
        var l = listener.code.bind(this);
        if ( listener.animate )
          l = FObject.animate(l);
        else if ( listener.merged > 0 )
          l = FObject.merged(l, listener.merged);
        Object.defineProperty(this, listener.name, { value: l });
        return l;
      },
      configurable: true
    });
  }],

  [null, 'Model', { name: 'Template' }],
  ['Template', 'StringProperty', {
    name: 'template',
    displayWidth: 180,
    displayHeight: 30,
    help: 'The template text for this template',
  }],
  ['Template', 'ArrayProperty', {
    name: 'templates',
    subType: 'Template',
    help: 'Sub-templates of this template'
  }],
  ['Template', 'Extends', 'Feature'],


  ['Template', 'Method', function install(o) {
    this.code = TemplateUtil.compile(this.template);
    this.SUPER(o);
  }],


  ['Model', 'ArrayProperty', {
    name: 'properties',
    subType: 'Property',
    setter: function(value) {
      for ( var i = 0; i < value.length; i++ ) {
        if ( value[i].model_ != Property )
          value[i] = Property.prototype.create(value[i]);

        this.features.put(value[i]);
      }
    },
    getter: function() {
      return this.features.filter(function(f) {
        return Property.isInstance(f);
      });
    }
  }],
  ['Model', 'ArrayProperty', {
    name: 'methods',
    subType: 'Method',
    setter: function(value) {
      if ( ! Method ) return;

      if ( value instanceof Array ) {
        value.select(this.features);
        return;
      }

      // convert a map of functions
      for ( var key in value )
      {
        var oldValue = value[key];
        var method   = Method.prototype.create({name: key, code: oldValue});

        this.features.put(method);
      }
    },
    getter: function() {
      return this.features.filter(Method.isInstance.bind(Method));
    }
  }],
  ['Model', 'StringProperty', {
    name: 'extendsModel',
    help: 'Name of the model that this model extends.',
    setter: function(value) {
      if ( ! value ) return;
      this.features.put(Extends.prototype.create(value));
    },
    getter: function() {
      var parent = this.features.get('extends');
      return parent && parent.model.name;
    }
  }],
  ['Model', 'ArrayProperty', {
    name: 'models',
    subType: 'Model',
    help: 'Sub-models of this model.',
    setter: function(value) {
      value.select(this.features);
    },
    getter: function() {
      return this.features.filter(function(f) {
        f.TYPE === 'Model';
      });
    }
  }],
  ['Model', 'ArrayProperty', {
    name: 'listeners',
    setter: function(value) {
      if ( Array.isArray(value) ) {
        value.select(this.features);
        return;
      }

      for ( var key in value )
      {
        var oldValue = value[key];
        var method   = Listener.prototype.create({name: key, code: oldValue});

        this.features.put(method);
      }
    },
    getter: function() {
      return this.features.filter(Listener.isInstance.bind(Listener));
    }
  }],
  ['Model', 'StringArrayProperty', {
    name: 'tableProperties',
    defaultValueFn: function() {
      return this.properties.map(Property.NAME.f.bind(Property.NAME));
    }
  }],
  ['FObject', 'Method', function getProperty(name) {
    var feat = this.features.get(name);
    if ( Property.isInstance(feat) ) return feat.f(this);
  }],
  ['Model', 'Method', function getPrototype() {
    return this.prototype;
  }],
];

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
      var feature = feature.prototype.create(args);
      if ( model.features ) {
        model.features.put(feature);
      } else {
        // Workaround for builtin non-modelled objects.
        feature.install(model);
      }
   }
}

build(CTX);

var GLOBAL = this;

(function() {
  var env = CTX.prototype.create();

  with (env) {
    CTX.features.forEach(function(f) {
      if ( Model.isInstance(f) ) {
        GLOBAL[f.name] = f;
      }
    });
  }

  GLOBAL['Events'] = Events.prototype.create({});
  GLOBAL['Movement'] = Movement.prototype.create({});
  GLOBAL['EventService'] = FObject;

  var EMail = Model.prototype.create({
    name: 'EMail',

    properties: [
      {
        name: 'to'
      }
    ],

    methods: {
      send: function() {
        var sender = this.Sender.prototype.create({
          recipient: this.to
        });
        sender.send();
      }
    },

    models: [
      Model.prototype.create({
        name: 'Sender',
        properties: [
          {
            name: 'recipient'
          }
        ],
        methods: [
          Method.prototype.create({
            name: 'send',
            code: function() {
              console.log("Sending to: " + this.recipient);
            }
          })
        ]
      })
    ]
  });

  var mail = EMail.prototype.create({ to: 'adamvy' });
  mail.send();
})();
