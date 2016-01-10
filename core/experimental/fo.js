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

var FeatureSet = {
  create: function() {
    var obj = Object.create(this);
    obj.a_ = [];
    obj.version_ = 1;
    obj.parentVersion_ = 0;
    obj.names_ = {};
    return obj;
  },

  where: function(p) {
    return {
      __proto__: this,
      forEach: function(iterator) {
        return this.__proto__.forEach.call(this, function(f) {
          if ( p(f) ) iterator(f);
        });
      },
      localForEach: function(iterator) {
        return this.__proto__.localForEach.call(this, function(f) {
          if ( p(f) ) iterator(f);
        });
      },
    };
  },

  forEach: function(iterator) {
    var self = this;
    if ( this.parent )
      this.parent.where(function(f) {
        return !f.name || !self.names_[f.name];
      }).forEach(iterator);
    this.localForEach(iterator);
  },

  localForEach: function(iterator) {
    for ( var i = 0; i < this.a_.length; i++ ) {
      var f = this.a_[i];

      if ( f.name && f !== this.names_[f.name] )
        continue;

      iterator(this.a_[i]);
    }
  },

  add: function(a) {
    if ( a.name ) this.names_[a.name] = a;
    this.a_.push(a);
    this.version_++;
  },

  get parent() { return this.parent_; },
  set parent(p)  { this.parent_ = p; },

  get version() {
    return this.version_;
  }
};

function defineLocalProperty(cls, name, factory) {
  Object.defineProperty(cls, name, { get: function() {
    if ( this == cls ) return null;
    var value = factory.call(this);
    Object.defineProperty(this, name, { value: value });
    return value;
  } });
}

Object.defineProperty(Object.prototype, 'addFeature', {
  configurable: true,
  enumerable: false,
  writable: true,
  value: function(f) {
    var model = Installer.create(this);
    var proto = Installer.create(this.prototype || this);
    f.install(model, proto);
  }
});

Object.defineProperty(Object.prototype, 'defineFOAMProperty', {
  configurable: true,
  enumerable: false,
  writable: true,
  value: function(name, definition) {
    definition.configurable = true;
    Object.defineProperty(this, name, definition);
  }
});

function trampoline(name, valueFn) {
  return {
    configurable: true,
    get: function() {
      this.defineFOAMProperty(name, valueFn.call(this));
      return this[name];
    },
    set: function(value) {
      this.defineFOAMProperty(name, valueFn.call(this));
      this[name] = value;
    }
  };
};

var Installer = {
  create: function(target) {
    return {
      __proto__: this,
      target: target
    };
  },
  define: function(name, definition) {
    definition.configurable = true;
    this.target.defineFOAMProperty(name, definition);
  },
  setParent: function(proto) {
    this.target.__proto__ = proto;
  },
  addMethod: function(name, code) {
    this.define(name, {
      writable: true,
      value: code
    });
  }
};

var LazyInstaller = {
  __proto__: Installer,
  create: function(delegate) {
    return {
      __proto__: this,
      delegate: delegate
    };
  },
  define: function(name, definition) {
    this.delegate.define(name, trampoline(name, function() {
      console.log("Trampolining ", name);
      return definition
    }));
  },
  setParent: function(parent) {
    // No lazy way to do this.
    this.delegate.setParent(parent);
  }
};

var LoggingInstaller = {
  __proto__: Installer,
  create: function(delegate) {
    return {
      __proto__: this,
      delegate: delegate
    };
  },
  define: function(name, definition) {
    console.log("Installing: ", name);
    this.delegate.define(name, definition);
  },
  setParent: function(parent) {
    console.log("Setting parent ", parent);
    this.delegate.setParent(parent);
  }
};

/**
 * Override a method, making calling the overridden method possible by
 * calling this.SUPER();
 **/
function override(super_, method) {
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
  return f;
}

