/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
 * Prototype for original proto-Models.
 * Used during bootstrapping to create the real Model
 * and PropertyModel.
 *
 * TODO: The handling of the various property types (properties,
 *   templates, listeners, etc.) shouldn't be handled here because
 *   it isn't extensible.  The handling should be defined in the
 *   properties property (so meta).
 *
 * TODO: Is still used by a few views in view.js.  Those views
 * should be fixed and then BootstrapModel should be deleted at
 * the end of metamodel.js once the real Model is created.
 **/

function defineLocalProperty(cls, name, factory) {
  Object.defineProperty(cls, name, { get: function() {
    console.assert(this !== cls, 'Called property getter from prototype: ' + name);
    var value = factory.call(this);
    Object.defineProperty(this, name, { configurable: true, value: value });
    return value;
  }, configurable: true });
}

this.Constant = null;
this.Method = null;
this.Action = null;
this.Relationship = null;

/**
 * Override a method, making calling the overridden method possible by
 * calling this.SUPER();
 **/
var CCC = 0;
function override(cls, methodName, method) {
  var super_ = cls[methodName];

  // No need to decorate if SUPER not called
  if ( method.toString().indexOf('SUPER') == -1 ) {
    cls[methodName] = method;
    return;
  }

  var SUPER = function() { return super_.apply(this, arguments); };

  var slowF = function(OLD_SUPER, args) {
    try {
      return method.apply(this, args);
    } finally {
      this.SUPER = OLD_SUPER;
    }
  };
  var f = function() {
    var OLD_SUPER = this.SUPER;
    this.SUPER = SUPER;

    if ( OLD_SUPER ) return slowF.call(this, OLD_SUPER, arguments);

    // Fast-Path when it doesn't matter if we restore SUPER or not
    var ret = method.apply(this, arguments);
    this.SUPER = null;
    return ret;
  };
  f.toString = function() { return method.toString(); };
  f.super_ = super_;

  cls[methodName] = f;
}


