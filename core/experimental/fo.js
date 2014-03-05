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

/**
 * Override a method, making calling the overridden method possible by
 * calling this.SUPER();
 **/
function override(cls, methodName, method) {
  var super_ = cls[methodName];

  var SUPER = function() { return super_.apply(this, arguments); };

  var f = function() {
    var OLD_SUPER = this.SUPER;
    this.SUPER = SUPER;
    try {
      return method.apply(this, arguments);
    } finally {
      this.SUPER = OLD_SUPER;
    }
  };

  f.super_ = super_;

  cls[methodName] = f;
}

function bootstrap(scope) {
  function simpleProperty(obj, name) {
    Object.defineProperty(obj, name, {
      configurable: true,
      writeable: true,
      enumerable: false,
      get: function() { return this.instance_[name]; },
      set: function(v) { this.instance_[name] = v; }
    });
  }

  // Make function objects act like Method instances.
  Object.defineProperty(Function.prototype, 'code', {
    configurable: true,
    writeable: false,
    enumerable: true,
    get: function() { return this; },
  });

  var ModelProto = { static_: {} };
  simpleProperty(ModelProto, "features");
  simpleProperty(ModelProto, "prototype");

  var Model = { instance_: {} };
  scope.set('Model', Model);
  Model.__proto__ = ModelProto;
  Model.prototype = ModelProto;
  Model.features = [];

  var FObject = { instance_: {} };
  scope.set('FObject', FObject);
  FObject.__proto__ = ModelProto;
  FObject.features = [];
  FObject.prototype = { static_: {} };
  Model.prototype.__proto__ = FObject.prototype;
  simpleProperty(FObject.prototype, "model_");

  FObject.model_ = Model;
  Model.model_ = Model;

  FObject.prototype.create = function create(args) {
    var proto = this.prototype || this.model_.prototype;

    var obj = {
      __proto__: proto,
      instance_: {}
    };

    // If we're not a Model, then pass along our model_ value.
    if ( this.model_ !== Model ) {
      obj.model_ = this.model_;
    } else {
      // Otherwise we just created an instance of ourself.
      obj.model_ = this;
    }
    // Copy from this as well, if we're initialize off an instance of a Model
    // rather than a model itself.  This allows objects to act as templates/factories
    if ( this.model_ !== Model ) {
      obj.copyFrom(this);
    }

    if ( args ) obj.copyFrom(args);

    obj.initialize();

    return obj;
  };
  FObject.prototype.copyFrom = function copyFrom(args) {
    for ( var i = 0; i < this.model_.features.length; i++ ) {
      this.model_.features[i].copy &&
        this.model_.features[i].copy(this, args);
    }
  };
  FObject.prototype.initialize = function initialize() {
    for ( var i = 0; i < this.model_.features.length; i++ ) {
      this.model_.features[i].init &&
        this.model_.features[i].init(this);
    }
  };

  var Property = { instance_: {} };
  scope.set('Property', Property);
  Property.__proto__ = ModelProto;
  Property.features = [];
  Property.model_ = Model;
  Property.prototype = { __proto__: FObject.prototype, static_: {} };
  simpleProperty(Property.prototype, "valueFactory");
  Property.prototype.install = function(o) {
    simpleProperty(o.prototype, this.name);
  };
  Property.prototype.init = function init(obj) {
    if ( this.valueFactory && ! obj.instance_[this.name] )
      obj[this.name] = this.valueFactory.call(obj);
  };
  Property.prototype.copy = function(obj, args) {
    // Don't copy default values.
    if ( args.instance_ && !args.instance_.hasOwnProperty(this.name) ) return;

    if ( this.name in args ) obj[this.name] = args[this.name];
  };
  simpleProperty(Property.prototype, "name");


  var tmp = Property.create();
  tmp.name = "name"
  Property.features.push(tmp);
  tmp.install(Property);

  tmp = Property.create({ name: 'valueFactory' });
  Property.features.push(tmp);
  tmp.install(Property);

  tmp = Property.create({
    name: 'prototype',
    valueFactory: function() {
      return { __proto__: FObject.prototype, static_: {} };
    }
  });
  Model.features.push(tmp);
  tmp.install(Model);

  tmp = Property.create({
    name: 'features',
    valueFactory: function() { return []; }
  });
  Model.features.push(tmp);
  tmp.install(Model);

  tmp = Property.create({
    name: 'name',
  });
  Model.features.push(tmp);
  tmp.install(Model);
  Model.name = 'Model';

  var Method = Model.create({ name: 'Method' });
  scope.set('Method', Method);
  Method.prototype.install = function(m) {
    if ( m.prototype[this.name] )
      override(m.prototype, this.name, this.code)
    else
      m.prototype[this.name] = this.code;
  };
};