function bootstrap(scope) {
  function simpleProperty(obj, name) {
    Object.defineProperty(obj, name, {
      configurable: true,
      enumerable: false,
      get: function() { return this.instance_[name]; },
      set: function(v) { this.instance_[name] = v; }
    });
  }

  // Make function objects act like Method instances.
  Object.defineProperty(Function.prototype, 'code', {
    configurable: true,
    enumerable: true,
    get: function() { return this; },
  });

  var Model = { instance_: {} };
  scope.set('Model', Model);
  Model.prototype_ = {
    model_: Model,
    addFeature: function(f) {
      this.propertyMap_ = null;

      if ( ! this.prototype_ ) {
        this.prototype_ = {
          model_: this,
          name_: this.name,
          TYPE: this.name + "Prototype",
        };
        var doAll = true;
      }

      if ( ! this.modelInstaller_ ) {
        this.modelInstaller_ = Installer.create(this);
        this.modelInstaller_.setParent = function(parent) {
          self.__proto__ = parent;
          self.features.parent = parent.features;
        };
      }
      if ( ! this.protoInstaller_ )
        this.protoInstaller_ = Installer.create(this.prototype_);

      var self = this;
      var model = this.modelInstaller_;
      var proto = this.protoInstaller_;
      var prototype = this.prototype_;

      if ( doAll ) {
        this.features.localForEach(function(f) {
          f.install(model, proto, prototype);
        });
      }

      this.features.add(f);
      f.install(model, proto, this.prototype_);
    },
    create: function(args) {
      var proto = this.getPrototype();
      if ( this.model_ === this ) return proto.__proto__.create.call(proto, args);
      return proto.create(args);
    },
    getPrototype: function() {
      return this.prototype_;
    }
  };

  Model.__proto__ = Model.prototype_;
  simpleProperty(Model.prototype_, "features");
  Model.features = FeatureSet.create();
  Model.prototype_.version_ = Model.features.version;

  var FObject = { instance_: {} };
  scope.set('FObject', FObject);
  FObject.__proto__ = Model.getPrototype();
  FObject.features = FeatureSet.create();
  FObject.features.add({
    name: 'HACK FEATURE, add property change support to FObject, these should all be features later.',
    install: function(model, proto) {
      proto.setParent(PropertyChangeSupport);
    }
  });
  FObject.prototype_ = {
    __proto__: PropertyChangeSupport,
    model_: FObject,
    version_: FObject.features.version,
    create: function(args, opt_X) {
      var obj = Object.create(this);
      obj.instance_ = {};
      if ( opt_X ) obj.X = opt_X;

      if ( args instanceof Object ) obj.copyFrom(args);

      obj.init(args);

      return obj;
    },
    copyFrom: function(args) {
      var self = this;
      this.model_.features.forEach(function(f) {
        f.copy && f.copy(self, args);
      });
      return this;
    },
    init: function() {
      var self = this;
      this.model_.features.forEach(function(f) {
        f.initialize && f.initialize(self);
      });
    }
  };

  var Extends = { instance_: {} };
  scope.set('Extends', Extends);
  Extends.__proto__ = Model.getPrototype();
  Extends.features = FeatureSet.create();
  Extends.prototype_ = {
    __proto__: FObject.getPrototype(),
    version_: Extends.features.version,
    model_: Extends,
    install: function(model, proto) {
      var parent = get(this.parent);
      proto.setParent(parent.getPrototype());
      model.setParent(parent);
    }
  };
  simpleProperty(Extends.prototype_, 'parent');

  var Method = { instance_: {} };
  scope.set('Method', Method);
  Method.__proto__ = Model.getPrototype();
  Method.features = FeatureSet.create();
  Method.prototype_ = {
    __proto__: FObject.getPrototype(),
    model_: Method,
    version_: Method.features.version,
    install: function(model, proto, prototype) {
      var code = this.code;
      if ( prototype.__proto__[this.name] )
        code = override(prototype.__proto__[this.name], this.code);

      proto.addMethod(this.name, code);
    }
  };
  simpleProperty(Method.prototype_, "name");
  simpleProperty(Method.prototype_, "code");

  var Property = { instance_: {} };
  scope.set('Property', Property);
  Property.__proto__ = Model.getPrototype();
  Property.features = FeatureSet.create();
  Property.prototype_ = {
    __proto__: FObject.getPrototype(),
    model_: Property,
    version_: Property.features.version,
    install: function(model, proto) {
      var name = this.name;
      var factory = this.factory;

      model.define(this.name.constantize(), {
        value: this,
      });

      proto.define(this.name, {
        configurable: true,
        enumerable: true,
        get: function() {
          if ( ! this.instance_[name] ) {
            if ( factory ) return this.instance_[name] = factory.call(this);
            return "";
          }
          return this.instance_[name];
        },
        set: function(v) {
          this.instance_[name] = v;
        }
      });
    },
    initialize: function initialize(obj) {
      if ( this.factory && ! obj.instance_[this.name] )
        obj[this.name] = this.factory.call(obj);
    },
    copy: function(obj, args) {
      // Don't copy default values.
      if ( !args ) return;

      if ( this.name === "property" ) debugger;

      if ( args.instance_ && !args.instance_.hasOwnProperty(this.name) ) return;

      if ( this.name in args ) obj[this.name] = args[this.name];
    }
  };
  simpleProperty(Property.prototype_, "name");
  simpleProperty(Property.prototype_, "factory");
  Property.prototype_.copyFrom = override(
    FObject.prototype_.copyFrom,
    function(args) {
      this.SUPER(args);
      for ( var key in args ) {
        if ( key === "property" ) debugger;
        this.instance_[key] = args[key];
      }
    });


  function forceInstall(feature, model) {
    model.addFeature(feature);
  }

  // Set all initial models to extends FObject.
  var tmp = Extends.create();
  tmp.parent = 'FObject';
  forceInstall(tmp, Model);
  tmp = Extends.create();
  tmp.parent = 'FObject';
  forceInstall(tmp, Property);
  tmp = Extends.create();
  tmp.parent = 'FObject';
  forceInstall(tmp, Extends);
  tmp = Extends.create();
  tmp.parent = 'FObject';
  forceInstall(tmp, Method);

  // Bootstreap the real property and method features we put in earlier.
  tmp = Property.create();
  tmp.name = "name"
  forceInstall(tmp, Property);

  tmp = Property.create({ name: 'factory' });
  forceInstall(tmp, Property);

  tmp = Property.create({
    name: 'name',
  });
  forceInstall(tmp, Model);

  tmp = Property.create({
    name: 'parent'
  });
  forceInstall(tmp, Extends);

  tmp = Property.create({
    name: 'features',
    factory: function() {
      var features = FeatureSet.create();
      features.add(Extends.create({ parent: 'FObject' }));
      return features;
    }
  });
  forceInstall(tmp, Model);

  Model.name = 'Model';
  FObject.name = 'FObject';
  Property.name = 'Property';
  Method.name = 'Method';
  Extends.name = 'Extends';

  tmp = Property.create({
    name: 'name',
  });
  forceInstall(tmp, Method);

  tmp = Property.create({
    name: 'code',
  });
  forceInstall(tmp, Method);

  function upgradeMethod(model, name) {
    var tmp = Method.create({
      name: name,
      code: model.prototype_[name]
    });
    forceInstall(tmp, model);
  }

  upgradeMethod(Method, 'install');
  upgradeMethod(Model, 'create');
  upgradeMethod(Model, 'getPrototype');
  upgradeMethod(Model, 'addFeature');
  upgradeMethod(Property, 'install');
  upgradeMethod(Property, 'initialize');
  upgradeMethod(Property, 'copy');
  upgradeMethod(Extends, 'install');
  upgradeMethod(FObject, 'create');
  upgradeMethod(FObject, 'copyFrom');
  upgradeMethod(FObject, 'init');
};

