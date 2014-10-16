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

this.Method = null;
this.Action = null;
this.Relationship = null;

/**
 * Override a method, making calling the overridden method possible by
 * calling this.SUPER();
 **/
/* Begin Rhino Compatible Version */
// The try/catch prevents JIT-ing of this method, but it is still faster than
// the alternate version
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
/* End Rhino Compatible Version */

/* Begin Non-Rhino Version */
/*
function override(cls, methodName, method) {
  method.super_ = cls[methodName];
  cls[methodName] = method;
}

Object.defineProperty(FObject, 'SUPER', {
  get: function() {
    return arguments.callee.caller.super_.bind(this);
  }
});
*/
/* End Non-Rhino Version */


var BootstrapModel = {

  __proto__: PropertyChangeSupport,

  TYPE: 'BootstrapModel <startup only, error if you see this>',

  buildPrototype: function() { /* Internal use only. */
    function addTraitToModel(traitModel, parentModel) {
      var name = parentModel.name + '_ExtendedWith_' + traitModel.name;
      if ( ! GLOBAL[name] ) {
        var model = traitModel.deepClone();
        model.name = name;
        model.extendsModel = parentModel.name;
        GLOBAL.registerModel(model);
      }

      return GLOBAL[name+"Model"];
    }

    if ( this.extendsModel && ! GLOBAL[this.extendsModel+"Model"] ) throw 'Unknown Model in extendsModel: ' + this.extendsModel;

    var extendsModel = this.extendsModel && GLOBAL[this.extendsModel+"Model"];
//    if (this.extendsModel && GLOBAL[this.extendsModel]) {
//      extendsModel = GLOBAL[this.extendsModel];
//    } else {
//      if (this.name != 'Model') {
//        var modelModel = GLOBAL['Model'];
//        if (!modelModel.TYPE.startsWith('BootstrapModel')) extendsModel = modelModel;
//      }
//    }
//    console.log("Bootstrap model buildPrototype: ", this.name, this.extendsModel, extendsModel? extendsModel.id: "na");
// recursion problem... clone() of a documentation property is causing create of a doc prop, which causes a clone, create, clone, create... since we never get to store the finished proto.

    if ( this.traits ) for ( var i = 0 ; i < this.traits.length ; i++ ) {
      var trait = this.traits[i];
      var traitModel = GLOBAL[trait+"Model"];

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
    cls.TYPE   = this.name;

    // HACK
//    if (   this.name === "Documentation"
//        || this.name === "Template"
//        || this.name === "Arg"
//       ){
//      this.prototype_ = cls;
//    }

    // Install a custom constructor so that Objects are named properly
    // in the JS memory profiler.
    // Doesn't work for Model because of some Bootstrap ordering issues.
    if ( this.name !== 'Model' ) {
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
      cls.model_[m.name] = cls[m.name] = JSONUtil.mapToObj(__ctx__, m, Model);
    });

    // build properties
    // TODO: We're grabbing base copies of properties defined here, to get inherited
    // settings for each prop we define, if there's a base definition to get. This
    // implementation looks like it only dives down one level (relying on an
    // amalgamated list). Replace with getFeature(p.name) and assert the
    // type matches. Do this for each type of feature below.
    if ( this.properties ) {
      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        var p = this.properties[i];
        var extendsMerger = function(curModel) {
          if (!curModel) return;
          var extModel = curModel.extendsModel && GLOBAL[curModel.extendsModel+"Model"];
          extendsMerger(extModel);

          // since we recursed first, we will build up p starting from the base model
          var superProp = curModel.getProperty(p.name);
          if ( superProp ) {
            p = superProp.clone().copyFrom(p);
          }
        }
        extendsMerger(extendsModel);
        cls.defineProperty(p);
      }
      //this.propertyMap_ = null; // TODO: only modify cls (the proto) not this!
    }

    // templates
    this.templates && Object_forEach(this.templates, function(t) {
      addMethod(t.name, TemplateUtil.lazyCompile(t));
    });

    // mix-in mixins
    // Workaround for crbug.com/258522
    // this.mixins && Object_forEach(this.mixins, function(m) { /* TODO: something */ });

    // add action
    // TODO: merge with prop loop above
    if ( this.actions ) {
      for ( var i = 0 ; i < this.actions.length ; i++ ) {
        (function(a) {
          var extendsMerger = function(curModel) {
            if (!curModel) return;
            var extModel = curModel.extendsModel && GLOBAL[curModel.extendsModel+"Model"];
            extendsMerger(extModel);

            // since we recursed first, we will build up a starting from the base model
            var action = curModel.getAction(a.name);
            if ( action ) {
              a = action.clone().copyFrom(a);
            }
          }
          extendsMerger(extendsModel);
          addMethod(a.name, function(opt_x) { a.callIfEnabled(opt_x || this.__ctx__, this); });
        }.bind(this))(this.actions[i]);
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
      if ( ! cls[name] ) cls[name] = r;
      defineLazyProperty(cls, r.name, function() {
        var m = this.__ctx__[r.relatedModel];
        var dao = this.__ctx__[m.name + 'DAO'] || this.__ctx__[m.plural];
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
          if ( ( isFramed || isMerged ) && this.__ctx__.isBackground ) {
            console.log('*********************** ', this.model_.name);
          }
          */
          if ( isFramed )
            l = EventService.framed(l, this.__ctx__);
          else if ( isMerged ) {
            l = EventService.merged(
              l,
              (isMerged === true) ? undefined : isMerged, this.__ctx__);
          }

          Object.defineProperty(cls, name, { value: l});

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

    // build primary key getter and setter
    if ( this.properties.length > 0 && ! cls.__lookupGetter__('id') ) {
      var primaryKey = this.ids;

      if ( primaryKey.length == 1 ) {
        cls.__defineGetter__('id', function() { return this[primaryKey[0]]; });
        cls.__defineSetter__('id', function(val) { this[primaryKey[0]] = val; });
      } else if (primaryKey.length > 1) {
        cls.__defineGetter__('id', function() {
          return primaryKey.map(function(key) { return this[key]; }); });
        cls.__defineSetter__('id', function(val) {
          primaryKey.map(function(key, i) { this[key] = val[i]; }); });
      }
    }

    return cls;
  },

  getPrototype: function() { /* Returns the definition $$DOC{ref:'Model'} of this instance. */
    return this.prototype_ && this.prototype_.model_ == this ?
      this.prototype_ :
      ( this.prototype_ = this.buildPrototype() );
  },

  create: function(args, opt_X) { return this.getPrototype().create(args, opt_X); },

  isSubModel: function(model) {
		/* Returns true if the given instance extends this $$DOC{ref:'Model'} or a descendant of this. */
    try {
      return model && ( model === this || this.isSubModel(model.getPrototype().__proto__.model_) );
    } catch (x) {
      return false;
    }
  },

  //TODO: use getFeature
  getPropertyWithoutCache_: function(name) { /* Internal use only. */
    for ( var i = 0 ; i < this.properties.length ; i++ ) {
      var p = this.properties[i];

      if ( p.name === name ) return p;
    }

    return null;
  },

  //TODO: use getFeature... maybe add caching to getFeature if possible?
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

  getAllProperties: FObject.getAllProperties,

  //TODO: use getFeature
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