var BootstrapModel = {

  __proto__: PropertyChangeSupport,

  name_: 'BootstrapModel <startup only, error if you see this>',

  addTraitToModel_: function(traitModel, parentModel) {
    var parentName = parentModel && parentModel.id ? parentModel.id.replace(/\./g, '__') : '';
    var traitName  = traitModel.id ? traitModel.id.replace(/\./g, '__') : '';
    var name       = parentName + '_ExtendedWith_' + traitName;

    if ( ! lookup(name) ) {
      var models = traitModel.models;
      traitModel = traitModel.clone();
      traitModel.package = '';
      traitModel.name = name;
      traitModel.extends = parentModel && parentModel.id;
      traitModel.models = models; // unclone sub-models, we don't want multiple copies of them floating around
      traitModel.X.registerModel(traitModel);
    }

    var ret = traitModel.X.lookup(name);
    console.assert(ret, 'Error adding Trait to Model, unknown name: ', name);
    return ret;
  },

  createMethod_: function(X, name, fn) {
    var method = Method.create({
      name: name,
      code: fn
    });

    if ( FEATURE_ENABLED(['debug']) && Arg ) {
      var str = fn.toString();
      var match = str.match(/^function[ _$\w]*\(([ ,\w]+)/);
      if ( match )
        method.args = match[1].split(',').
        map(function(name) { return Arg.create({name: name.trim()}); });
    }

    return method;
  },

  buildProtoImports_: function(props) {
    // build imports as psedo-properties
    Object_forEach(this.instance_.imports_, function(i) {
      var imp   = i.split(' as ');
      var key   = imp[0];
      var alias = imp[1] || imp[0];

      if ( alias.length && alias.charAt(alias.length-1) == '$' )
        alias = alias.slice(0, alias.length-1);

      if ( ! this.getProperty(alias) ) {
        // Prevent imports from being cloned.
        var prop = ImportedProperty.create({ name: alias });
        props.push(prop);
      }
    }.bind(this));
  },

  buildProtoProperties_: function(cls, extendsModel, props) {
    // build properties
    for ( var i = 0 ; i < props.length ; i++ ) {
      var p = props[i];
      if ( extendsModel ) {
        var superProp = extendsModel.getProperty(p.name);
        if ( superProp ) {
          var p0 = p;
          p = superProp.clone().copyFrom(p);
          // A more elegant way to do this would be to have a ModelProperty
          // which has a ModelPropertyProperty called 'reduceWithSuper'.
          if ( p0.adapt && superProp.adapt ) {
//            console.log('(DEBUG) sub adapt: ', this.name + '.' + p.name);
            p.adapt = (function(a1, a2) { return function(oldValue, newValue, prop) {
              return a2.call(this, oldValue, a1.call(this, oldValue, newValue, prop), prop);
            };})(p0.adapt, superProp.adapt);
          }
          if ( p0.preSet && superProp.preSet ) {
//            console.log('(DEBUG) sub preSet: ', this.name + '.' + p.name);
            p.preSet = (function(a1, a2) { return function(oldValue, newValue, prop) {
              return a2.call(this, oldValue, a1.call(this, oldValue, newValue, prop), prop);
            };})(p0.preSet, superProp.preSet);
          }
          if ( p0.postSet && superProp.postSet ) {
//            console.log('(DEBUG) sub postSet: ', this.name + '.' + p.name);
            p.postSet = (function(a1, a2) { return function(oldValue, newValue, prop) {
              a2.call(this, oldValue, newValue, prop);
              a1.call(this, oldValue, newValue, prop);
            };})(p0.postSet, superProp.postSet);
          }
          props[i] = p;
          this[constantize(p.name)] = p;
        }
      }
      cls.defineProperty(p);
    }
    this.propertyMap_ = null;
  },

  buildProtoMethods_: function(cls) {
    if ( Array.isArray(this.methods) ) {
      for ( var i = 0 ; i < this.methods.length ; i++ ) {
        var m = this.methods[i];
        if ( typeof m == "function" ) {
          cls.addMethod(m.name, m);
        } else {
          cls.addMethod(m.name, m.code);
        }
      }
    } else {
      // add methods
      for ( key in this.methods ) {
        var m = this.methods[key];
        if ( Method && Method.isInstance(m) ) {
          cls.addMethod(m.name, m.generateFunction());
        } else {
          cls.addMethod(key, m);
        }
      }
    }
  },

  buildPrototype: function() { /* Internal use only. */
    // save our pure state
    // Note: Only documentation browser uses this, and it will be replaced
    // by the new Feature Oriented bootstrapping process, so only use the
    // extra memory in DEBUG mode.
    if ( _DOC_ ) BootstrapModel.saveDefinition(this);

    if ( this.extends && ! this.X.lookup(this.extends) ) throw new Error('Unknown Model in extends: ' + this.extends);

    var extendsModel = this.extends && this.X.lookup(this.extends);

    if ( this.traits ) for ( var i = 0 ; i < this.traits.length ; i++ ) {
      var trait      = this.traits[i];
      var traitModel = this.X.lookup(trait);

      console.assert(traitModel, 'Unknown trait: ' + trait);

      if ( traitModel ) {
        extendsModel = this.addTraitToModel_(traitModel, extendsModel);
      } else {
        console.warn('Missing trait: ', trait, ', in Model: ', this.name);
      }
    }

    var proto  = extendsModel ? extendsModel.getPrototype() : FObject;
    var cls    = Object.create(proto);

    cls.model_ = this;
    cls.name_  = this.name;

    // Install a custom constructor so that Objects are named properly
    // in the JS memory profiler.
    // Doesn't work for Model because of some Bootstrap ordering issues.
    /*
    if ( this.name && this.name !== 'Model' && ! ( window.chrome && chrome.runtime && chrome.runtime.id ) ) {
      var s = '(function() { var XXX = function() { }; XXX.prototype = this; return function() { return new XXX(); }; })'.replace(/XXX/g, this.name);
      try { cls.create_ = eval(s).call(cls); } catch (e) { }
    }*/

    // add sub-models
    //        this.models && this.models.forEach(function(m) {
    //          cls[m.name] = JSONUtil.mapToObj(m);
    //        });
    // Workaround for crbug.com/258552
    this.models && Object_forEach(this.models, function(m) {
      if ( this[m.name] ) {
        var model = this[m.name];
        defineLocalProperty(cls, m.name, function() {
          var Y = this.Y;
          return {
            __proto__: model,
            create: function(args, opt_X) {
              return model.create(args, opt_X || Y);
            }
          };
        });
      }
    }.bind(this));

    // build requires
    Object_forEach(this.requires, function(i) {
      var imp  = i.split(' as ');
      var m    = imp[0];
      var path = m.split('.');
      var key  = imp[1] || path[path.length-1];

      defineLocalProperty(cls, key, function() {
        var Y     = this.Y;
        var model = this.X.lookup(m);
        console.assert(model, 'Unknown Model: ' + m + ' in ' + this.name_);
        return {
          __proto__: model,
          create: function(args, X) { return model.create(args, X || Y); }
        };
      });
    });

    var props = this.instance_.properties_ = this.properties ? this.properties.clone() : [];

    this.instance_.imports_ = this.imports;
    if ( extendsModel ) this.instance_.imports_ = this.instance_.imports_.concat(extendsModel.instance_.imports_);

    this.buildProtoImports_(props);
    this.buildProtoProperties_(cls, extendsModel, props);

    // Copy parent Model's Property and Relationship Contants to this Model.
    if ( extendsModel ) {
      for ( var i = 0 ; i < extendsModel.instance_.properties_.length ; i++ ) {
        var p = extendsModel.instance_.properties_[i];
        var name = constantize(p.name);

        if ( ! this[name] ) this[name] = p;
      }
      for ( i = 0 ; i < extendsModel.relationships.length ; i++ ) {
        var r = extendsModel.relationships[i];
        var name = constantize(r.name);

        if ( ! this[name] ) this[name] = r;
      }
    }

    // Handle 'exports'
    this.instance_.exports_ = this.exports ? this.exports.clone() : [];
    if ( extendsModel ) this.instance_.exports_ = this.instance_.exports_.concat(extendsModel.instance_.exports_);

    // templates
    this.templates && Object_forEach(this.templates, function(t) {
      cls.addMethod(t.name, t.code ? t.code : TemplateUtil.lazyCompile(t));
    });

    // add actions
    this.instance_.actions_ = this.actions ? this.actions.clone() : [];
    if ( this.actions ) {
      for ( var i = 0 ; i < this.actions.length ; i++ ) {
        (function(a) {
          if ( extendsModel ) {
            var superAction = extendsModel.getAction(a.name);
            if ( superAction ) {
              a = superAction.clone().copyFrom(a);
            }
          }
          this.instance_.actions_[i] = a;
          if ( ! Object.prototype.hasOwnProperty.call(cls, constantize(a.name)) )
            cls[constantize(a.name)] = a;
          this[constantize(a.name)] = a;
          cls.addMethod(a.name, function(opt_x) { a.maybeCall(opt_x || this.X, this); });
        }.bind(this))(this.actions[i]);
      }
    }

    var key;

    // add constants
    if ( this.constants ) {
      for ( var i = 0 ; i < this.constants.length ; i++ ) {
        var c = this.constants[i];
        cls[c.name] = this[c.name] = c.value;
      }
    }

    // add messages
    if ( this.messages && this.messages.length > 0 && GLOBAL.Message ) {
      Object_forEach(this.messages, function(m, key) {
        if ( ! Message.isInstance(m) ) {
          m = this.messages[key] = Message.create(m);
        }
        var clsProps = {}, mdlProps = {}, constName = constantize(m.name);
        clsProps[m.name] = { get: function() { return m.value; } };
        clsProps[constName] = { value: m };
        mdlProps[constName] = { value: m };
        Object.defineProperties(cls, clsProps);
        Object.defineProperties(this, mdlProps);
      }.bind(this));
    }

    this.buildProtoMethods_(cls);

    var self = this;
    // add relationships
    this.instance_.relationships_ = this.relationships;

    if ( extendsModel ) this.instance_.relationships_ = this.instance_.relationships_.concat(extendsModel.instance_.relationships_);

    this.relationships && this.relationships.forEach(function(r) {
      // console.log('************** rel: ', r, r.name, r.label, r.relatedModel, r.relatedProperty);

      var name = constantize(r.name);
      if ( ! self[name] ) self[name] = r;
      defineLazyProperty(cls, r.name, function() {
        var m = this.X.lookup(r.relatedModel);
        var name = daoize(m.name);
        var dao = this.X[name];
        if ( ! dao ) {
          console.error('Relationship ' + r.name + ' needs ' + name +
              ' in the context, and it was not found.');
        }

        dao = RelationshipDAO.create({
          delegate: dao,
          relatedProperty: m.getProperty(r.relatedProperty),
          relativeID: this.id
        });

        return {
          get: function() { return dao; },
          configurable: true
        };
      });
    });

    // TODO: move this somewhere better
    var createListenerTrampoline = function(cls, name, fn, isMerged, isFramed, whenIdle) {
      // bind a trampoline to the function which
      // re-binds a bound version of the function
      // when first called
      console.assert( fn, 'createListenerTrampoline: fn not defined');
      fn.name = name;

      Object.defineProperty(cls, name, {
        get: function () {
          var l = fn.bind(this);
          /*
          if ( ( isFramed || isMerged ) && this.X.isBackground ) {
            console.log('*********************** ', this.model_.name);
          }
          */
          if ( whenIdle ) l = Movement.whenIdle(l);

          if ( isFramed ) {
            l = EventService.framed(l, this.X);
          } else if ( isMerged ) {
            l = EventService.merged(
              l,
              (isMerged === true) ? undefined : isMerged, this.X);
          }

          Object.defineProperty(this, name, { configurable: true, value: l });

          return l;
        },
        configurable: true
      });
    };

    // add listeners
    if ( Array.isArray(this.listeners) ) {
      for ( var i = 0 ; i < this.listeners.length ; i++ ) {
        var l = this.listeners[i];
        createListenerTrampoline(cls, l.name, l.code, l.isMerged, l.isFramed, l.whenIdle);
      }
    } else if ( this.listeners ) {
      //          this.listeners.forEach(function(l, key) {
      // Workaround for crbug.com/258522
      Object_forEach(this.listeners, function(l, key) {
        createListenerTrampoline(cls, key, l);
      });
    }

    // add topics
    //        this.topics && this.topics.forEach(function(t) {
    // Workaround for crbug.com/258522
    this.topics && Object_forEach(this.topics, function(t) {
      // TODO: something
    });

    // copy parent model's properties and actions into this model
    if ( extendsModel ) {
      this.getProperty('');
      var ips = []; // inherited properties
      var ps  = extendsModel.instance_.properties_;
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var p = ps[i];
        if ( ! this.getProperty(p.name) ) {
          ips.push(p);
          this.propertyMap_[p.name] = p;
        }
      }
      if ( ips.length ) {
        this.instance_.properties_ = ips.concat(this.instance_.properties_);
      }

      var ias = [];
      var as = extendsModel.instance_.actions_;
      for ( var i = 0 ; i < as.length ; i++ ) {
        var a = as[i];
        if ( ! ( this.getAction && this.getAction(a.name) ) )
          ias.push(a);
      }
      if ( ias.length ) {
        this.instance_.actions_ = ias.concat(this.instance_.actions_);
      }
    }

    // build primary key getter and setter
    if ( this.instance_.properties_.length > 0 && ! cls.__lookupGetter__('id') ) {
      var primaryKey = this.ids;

      if ( primaryKey.length == 1 ) {
        cls.__defineGetter__('id', function() { return this[primaryKey[0]]; });
        cls.__defineSetter__('id', function(val) { this[primaryKey[0]] = val; });
      } else if (primaryKey.length > 1) {
        cls.__defineGetter__('id', function() {
          return primaryKey.map(function(key) { return this[key]; }.bind(this)); });
        cls.__defineSetter__('id', function(val) {
          primaryKey.map(function(key, i) { this[key] = val[i]; }.bind(this)); });
      }
    }

    return cls;
  },

  // ???(kgr): Who uses this?  If it's the build tool, then better putting it there.
  getAllRequires: function() {
    var requires = {};
    this.requires.forEach(function(r) { requires[r.split(' ')[0]] = true; });
    this.traits.forEach(function(t) { requires[t] = true; });
    if ( this.extends ) requires[this.extends] = true;

    function setModel(o) { if ( o && o.model_ ) requires[o.model_.id] = true; }

    this.properties.forEach(setModel);
    this.actions.forEach(setModel);
    this.templates.forEach(setModel);
    this.listeners.forEach(setModel);

    return Object.keys(requires);
  },

  getPrototype: function() { /* Returns the definition $$DOC{ref:'Model'} of this instance. */
    if ( ! this.instance_.prototype_ ) {
      this.instance_.prototype_ = this.buildPrototype();
      this.onLoad && this.onLoad();
    }

    return this.instance_.prototype_;
  },

  saveDefinition: function(self) {
    self.definition_ = {};
    // TODO: introspect Model, copy the other non-array properties of Model
    // DocumentationBootstrap's getter gets called here, which causes a .create() and an infinite loop
//       Model.properties.forEach(function(prop) {
//         var propVal = self[prop.name];
//         if (propVal) {
//           if (Array.isArray(propVal)) {
//             // force array copy, so we don't share changes made later
//             self.definition_[prop.name] = [].concat(propVal);
//           } else {
//             self.definition_[prop.name] = propVal;
//           }
//         }
//       }.bind(self));

    // TODO: remove these once the above loop works
    // clone feature lists to avoid sharing the reference in the copy and original
    if (Array.isArray(self.methods))       self.definition_.methods       = [].concat(self.methods);
    if (Array.isArray(self.templates))     self.definition_.templates     = [].concat(self.templates);
    if (Array.isArray(self.relationships)) self.definition_.relationships = [].concat(self.relationships);
    if (Array.isArray(self.properties))    self.definition_.properties    = [].concat(self.properties);
    if (Array.isArray(self.actions))       self.definition_.actions       = [].concat(self.actions);
    if (Array.isArray(self.listeners))     self.definition_.listeners     = [].concat(self.listeners);
    if (Array.isArray(self.models))        self.definition_.models        = [].concat(self.models);
    if (Array.isArray(self.tests))         self.definition_.tests         = [].concat(self.tests);
    if (Array.isArray(self.issues))        self.definition_.issues        = [].concat(self.issues);

    self.definition_.__proto__ = FObject;
  },

  create: function(args, opt_X) {
    if ( this.name === 'Model' ) {
      return FObject.create.call(this.getPrototype(), args, opt_X);
    }
    return this.getPrototype().create(args, opt_X);
  },

  isSubModel: function(model) {
    /* Returns true if the given instance extends this $$DOC{ref:'Model'} or a descendant of this. */

    if ( ! model || ! model.getPrototype ) return false;

    var subModels_ = this.subModels_ || ( this.subModels_ = {} );

    if ( ! subModels_.hasOwnProperty(model.id) ) {
      subModels_[model.id] = ( model.getPrototype() === this.getPrototype() || this.isSubModel(model.getPrototype().__proto__.model_) );
    }

    return subModels_[model.id];
  },

  getRuntimeProperties: function() {
    if ( ! this.instance_.properties_ ) this.getPrototype();
    return this.instance_.properties_;
  },

  getRuntimeActions: function() {
    if ( ! this.instance_.actions_ ) this.getPrototype();
    return this.instance_.actions_;
  },

  getRuntimeRelationships: function() {
    if ( ! this.instance_.relationships_ ) this.getPrototype();
    return this.instance_.relationships_;
  },

  getProperty: function(name) { /* Returns the requested $$DOC{ref:'Property'} of this instance. */
    // NOTE: propertyMap_ is invalidated in a few places
    // when properties[] is updated.
    if ( ! this.propertyMap_ ) {
      var m = this.propertyMap_ = {};

      var properties = this.getRuntimeProperties();
      for ( var i = 0 ; i < properties.length ; i++ ) {
        var prop = properties[i];
        m[prop.name] = prop;
      }

      this.propertyMap_ = m;
    }

    return this.propertyMap_[name];
  },

  getAction: function(name) { /* Returns the requested $$DOC{ref:'Action'} of this instance. */
    for ( var i = 0 ; i < this.instance_.actions_.length ; i++ )
      if ( this.instance_.actions_[i].name === name ) return this.instance_.actions_[i];
  },

  hashCode: function() {
    var string = '';
    var properties = this.getRuntimeProperties();
    for ( var key in properties ) {
      string += properties[key].toString();
    }
    return string.hashCode();
  },

  isInstance: function(obj) { /* Returns true if the given instance extends this $$DOC{ref:'Model'}. */
    return obj && obj.model_ && this.isSubModel(obj.model_);
  },

  toString: function() { return "BootstrapModel(" + this.name + ")"; },

  arequire: function() {
    if ( this.required__ ) return this.required__;

    var future = afuture();
    this.required__ = future.get;

    var go = function() {
      var args = [], model = this, i;

      if ( this.extends ) args.push(this.X.arequire(this.extends));

      if ( this.models ) {
        for ( i = 0; i < this.models.length; i++ ) {
          args.push(this.models[i].arequire());
        }
      }

      if ( this.traits ) {
        for ( i = 0; i < this.traits.length; i++ ) {
          args.push(this.X.arequire(this.traits[i]));
        }
      }

      if ( this.templates ) for ( i = 0 ; i < this.templates.length ; i++ ) {
        var t = this.templates[i];
        args.push(
          aif(!t.code,
              aseq(
                aevalTemplate(this.templates[i], this),
                (function(t) { return function(ret, m) {
                  t.code = m;
                  ret();
                };})(t))));
      }
      if ( args.length ) args = [aseq.apply(null, args)];

      if ( this.requires ) {
        for ( var i = 0 ; i < this.requires.length ; i++ ) {
          var r = this.requires[i];
          var m = r.split(' as ');
          if ( m[0] == this.id ) {
            console.warn("Model requires itself: " + this.id);
          } else {
            args.push(this.X.arequire(m[0]));
          }
        }
      }

      args.push(function(ret) {
        if ( this.X.i18nModel )
          this.X.i18nModel(ret, this, this.X);
        else
          ret();
      }.bind(this));

      aseq.apply(null, args)(function() {
        this.finished__ = true;
        future.set(this);
      }.bind(this));
    }.bind(this);

    if ( this.extra__ )
      this.extra__(go);
    else
      go();

    return this.required__;
  },

  getMyFeature: function(featureName) {
    /* Returns the feature with the given name from the runtime
      object (the features available to an instance of the model). */
    if ( ! Object.prototype.hasOwnProperty.call(this, 'featureMap_') ) {
      var map = this.featureMap_ = {};
      function add(a) {
        if ( ! a ) return;
        for ( var i = 0 ; i < a.length ; i++ ) {
          var f = a[i];
          map[f.name.toUpperCase()] = f;
        }
      }
      add(this.getRuntimeProperties());
      add(this.instance_.actions_);
      add(this.methods);
      add(this.listeners);
      add(this.templates);
      add(this.models);
      add(this.tests);
      add(this.relationships);
      add(this.issues);
    }
    return this.featureMap_[featureName.toUpperCase()];
  },

  getRawFeature: function(featureName) {
    /* Returns the raw (not runtime, not inherited, non-buildPrototype'd) feature
      from the model definition. */
    if ( ! Object.prototype.hasOwnProperty.call(this, 'rawFeatureMap_') ) {
      var map = this.featureMap_ = {};
      function add(a) {
        if ( ! a ) return;
        for ( var i = 0 ; i < a.length ; i++ ) {
          var f = a[i];
          map[f.name.toUpperCase()] = f;
        }
      }
      add(this.properties);
      add(this.actions);
      add(this.methods);
      add(this.listeners);
      add(this.templates);
      add(this.models);
      add(this.tests);
      add(this.relationships);
      add(this.issues);
    }
    return this.featureMap_[featureName.toUpperCase()];
  },

  getAllMyRawFeatures: function() {
    /* Returns the raw (not runtime, not inherited, non-buildPrototype'd) list
      of features from the model definition. */
    var featureList = [];
    var arrayOrEmpty = function(arr) {
      return ( arr && Array.isArray(arr) ) ? arr : [];
    };
    [
      arrayOrEmpty(this.properties),
      arrayOrEmpty(this.actions),
      arrayOrEmpty(this.methods),
      arrayOrEmpty(this.listeners),
      arrayOrEmpty(this.templates),
      arrayOrEmpty(this.models),
      arrayOrEmpty(this.tests),
      arrayOrEmpty(this.relationships),
      arrayOrEmpty(this.issues)
    ].map(function(list) {
      featureList = featureList.concat(list);
    });
    return featureList;
  },

  getFeature: function(featureName) {
    /* Returns the feature with the given name, including
       inherited features. */
    var feature = this.getMyFeature(featureName);

    if ( ! feature && this.extends ) {
      var ext = this.X.lookup(this.extends);
      if ( ext ) return ext.getFeature(featureName);
    } else {
      return feature;
    }
  },

  // getAllFeatures accounts for inheritance through extendsModel
  getAllRawFeatures: function() {
    var featureList = this.getAllMyRawFeatures();

    if ( this.extends ) {
      var ext = this.X.lookup(this.extends);
      if ( ext ) {
        ext.getAllFeatures().map(function(subFeat) {
          var subName = subFeat.name.toUpperCase();
          if ( ! featureList.mapFind(function(myFeat) { // merge in features we don't already have
            return myFeat && myFeat.name && myFeat.name.toUpperCase() === subName;
          }) ) {
            featureList.push(subFeat);
          }
        });
      }
    }
    return featureList;
  },

  atest: function() {
    var seq = [];
    var allPassed = true;

    for ( var i = 0 ; i < this.tests.length ; i++ ) {
      seq.push(
        (function(test, model) {
          return function(ret) {
            test.atest(model)(function(passed) {
              if ( ! passed ) allPassed = false;
              ret();
            })
          };
        })(this.tests[i], this));
    }

    seq.push(function(ret) {
      ret(allPassed);
    });

    return aseq.apply(null, seq);
  }
};