var featureDAO = [
  ['Model', 'Method', function install(model, proto) {
    proto.define(this.name, {
      value: this
    });
  }],
  ['Model', 'Method', function isSubModel(model) {
    try {
      return model && ( model === this || this.isSubModel(model.getPrototype().__proto__.model_) );
    } catch (x) {
      return false;
    }
  }],
  ['Model', 'Method',  function getPropertyWithoutCache_(name) {
    var p = null;
    this.features.forEach(function(f) {
      if ( Property.isInstance(f) && f.name === name ) p = f;
    });
    return p;
  }],
  ['Model', 'Method', function getProperty(name) {
    if ( ! Object.prototype.hasOwnProperty.call(this, 'propertyMap_') ||
         ! this.propertyMap_ ) {
      var m = {};
      this.features.forEach(function(f) {
        if ( Property.isInstance(f) && f.name === name ) {
          m[f.name] = f;
        }
      });
      this.propertyMap_ = m;
    }
    return this.propertyMap_[name];
  }],
  ['Model', 'Method', function hashCode() {
    var string = "";
    var self = this;
    this.features.forEach(function(f) {
      string += f.f(self.toString());
    });
    return string.hashCode();
  }],
  ['Model', 'Method', function isInstance(obj) {
    return obj && obj.model_ && this.isSubModel(obj.model_);
  }],
  ['FObject', 'Method', function toString() {
    return this.model_.name + "Prototype"
  }],
  ['FObject', 'Method', function hasOwnProperty(name) {
    return typeof this.instance_[name] !== 'undefined';
  }],
  ['FObject', 'Method', function equals(other) {
    return this.compareTo(other) == 0;
  }],
  ['FObject', 'Method', function compareTo(other) {
    var ps = this.model_.properties;

    for ( var i = 0 ; i < ps.length ; i++ ) {
      var r = ps[i].compare(this, other);

      if ( r ) return r;
    }

    return 0;
  }],
  ['FObject', 'Method', function diff(other) {
    var diff = {};

    for ( var i = 0, property; property = this.model_.properties[i]; i++ ) {
      if ( Array.isArray(property.f(this)) ) {
        var subdiff = property.f(this).diff(property.f(other));
        if ( subdiff.added.length !== 0 || subdiff.removed.length !== 0 ) {
          diff[property.name] = subdiff;
        }
        continue;
      }

      if ( property.f(this).compareTo(property.f(other)) !== 0) {
        diff[property.name] = property.f(other);
      }
    }

    return diff;
  }],
  ['FObject', 'Method', function clearProperty(name) {
    delete this.instance_[name];
  }],
  ['FObject', 'Method', function hashCode() {
    var hash = 17;

    for ( var i = 0; i < this.model_.properties.length ; i++ ) {
      var prop = this[this.model_.properties[i].name];
      var code = ! prop ? 0 :
        prop.hashCode   ? prop.hashCode()
                        : prop.toString().hashCode();

      hash = ((hash << 5) - hash) + code;
      hash &= hash;
    }

    return hash;
  }],
  ['FObject', 'Method', function clone() {
    var c = Object.create(this.__proto__);
    c.instance_ = {};
    for ( var key in this.instance_ ) {
      var value = this[key];
      c[key] = Array.isArray(value) ? value.clone() : value;
    }
    return c;
    //    return ( this.model_ && this.model_.create ) ? this.model_.create(this) : this;
  }],
  ['FObject', 'Method', function deepClone() {
    var cln = this.clone();

    // now clone inner collections
    for ( var key in cln.instance_ ) {
      var val = cln.instance_[key];

      if ( Array.isArray(val) ) {
        for ( var i = 0 ; i < val.length ; i++ ) {
          var obj = val[i];

          obj = obj.deepClone();
        }
      }
    }

    return cln;
  }],
  ['FObject', 'Method', function output(out) {
    return JSONUtil.output(out, this);
  }],
  ['FObject', 'Method', function toJSON() {
    return JSONUtil.stringify(this);
  }],
  ['FObject', 'Method', function toXML() {
    return XMLUtil.stringify(this);
  }],
  ['FObject', 'Method', function write(document) {
    var view = DetailView.create({model: this.model_, showActions: true});

    document.writeln(view.toHTML());
    view.value.set(this);
    view.initHTML();
  }],

  ['Property', 'Property', { name: 'defaultValue' }],
  ['Property', 'Property', { name: 'factory' }],
  ['Property', 'Property', { name: 'scope', defaultValue: 'instance_' }],
  ['Property', 'Property', { name: 'defaultValueFn' }],
  ['Property', 'Property', { name: 'scopeName' }],
  ['Property', 'Property', { name: 'postSet' }],
  ['Property', 'Property', { name: 'preSet' }],
  ['Property', 'Property', { name: 'getter' }],
  ['Property', 'Property', { name: 'setter' }],
  ['Property', 'Method', function install(model, proto, prototype) {
    var prop = this;

    var parent = model.extendsModel;
    if ( parent && (parent = get(parent)) ) {
      var superProp = parent.getProperty(this.name);
      if ( superProp ) {
        prop = superProp.clone().copyFrom(prop);
      }
    }

    var scope = prop.scope || 'instance_';
    var scopeName = prop.scopeName || prop.name;
    var name = prop.name;
    var defaultValueFn = prop.defaultValueFn;
    var defaultValue = prop.defaultValue;
    var factory = prop.factory;
    var preSet = prop.preSet;
    var postSet = prop.postSet;

    // TODO: add caching?
    if ( ! prototype.__lookupGetter__(name + '$') ) {
      proto.define(name + '$', {
        configurable: true,
        get: function() { return this.propertyValue(name); },
        set: function(value) { Events.link(value, this.propertyValue(name)); }
      });
    }

    model.define(scopeName.constantize(), {
      value: prop,
      writable: true
    });

    var definition = {};
    if ( prop.getter ) {
      definition.get = prop.getter;
    } else {
      var get = defaultValueFn ? (function() {
        if ( this[scope][scopeName] === undefined ) {
          if ( factory ) return this[scope][scopeName] = factory.call(this);
          return defaultValueFn.call(this, prop);
        }
        return this[scope][scopeName];
      }) : (function() {
        if ( this[scope][scopeName] === undefined ) {
          if ( factory ) return this[scope][scopeName] = factory.call(this);
          return defaultValue;
        }
        return this[scope][scopeName]
      });

      definition.get = (function(get) {
        var stack = Events.onGet.stack;
        return function() {
          var value = get.call(this);
          var f = stack[0];
          f && f(this, name, value);
          return value;
        };
      })(get);
    }

    if ( prop.setter ) {
      definition.set = prop.setter;
    } else {
      var set = function(oldValue, newValue) {
        this.instance_[name] = newValue;
      };

      if ( prop.type === 'int' || prop.type === 'float' ) {
        set = (function(set) { return function(oldValue, newValue) {
          set.call(this, oldValue, typeof newValue !== 'number' ? Number(newValue) : newValue);
        }; })(set);
      }

      if ( prop.postSet ) {
        set = (function(set, postSet) { return function(oldValue, newValue) {
          set.call(this, oldValue, newValue);
          postSet.call(this, oldValue, newValue)
        }; })(set, prop.postSet);
      }

      var propertyTopic = PropertyChangeSupport.propertyTopic(name);
      set = (function(set) { return function(oldValue, newValue) {
        set.call(this, oldValue, newValue);
        this.propertyChange_(propertyTopic, oldValue, newValue);
      }; })(set);

      if ( prop.preSet ) {
        set = (function(set, preSet) { return function(oldValue, newValue) {
          set.call(this, oldValue, preSet.call(this, oldValue, newValue, prop));
        }; })(set, prop.preSet);
      }

      set = (function(set) { return function(newValue) {
        set.call(this, this[name], newValue);
      }; })(set);

      set = (function(set) {
        var stack = Events.onSet.stack;
        return function(newValue) {
          var f = stack[0];
          if ( f && ! f(this, name, newValue) ) return;
          set.call(this, newValue);
        };
      })(set);

      definition.set = set;
    }

    proto.define(name, definition);

    if ( scope === "static_" && prop.factory ) {
      prototype[prop.name] = prop.factory();
    }
  }],

  ['Model', 'Property', {
    name: 'ids',
    type: 'Array',
    subType: 'String',
    defaultValueFn: function() {
      var prop;
      this.features.forEach(function(f) {
        if ( !prop && Property.isInstance(f) ) {
          prop = f;
        }
      });
      return prop ? [prop.name] : [];
    }
  }],

  [null, 'Model', {
    name: 'IdFeature'
  }],
  ['IdFeature', 'Method', function install(model, proto, prototype) {
    proto.define('id', trampoline('id', function() {
      var primaryKey = this.model_.ids;

      if ( primaryKey.length === 0 ) return [];

      if ( primaryKey.length === 1 ) {
        return {
          get: function() { return this[primaryKey[0]]; },
          set: function(val) { this[primaryKey[0]] = val; }
        };
      } else if (primaryKey.length > 1) {
        return {
          get: function() {
            return primaryKey.map(function(key) { return this[key]; });
          },
          set: function(val) {
            primaryKey.map(function(key, i) { this[key] = val[i]; });
          }
        };
      }
    }));
  }],
  ['FObject', 'IdFeature'],
  [null, 'Model', { name: 'ContextFeature' }],
  ['ContextFeature', 'Method', function install(model, proto) {
    proto.define('X', {
      value: X,
      writable: true
    });
  }],
  ['FObject', 'ContextFeature'],

  [null, 'Model', { name: 'Constant' }],
  ['Constant', 'Property', { name: 'name' }],
  ['Constant', 'Property', { name: 'value' }],
  ['Constant', 'Method', function install(model, proto) {
    var value = this.value;
    proto.define(this.name, {
      enumerable: true,
      get: function(v) { return value; },
      set: function(v) {
        console.warn('Changing constant value');
        value = v;
      }
    });
  }],

  ['Extends', 'Method', function create(args) {
    if ( typeof args === "string" ) return this.SUPER({ parent: args });
    return this.SUPER(args);
  }],
/*  [null, 'Model', { name: 'Extends' }],
  ['Extends', 'Property', { name: 'parent' }],
  ['Extends', 'Method', function install(model, proto) {
    var parent = get(this.parent);
    proto.__proto__ = parent.getPrototype();
    model.features.parent = parent.features;

    // TODO: Is this correct?
    model.__proto__ = parent;
  }],*/

  ['Property', 'Method', function f(obj) { return obj[this.name] || obj; }],
  ['Property', 'Property', {
    name: 'label'
  }],
  ['Property', 'Property', {
    name: 'tableLabel'
  }],
  ['Property', 'Property', {
    name: 'type'
  }],
  ['Property', 'Property', {
    name: 'javaType',
    defaultValueFn: function() { return this.type; }
  }],
  ['Property', 'Property', {
    name: 'javascriptType',
    defaultValueFn: function() { return this.type; }
  }],
  ['Property', 'Property', {
    name: 'shortName'
  }],
  ['Property', 'Property', {
    name: 'aliases',
    factory: function() { return []; }
  }],
  ['Property', 'Property', {
    name: 'mode',
    defaultValue: 'read-write'
  }],
  ['Property', 'Property', {
    name: 'subType'
  }],
  ['Property', 'Property', {
    name: 'units'
  }],
  ['Property', 'Property', {
    name: 'required',
    defaultValue: true
  }],
  ['Property', 'Property', {
    name: 'hidden',
    defaultValue: false
  }],
  ['Property', 'Property', {
    name: 'transient',
    defaultValue: false
  }],
  ['Property', 'Property', {
    name: 'displayWidth',
    defaultValue: 30
  }],
  ['Property', 'Property', {
    name: 'displayHeight',
    defaultvalue: 1
  }],
  ['Property', 'Property', {
    name: 'view',
    defaultValue: 'foam.ui.TextFieldView'
  }],
  ['Property', 'Property', {
    name: 'detailViewPreRow',
    defaultValue: function() { return ""; }
  }],
  ['Property', 'Property', {
    name: 'defaultViewPostRow',
    defaultValue: function() { return ""; }
  }],
  ['Property', 'Property', {
    name: 'tableFormatter'
  }],
  ['Property', 'Property', {
    name: 'summaryFormatter'
  }],
  ['Property', 'Property', {
    name: 'tableWidth'
  }],
  ['Property', 'Property', {
    name: 'prototag'
  }],
  ['Property', 'Property', {
    name: 'actionFactory'
  }],
  ['Property', 'Property', {
    name: 'compareProperty',
    defaultValue: function(o1, o2) {
      return (o1.localeCompare || o1.compareTo).call(o1, o2);
    }
  }],
  ['Property', 'Method', function compare(o1, o2) {
    return this.compareProperty(this.f(o1), this.f(o2));
  }],
  ['Property', 'Method', function toSQL() {
    return this.name;
  }],
  ['Property', 'Method', function toMQL() {
    return this.name;
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
  ['Model', 'StringProperty', {
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

  [null, 'Model', { name: 'IntProperty' }],
  ['IntProperty', 'Extends', 'Property'],
  ['IntProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'Int'
  }],
  ['IntProperty', 'StringProperty', {
    name: 'javaType',
    defaultValue: 'int'
  }],
  ['IntProperty', 'IntProperty', {
    name: 'defaultValue',
    defaultValue: 0
  }],
  ['Property', 'IntProperty', {
    name: 'displayWidth',
    defaultValue: 30,
    help: 'The display width of the property.'
  }],
  ['Property', 'IntProperty', {
    name: 'displayHeight',
    defaultValue: 1,
    help: 'The display height of the property.'
  }],
  ['IntProperty', 'IntProperty', {
    name: 'displayWidth',
    defaultValue: 8
  }],
  ['StringProperty', 'IntProperty', {
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
  ['BooleanProperty', 'StringProperty', {
    name: 'view',
    defaultValue: 'foam.ui.BooleanView'
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
    name: 'factory',
    help: 'Factory for creating inital value when object instantiated.'
  }],

  ['FunctionProperty', 'StringProperty', {
    name: 'type',
    defaultValue: 'Function'
  }],
  ['FunctionProperty', 'StringProperty', {
    name: 'view',
    defaultValue: 'foam.ui.FunctionView'
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
    defaultValue: function(oldValue, value, prop) {
      var m = get(prop.subType);

      if ( ! m || ! m.model_ ) {
        return value;
      }

      for ( var i = 0; i < value.length; i++ ) {
        value[i] = value[i].model_ ? FOAM(value[i]) : m.create(value[i]);
      }
      return value;
    }
  }],
  ['ArrayProperty', 'StringProperty', {
    name: 'javaType',
    defaultValueFn: function(p) { return p.subType + '[]'; }
  }],
  ['ArrayProperty', 'StringProperty', {
    name: 'view',
    defaultvlaue: 'foam.ui.ArrayView'
  }],
  ['ArrayProperty', 'FunctionProperty', {
    name: 'factory',
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
    defaultValue: 'foam.ui.TextFieldView'
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
    defaultValue: 'foam.ui.StringArrayView'
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
    defaultValue: 'foam.ui.DateTimeFieldView'
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
  ['FloatProperty', 'IntProperty', {
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

  ['Model', 'StringProperty', {
    name: 'label',
    defaultValueFn: function() { return this.name.labelize(); }
  }],
  ['Model', 'StringProperty', {
    name: 'plural',
    help: 'The plural form of this model\'s name.',
    defaultValueFn: function() { return this.name + 's'; }
  }],

  // mm4Methods
  [null, 'Model', {
    name: 'Action'
  }],
  ['Action', 'StringProperty', {
    name: 'name',
    help: 'The coding identifier for the action.',
  }],
  ['Action', 'StringProperty', {
    name: 'label',
    help: 'The display label for the action.',
    defaultValueFn: function() { return this.name.labelize(); }
  }],
  ['Action', 'StringProperty', {
    name: 'help',
    label: 'Help Text',
    help: 'Help text associated with the action.'
  }],
  ['Action', 'BooleanProperty', {
    name: 'default',
    defaultValue: false,
    help: 'Indicates if this is the default action.'
  }],
  ['Action', 'FunctionProperty', {
    name: 'isAvailable',
    label: 'Available',
    defaultValue: function() { return true; },
    help: 'Function to determine if action is enabled.'
  }],
  ['Action', 'FunctionProperty', {
    name: 'isEnabled',
    label: 'Enabled',
    defaultValue: function() { return true; },
    help: 'Function to determine if action is enabled'
  }],
  ['Action', 'FunctionProperty', {
    name: 'labelFn',
    label: 'Label Function',
    defaultValue: function(action) { return action.label; },
    help: "Function to determine label. Defaults to 'this.label'."
  }],
  ['Action', 'URLProperty', {
    name: 'iconUrl',
    defaultValue: undefined,
    help: 'Provides a url for an icon to render for this action.'
  }],
  ['Action', 'BooleanProperty', {
    name: 'showLabel',
    defaultValue: true,
    help: 'Property indicating whether the label should be rendered along side the icon.'
  }],
  ['Action', 'ArrayProperty', {
    name: 'children',
    subType: 'Action',
    help: 'Child actions of this action.',
    persistent: false
  }],
  ['Action', 'ReferenceProperty', {
    name: 'parent',
    help: 'The parent action of this action.'
  }],
  ['Action', 'FunctionProperty', {
    name: 'action',
    displayWidth: 80,
    displayHeight: 20,
    help: 'Function to implement action.',
  }],
  ['Action', 'Method', function maybeCall(that) {
    if ( this.isEnabled.call(that) ) this.action.call(that, this);
  }],
  ['Action', 'Method', function install(model, proto) {
    var a = this;
    proto.define(this.name, {
      value: function() { a.maybeCall(this); },
      writable: true
    });
    model.define(this.name.constantize(), {
      value: this,
      writable: true
    });
  }],

  [null, 'Model', { name: 'Arg' }],
  ['Arg', 'Property', {
    name:  'type',
    type:  'String',
    required: true,
    displayWidth: 30,
    displayHeight: 1,
    defaultValue: 'Object',
    help: 'The type of this argument.'
  }],
  ['Arg', 'Property', {
    name: 'javaType',
    type: 'String',
    required: false,
    defaultValueFn: function() { return this.type; },
    help: 'The java type that represents the type of this property.'
  }],
  ['Arg', 'Property', {
    name: 'javascriptType',
    type: 'String',
    required: false,
    defaultValueFn: function() { return this.type; },
    help: 'The javascript type that represents the type of this property.'
  }],
  ['Arg', 'Property', {
    name:  'name',
    type:  'String',
    required: true,
    displayWidth: 30,
    displayHeight: 1,
    defaultValue: '',
    help: 'The coding identifier for the entity.'
  }],
  ['Arg', 'Property', {
    type: 'Boolean',
    name: 'required',
    defaultValue: true
  }],
  ['Arg', 'Property', {
    name: 'defaultValue',
    help: 'Default Value if not required and not provided.'
  }],
  ['Arg', 'Property', {
    name: 'description',
    type: 'String',
    displayWidth: 70,
    displayHeight: 1,
    defaultValue: '',
    help: 'A brief description of this topic.'
  }],
  ['Arg', 'Property', {
    name: 'help',
    label: 'Help Text',
    type: 'String',
    displayWidth: 70,
    displayHeight: 6,
    defaultValue: '',
    help: 'Help text associated with the entity.'
  }],
  ['Arg', 'Method', function decorateFunction(f, i) {
    if ( this.type === 'Object' ) return f;
    var type = this.type;

    return this.required ?
      function() {
        if ( arguments[i] === undefined ) {
          console.assert(false, 'Missing required argument# ' + i);
          debugger;
        }
        if ( typeof arguments[i] !== type ) {
          console.assert(false,  'argument# ' + i + ' type expected to be ' + type + ', but was ' + (typeof arguments[i]) + ': ' + arguments[i]);
          debugger;
        }

        return f.apply(this, arguments);
      } :
    function() {
      if ( arguments[i] !== undefined && typeof arguments[i] !== type ) {
        console.assert(false,  'argument# ' + i + ' type expected to be ' + type + ', but was ' + (typeof arguments[i]) + ': ' + arguments[i]);
        debugger;
      }

      return f.apply(this, arguments);
    } ;
  }],

  [null, 'Model', {
    name: 'Listener'
  }],
  ['Listener', 'Extends', 'Method'],
  ['Listener', 'Property', {
    name: 'isMerged',
    help: 'Should this listener be merged?'
  }],
  ['Listener', 'BooleanProperty', {
    name: 'isFramed',
    help: 'As a listener, should this be animated?',
    defaultValue: false
  }],
  ['Listener', 'Method', function install(model, proto) {
    var name = this.name;
    var fn = this.code;
    var isFramed = this.isFramed;
    var isMerged = this.isMerged;

    proto.define(name, trampoline(name, function() {
      var l = fn.bind(this);
      if ( isFramed )
        l = EventService.framed(l);
      else if ( isMerged )
        l = EventService.merged(l, (isMerged === true) ? undefined : isMerged);

      return {
        value: l,
        writable: true
      };
    }));
  }],

  [null, 'Model', {
    name: 'Template',
    tableProperties: [
      'name', 'description'
    ]
  }],
  ['Template', 'Property', {
    name:  'name',
    type:  'String',
    required: true,
    displayWidth: 30,
    displayHeight: 1,
    defaultValue: '',
    help: 'The template\'s unique name.'
  }],
  ['Template', 'Property', {
    name:  'description',
    type:  'String',
    required: true,
    displayWidth: 70,
    displayHeight: 1,
    defaultValue: '',
    help: 'The template\'s unique name.'
  }],
  ['Template', 'Property', {
    name: 'template',
    type: 'String',
    displayWidth: 180,
    displayHeight: 30,
    rows: 30, cols: 80,
    defaultValue: '',
    view: 'foam.ui.TextAreaView',
    help: 'Template text. <%= expr %> or <% out(...); %>'
  }],
  /*['Template', 'Property', {
    name: 'templates',
    type: 'Array[Template]',
    subType: 'Template',
    view: 'foam.ui.ArrayView',
    help: 'Sub-templates of this template.'
    }]*/
  ['Template', 'Method', function install(model, proto, prototype) {
    var t = this;
    if ( ! t.template ) {
      var future = afuture();
      t.futureTemplate = future.get;
      var path = document.currentScript.src;
      path = path.substring(0, path.lastIndexOf('/') + 1);
      path += prototype.name_ + '_' + t.name + '.ft';
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path);
      xhr.asend(function(data) {
        t.template = data;
        future.set(data);
        t.futureTemplate = undefined;
      });
    }

    var code = TemplateUtil.lazyCompile(this);
    if ( prototype.__proto__[this.name] ) {
      code = override(proto, this.name, code);
    }
    proto.addMethod(this.name, code);
  }],
  // Model pseudo-properties for backwards compatability.
  ['Model', 'Property', {
    name: 'properties',
    getter: function() {
      if ( ! Object.prototype.hasOwnProperty.call(this, 'properties_') ||
           ! this.properties_ ) {
        var props = this.properties_ = [];
        this.features.forEach(function(f) {
          if ( Property.isInstance(f) ) { props.push(f); }
        });
      }
      return this.properties_;
    },
    setter: function(value) {
      this.properties_ = null;
      for ( var i = 0; i < value.length; i++ ) {
        if ( ! Property.isInstance(value[i]) )
          value[i] = Property.create(value[i]);
        this.addFeature(value[i]);
      }
    }
  }],
  ['Model', 'Property', {
    name: 'extendsModel',
    getter: function() {
      var value;
      this.features.localForEach(function(f) {
        if ( Extends.isInstance(f) ) value = f.parent;
      });
      return value;
    },
    setter: function(value) {
      var feature = Extends.create({ parent: value });
      this.addFeature(feature);
    }
  }],
  ['Model', 'Property', {
    name: 'methods',
    getter: function() {
      var ret = [];
      this.features.localForEach(function(f) {
        if ( Method.isInstance(f) ) { ret.push(f); }
      });
      return ret;
    },
    setter: function(methods) {
      if ( Array.isArray(methods) ) {
        for ( var i = 0; i < methods.length; i++ ) {
          if ( ! Method.isInstance(methods[i]) )
            methods[i] = Method.create(methods[i]);
          this.addFeature(methods[i]);
        }
      } else {
        for ( var method in methods ) {
          var m = Method.create({
            name: method,
            code: methods[method]
          });
          this.addFeature(m);
        }
      }
    }
  }],
  ['Model', 'Property', {
    name: 'listeners',
    getter: function() {
      var ret = [];
      this.features.forEach(function(f) {
        if ( Listener.isInstance(f) ) { ret.push(f); }
      });
      return ret;
    },
    setter: function(listeners) {
      if ( Array.isArray(listeners) ) {
        for ( var i = 0; i < listeners.length; i++ ) {
          if ( ! Listener.isInstance(listeners[i]) )
            listeners[i] = Listener.create(listeners[i]);
          this.addFeature(listeners[i]);
        }
      } else {
        for ( var method in listeners ) {
          var m = Listener.create({
            name: method,
            code: listeners[method]
          });
          this.addFeature(m);
        }
      }
    }
  }],
  ['Model', 'StringArrayProperty', {
    name: 'tableProperties',
    factory: function() {
      return this.properties.map(Property.NAME.f.bind(Property.NAME));
    }
  }],
  ['Model', 'StringArrayProperty', {
    name: 'searchProperties',
    defaultValueFn: function() {
      return this.tableProperties;
    },
    help: 'Properties display in a search view. Defaults to table properties.'
  }],
  ['Model', 'Property', {
    name: 'actions',
    type: 'Array',
    subType: 'Action',
    getter: function() {
      var ret = [];
      // TODO sould this be a local forEach?
      this.features.localForEach(function(f) {
        if ( Action.isInstance(f) ) ret.push(f);
      });
      return ret;
    },
    setter: function(value) {
      for ( var i = 0; i < value.length; i++ ) {
        if ( ! Action.isInstance(value[i]) )
          value[i] = Action.create(value[i]);
        this.addFeature(value[i]);
      }
    }
  }],
  ['Model', 'ArrayProperty', {
    name: 'models',
    subType: 'Model',
    getter: function() {
      var ret = [];
      // TODO sould this be a local forEach?
      this.features.localForEach(function(f) {
        if ( Model.isInstance(f) ) ret.push(f);
      });
      return ret;
    },
    setter: function(value) {
      for ( var i = 0; i < value.length; i++ ) {
        if ( ! Model.isInstance(value[i]) )
          value[i] = Model.create(value[i]);
        this.addFeature(value[i]);
      }
    }
  }],
  ['Model', 'ArrayProperty', {
    name: 'templates',
    subType: 'Template',
    view: 'foam.ui.ArrayView',
    getter: function() {
      var ret = [];
      // TODO sould this be a local forEach?
      this.features.localForEach(function(f) {
        if ( Template.isInstance(f) ) ret.push(f);
      });
      return ret;
    },
    setter: function(value) {
      for ( var i = 0; i < value.length; i++ ) {
        if ( ! Template.isInstance(value[i]) )
          value[i] = Template.create(value[i]);
        this.addFeature(value[i]);
      }
    }
  }],
];

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
//    if (f[3]) debugger;

    var model = lookup(f[0], scope);
    if ( ! model ) throw "Model not found: " + f[0];

    var feature = lookup(f[1], scope);
    if ( !feature ) throw "Feature not found: " + f[1];

    var args = f[2];
    var feature = feature.create(args);
    model.addFeature(feature);
  }
}

(function() {
  var scope = window;
  scope.set = function(key, value) { this[key] = value; };
  scope.get = function(key) { return this[key]; };
  scope.features = FeatureSet.create();
  bootstrap(scope);
  build(scope, featureDAO);
})();
