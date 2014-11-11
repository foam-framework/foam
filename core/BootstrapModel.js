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

this.Constant = null;
this.Method = null;
this.Action = null;
this.Relationship = null;

/**
 * Override a method, making calling the overridden method possible by
 * calling this.SUPER();
 **/

function override(cls, methodName, method) {
  var super_ = cls[methodName];

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

  f.super_ = super_;

  cls[methodName] = f;
}


var BootstrapModel = {

  __proto__: PropertyChangeSupport,

  name_: 'BootstrapModel <startup only, error if you see this>',

  buildPrototype: function() { /* Internal use only. */
    // save our pure state
    // Note: Only documentation browser uses this, and it will be replaced
    // by the new Feature Oriented bootstrapping process, so only use the
    // extra memory in DEBUG mode.
    if (DEBUG) {
      BootstrapModel.saveDefinition(this);
    }

    function addTraitToModel(traitModel, parentModel) {
      var name = parentModel.name + '_ExtendedWith_' + traitModel.name;

      if ( ! FOAM.lookup(name) ) {
        var model = traitModel.deepClone();
        model.name = name;
        model.extendsModel = parentModel.name;
        GLOBAL.registerModel(model);
      }

      return FOAM.lookup(name);
    }

    if ( this.extendsModel && ! FOAM.lookup(this.extendsModel) ) throw 'Unknown Model in extendsModel: ' + this.extendsModel;

    var extendsModel = this.extendsModel && FOAM.lookup(this.extendsModel);

    if ( this.traits ) for ( var i = 0 ; i < this.traits.length ; i++ ) {
      var trait      = this.traits[i];
      var traitModel = FOAM.lookup(trait);

      if ( traitModel ) {
        extendsModel = addTraitToModel(traitModel, extendsModel);
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
    if ( this.name !== 'Model' && ! ( window.chrome && chrome.runtime && chrome.runtime.id ) ) {
      var s = '(function() { var XXX = function() { }; XXX.prototype = this; return function() { return new XXX(); }; })'.replace(/XXX/g, this.name);
      try { cls.create_ = eval(s).call(cls); } catch (e) { }
    }

    /** Add a method to 'cls' and set it's name. **/
    function addMethod(name, method) {
      if ( cls.__proto__[name] ) {
        override(cls, name, method);
      } else {
        cls[name] = method;
      }
    }

    // add sub-models
    //        this.models && this.models.forEach(function(m) {
    //          cls[m.name] = JSONUtil.mapToObj(m);
    //        });
    // Workaround for crbug.com/258552
    this.models && Object_forEach(this.models, function(m) {
      cls.model_[m.name] = cls[m.name] = JSONUtil.mapToObj(X, m, Model);
    });

    if ( extendsModel ) this.requires = this.requires.concat(extendsModel.requires);
    // build requires
    Object_forEach(this.requires, function(i) {
      var imp  = i.split(' as ');
      var m    = imp[0];
      var path = m.split('.');
      var key  = imp[1] || path[path.length-1];

      defineLocalProperty(cls, key, function() {
        var model = FOAM.lookup(m, this.X);
        var proto = model.getPrototype();
        var self  = this;
        var f     = function(args, opt_X) {
          return proto.create(args, opt_X || self.X);
        };
        f.__proto__ = model;
        return f;
      });
    });

    if ( ! this.properties ) this.properties = [];
    var props = this.properties;

    function findProp(name) {
      for ( var i = 0 ; i < props.length ; i++ ) {
        if ( props[i].name == name ) return i;
      }

      return -1;
    }

    if ( extendsModel ) this.imports = this.imports.concat(extendsModel.imports);
    // build imports as psedo-properties
    Object_forEach(this.imports, function(i) {
      var imp   = i.split(' as ');
      var key   = imp[0];
      var alias = imp[1] || imp[0];

      if ( alias.length && alias.charAt(alias.length-1) == '$' )
        alias = alias.slice(0, alias.length-1);

      var i = findProp(alias);

      if ( i == -1 ) {
        props.push(Property.create({
          name:      alias,
          transient: true,
          hidden:    true
        }));
      }/*
         TODO(kgr): Do I need to do anything in this case?
         else {
        var p = props[i];
      }*/
    });

    // build properties
    for ( var i = 0 ; i < props.length ; i++ ) {
      var p = props[i];
      if ( extendsModel ) {
        var superProp = extendsModel.getProperty(p.name);
        if ( superProp ) {
          p = superProp.clone().copyFrom(p);
          props[i] = p;
          this[p.name.constantize()] = p;
        }
      }
      cls.defineProperty(p);
    }
    this.propertyMap_ = null;

    // Copy parent Model's Property Contants to this Model.
    if ( extendsModel ) {
      for ( var i = 0 ; i < extendsModel.properties.length ; i++ ) {
        var p = extendsModel.properties[i];
        var name = p.name.constantize();

        if ( ! this[name] ) this[name] = p;
      }
      for ( i = 0 ; i < extendsModel.relationships.length ; i++ ) {
        var r = extendsModel.relationships[i];
        var name = r.name.constantize();

        if ( ! this[name] ) this[name] = r;
      }
    }

    // Handle 'exports'
    if ( extendsModel ) this.exports = this.exports.concat(extendsModel.exports);

    Object_forEach(this.exports, function(e) {
      var exp = e.split(' as ');

      if ( exp.length == 0 ) return;

      var key   = exp[0];
      var alias = exp[1] || exp[0];
      var asValue = key.charAt(key.length-1) == '$';
      if ( asValue ) key = key.slice(0, key.length-1);
      var prop  = findProp(key);
      if ( prop == -1 ) {
        // TODO: this isn't an error if we're export 'this' or a method, add check before reporting.
        // console.warn('Unknown export: "'+ cls.name_ + '.' + key + '"');
        return;
      }
      var subProp = asValue ? 'exportValueKeys' : 'exportKeys';
      props[prop][subProp] = (props[prop][subProp] || []).concat(alias);
    });

    if ( extendsModel && extendsModel.exportKeys.length > 0 ) this.exportKeys = this.exportKeys.concat(extendsModel.exportKeys);

    // templates
    this.templates && Object_forEach(this.templates, function(t) {
      addMethod(t.name, TemplateUtil.lazyCompile(t));
    });

    // mix-in mixins
    // Workaround for crbug.com/258522
    // this.mixins && Object_forEach(this.mixins, function(m) { /* TODO: something */ });

    // add action
    if ( this.actions ) {
      for ( var i = 0 ; i < this.actions.length ; i++ ) {
        (function(a) {
          if ( extendsModel ) {
            var superAction = extendsModel.getAction(a.name);
            if ( superAction ) {
              a = superAction.clone().copyFrom(a);
              this.actions[i] = a;
            }
          }
          addMethod(a.name, function(opt_x) { a.callIfEnabled(opt_x || this.X, this); });
        }.bind(this))(this.actions[i]);
      }
    }

    // add constants
    for ( var key in this.constants ) {
      var c = this.constants[key];
      if ( Constant && Constant.isInstance(c) ) {
        // TODO(kgr): only add to Proto when Model cleanup done.
        Object.defineProperty(cls, c.name, {value: c.value});
        Object.defineProperty(this, c.name, {value: c.value});
        // cls[c.name] = this[c.name] = c.value;
      } else {
        debugger;
      }
    }

    // add methods
    for ( var key in this.methods ) {
      var m = this.methods[key];
      if ( Method && Method.isInstance(m) ) {
        addMethod(m.name, m.generateFunction());
      } else {
        addMethod(key, m);
      }
    }

    var self = this;
    // add relationships
    this.relationships && this.relationships.forEach(function(r) {
      // console.log('************** rel: ', r, r.name, r.label, r.relatedModel, r.relatedProperty);

      //           this[r.name.constantize()] = r;
      var name = r.name.constantize();
      if ( ! self[name] ) self[name] = r;
      defineLazyProperty(cls, r.name, function() {
        var m = this.X[r.relatedModel];
        var dao = this.X[m.name + 'DAO'] || this.X[m.plural];
        if ( ! dao ) {
          console.error('Relationship ' + r.name + ' needs ' + (m.name + 'DAO') + ' or ' +
              m.plural + ' in the context, and neither was found.');
        }

        return {
          get: function() { return dao.where(EQ(m.getProperty(r.relatedProperty), this.id)); },
          configurable: true
        };
      });
    });

    // todo: move this somewhere better
    var createListenerTrampoline = function(cls, name, fn, isMerged, isFramed) {
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
          if ( isFramed )
            l = EventService.framed(l, this.X);
          else if ( isMerged ) {
            l = EventService.merged(
              l,
              (isMerged === true) ? undefined : isMerged, this.X);
          }

          Object.defineProperty(this, name, { value: l});

          return l;
        },
        configurable: true
      });
    };

    // add listeners
    if ( Array.isArray(this.listeners) ) {
      for ( var i = 0 ; i < this.listeners.length ; i++ ) {
        var l = this.listeners[i];
        createListenerTrampoline(cls, l.name, l.code, l.isMerged, l.isFramed);
      }
    } else if ( this.listeners )
      //          this.listeners.forEach(function(l, key) {
      // Workaround for crbug.com/258522
      Object_forEach(this.listeners, function(l, key) {
        createListenerTrampoline(cls, key, l);
      });

    // add topics
    //        this.topics && this.topics.forEach(function(t) {
    // Workaround for crbug.com/258522
    this.topics && Object_forEach(this.topics, function(t) {
      // TODO: something
    });

    // copy parent model's properties and actions into this model
    if ( extendsModel ) {
      for ( var i = extendsModel.properties.length-1 ; i >= 0 ; i-- ) {
        var p = extendsModel.properties[i];
        if ( ! ( this.getProperty && this.getPropertyWithoutCache_(p.name) ) )
          this.properties.unshift(p);
      }
      this.propertyMap_ = null;
      this.actions = extendsModel.actions.concat(this.actions);
    }

    // build primary key getter and setter
    if ( this.properties.length > 0 && ! cls.__lookupGetter__('id') ) {
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

  getPrototype: function() { /* Returns the definition $$DOC{ref:'Model'} of this instance. */
    return this.instance_.prototype_ || ( this.instance_.prototype_ = this.buildPrototype() );
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

  create: function(args, opt_X) { return this.getPrototype().create(args, opt_X); },

  isSubModel: function(model) {
    /* Returns true if the given instance extends this $$DOC{ref:'Model'} or a descendant of this. */
    try {
      return model && model.getPrototype && ( model.getPrototype() === this.getPrototype() || this.isSubModel(model.getPrototype().__proto__.model_) );
    } catch (x) {
      return false;
    }
  },

  getPropertyWithoutCache_: function(name) { /* Internal use only. */
    for ( var i = 0 ; i < this.properties.length ; i++ ) {
      var p = this.properties[i];

      if ( p.name === name ) return p;
    }

    return null;
  },

  getProperty: function(name) { /* Returns the requested $$DOC{ref:'Property'} of this instance. */
    // NOTE: propertyMap_ is invalidated in a few places
    // when properties[] is updated.
    if ( ! this.propertyMap_ ) {
      if ( ! this.properties.length ) return undefined;

      var m = {};

      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        var prop = this.properties[i];
        m[prop.name] = prop;
      }

      this.propertyMap_ = m;
    }

    return this.propertyMap_[name];
  },

  getAction: function(name) { /* Returns the requested $$DOC{ref:'Action'} of this instance. */
    for ( var i = 0 ; i < this.actions.length ; i++ )
      if ( this.actions[i].name === name ) return this.actions[i];
  },

  hashCode: function() {
    var string = "";
    for ( var key in this.properties ) {
      string += this.properties[key].toString();
    }
    return string.hashCode();
  },

  isInstance: function(obj) { /* Returns true if the given instance extends this $$DOC{ref:'Model'}. */
    return obj && obj.model_ && this.isSubModel(obj.model_);
  },

  toString: function() { return "BootstrapModel(" + this.name + ")"; }
};

/*
 * Ex.
 * OR(EQ(Issue.ASSIGNED_TO, 'kgr'), EQ(Issue.SEVERITY, 'Minor')).toSQL();
 *   -> "(assignedTo = 'kgr' OR severity = 'Minor')"
 * OR(EQ(Issue.ASSIGNED_TO, 'kgr'), EQ(Issue.SEVERITY, 'Minor')).f(Issue.create({assignedTo: 'kgr'}));
 *   -> true
 */