var featureDAO = [
  ['Method', 'Property', { name: 'name' }],
  ['Method', 'Property', { name: 'code' }],

  ['Model', 'Method', function install(o) {
    o[this.name] = this;
  }],
  ['Model', 'Method', function create(args) {
    if ( this.model_ === Model && this.name != 'Model' ) {
      return this.prototype.create.call(this, args);
    }
    return this.SUPER(args);
  }],

  [null, 'Model', { name: 'Constant' }],
  ['Constant', 'Property', { name: 'name' }],
  ['Constant', 'Property', { name: 'value' }],
  ['Constant', 'Method', function install(o) {
    var value = this.value;
    Object.defineProperty(o.prototype, this.name, {
      configurable: true,
      writeable: true,
      enumerable: true,
      get: function() { return value },
      set: function(v) {
        console.warn('Changing constant value');
        value = v;
      }
    });
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

  ['Property', 'Property', { name: 'defaultValue' }],
  ['Property', 'Property', { name: 'scope', defaultValue: 'instance_' }],
  ['Property', 'Property', { name: 'defaultValueFn' }],
  ['Property', 'Property', { name: 'scopeName' }],
  ['Property', 'Property', { name: 'postSet' }],
  ['Property', 'Property', { name: 'preSet' }],
  ['Property', 'Property', { name: 'getter' }],
  ['Property', 'Property', { name: 'setter' }],
  ['Property', 'Method', function install(obj) {
    // TODO: Inheritence of parent model property
    var prop = this;

    var scope = this.scope || 'instance_';
    var scopeName = this.scopeName || this.name;
    var name = this.name;
    var defaultValueFn = this.defaultValueFn;
    var defaultValue = this.defaultValue;
    var valueFactory = this.valueFactory;
    var preSet = this.preSet;
    var postSet = this.postSet;

    obj[scopeName.constantize()] = this;

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

    Object.defineProperty(obj.prototype, scopeName, {
      configurable: true,
      enumerable: this.enumerable === undefined ? true : this.enumerable,
      writeable: true,
      get: get,
      set: set
    });

    if ( scope === "static_" && this.valueFactory ) {
      obj.prototype[this.name] = this.valueFactory();
    }
  }],
  ['Model',    'Method',  function isSubModel(model) {
    return model && (model === this ||
                     this.isSubModel(model.prototype.extendsModel));
  }],
  ['Model',    'Method',  function isInstance(obj) {
    return obj && obj.model_ && this.isSubModel(obj.model_);
  }],
  ['Model',    'Method',  function getPrototype() {
    return this.prototype;
  }],
  ['Model',    'Method',  function hashCode(obj) {
    return obj && obj.model_ && this.isSubModel(obj.model_);
  }],
  [null, 'Model', { name: 'Extends' }],
  ['Extends', 'Property', { name: 'parent' }],
  ['Extends', 'Method', function install(m) {
    var parent = get(this.parent);
    m.prototype.extendsModel = parent;
    m.prototype.__proto__ = parent.prototype;

    // TODO: do we do this, or pipe the features DAO?
    m.__proto__ = parent;
  }],

  // Types
  [null, 'Model', { name: 'StringProperty' }],
  ['StringProperty', 'Extends', 'Property'],
  ['Property', 'StringProperty', {
    name: 'help',
    help: 'Help text associated with the property.'
  }],
  ['Property', 'StringProperty', {
    name: 'name',
    help: 'The coding identifier for the property.'
  }],
  ['Property', 'StringProperty', {
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



  // Model pseudo-properties for backwards compatability.
  ['Model', 'Property', {
    name: 'properties',
    getter: function() {
      var props = [];
      for ( var i = 0; i < this.features.length; i++ ) {
        if ( Property.isInstance(this.features[i]) )
      }
    }
  }]

  ['FObject', 'Method', function hasOwnProperty(name) {
    return this.instance_.hasOwnProperty(name);
  }],
  // Should this really be here?  It skips all the property stuff.
  ['FObject', 'Method', function clearProperty(name) {
    delete this.instance_[name];
  }],
  ['FObject', 'Method', function writeActions(other, out) {
    for ( var i = 0, property ; property = this.model_.properties[i] ; i++ ) {
      if ( property.actionFactory ) {
        var actions = property.actionFactory(this, property.f(this), property.f(other));
        for (var j = 0; j < actions.length; j++)
          out(actions[j]);
      }
    }
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
    },
    setter: function(v) {
      this.code = v;
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
*/];

function lookup(address, scope) {
  if ( ! address ) return scope;

  var split = address.split('.');
  for ( var i = 0; i < split.length && scope; i++ ) {
    scope = scope.get ? scope.get(split[i]) : scope[split[i]];
  }
  return scope;
}

function build(scope, features) {
  for ( var i = 0 ; i < features.length ; i++ ) {
    var f = features[i];
    if (f[3]) debugger;

    var model = lookup(f[0], scope);
    if ( ! model ) throw "Model not found: " + f[0];

    var feature = lookup(f[1], scope);
    if ( !feature ) throw "Feature not found: " + f[1];

    var args = f[2];
    var feature = feature.create(args);
    model.features.push(feature);
    feature.install(model);
  }
}

var scope = window;
scope.set = function(key, value) { this[key] = value; };
scope.get = function(key) { return this[key]; };
scope.features = [];
bootstrap(scope);
build(scope, featureDAO);

/*
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
*/
