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
 * should be fixed and then ModelProto should be deleted at
 * the end of metamodel.js once the real Model is created.
 **/

var Method, Action, Relationship;

var ModelProto = {

  __proto__: PropertyChangeSupport,

  TYPE: 'ModelProto <startup only, error if you see this>',

  buildPrototype: function() {
    var extendsModel = this.extendsModel && GLOBAL[this.extendsModel];
    // TODO: remove 'extendsPrototype' support when no longer used
    var cls = {
      instance_: {},
      __proto__:
          extendsModel ? extendsModel.getPrototype() :
          typeof this.extendsPrototype == 'object' ? this.extendsPrototype :
          this.extendsPrototype ? GLOBAL[this.extendsPrototype] :
          AbstractPrototype
    };

    /** Add a method to 'cls' and set it's name. **/
    function addMethod(name, method) {
      cls[name] = method;
      method.name = name;
      if (cls.__proto__[name]) {
        method.super_ = cls.__proto__[name];
      }
    }

    cls.name_ = this.name;
    cls.TYPE = this.name + 'Prototype';

    // add sub-models
    //        this.models && this.models.forEach(function(m) {
    //          cls[m.name] = JSONUtil.mapToObj(m);
    //        });
    // Workaround for crbug.com/258522
    this.models && Object_forEach(this.models, function(m) {
      cls[m.name] = JSONUtil.mapToObj(m);
    });

    // build properties
    if (this.properties) {
      for (var i = 0; i < this.properties.length; i++) {
        var p = this.properties[i];
        if (extendsModel) {
          var superProp = extendsModel.getProperty(p.name);
          if (superProp) {
            p = superProp.clone().copyFrom(p);
            this.properties[i] = p;
            this[p.name.constantize()] = p;
          }
        }
        cls.defineProperty(p);
      }
    }

    // templates
    // this.templates && this.templates.forEach(
    //     function(t) {
    //       addMethod(t.name, TemplateUtil.compile(t.template));
    //     });
    // Workaround for crbug.com/258522
    this.templates && Object_forEach(this.templates, function(t) {
      addMethod(t.name, TemplateUtil.compile(t.template));
    });

    // mix-in mixins
    // Workaround for crbug.com/258522
    this.mixins && Object_forEach(this.mixins, function(m) {
      /* TODO: something */
    });

    // add action
    // Workaround for crbug.com/258522
    this.actions && Object_forEach(this.actions, function(a) {
      addMethod(a.name, a.action);
    });

    // add methods
    for (var key in this.methods) {
      var m = this.methods[key];
      if (Method && Method.isInstance(m))
        addMethod(m.name, m.code); //cls[m.name] = m.code;
      else
        addMethod(key, m); //cls[key] = m;
    }

    // add relationships
    for (var key in this.relationships) {
      var r = this.relationships[key];

      // console.log('************** rel: ', r, r.name, r.label, r.relatedModel,
      //     r.relatedProperty);

      //           this[r.name.constantize()] = r;

      Object.defineProperty(cls, r.name, {
        get: (function(r) {
          return function() {
            return GLOBAL[r.relatedModel].where(EQ(r.relatedProperty, this.id));
          };
        })(r),
        configurable: false
      });
    }

    // todo: move this somewhere better
    var createListenerTrampoline = function(cls, name, fn, merged, animate) {
      // bind a trampoline to the function which
      // re-binds a bound version of the function
      // when first called
      fn.name = name;

      Object.defineProperty(cls, name, {
        get: function() {
          var l = fn.bind(this);
          if (animate)
            l = EventService.animate(l);
          else if (merged) {
            var merge = (merged === true) ? undefined : merged;
            l = EventService.merged(l, merge);
          }

          Object.defineProperty(this, name, { value: l});

          return l;
        },
        configurable: true
      });
    };

    // add listeners
    if (Array.isArray(this.listeners)) {
      for (var i = 0; i < this.listeners.length; i++) {
        var l = this.listeners[i];
        createListenerTrampoline(cls, l.name, l.code, l.merged, l.animate);
      }
    } else if (this.listeners)
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
    if (extendsModel) {
      for (var i = 0; i < extendsModel.properties.length; i++) {
        var p = extendsModel.properties[i];
        if (! (this.getProperty && this.getProperty(p.name))) {
          this.properties.unshift(p);
        }
      }
      this.actions = extendsModel.actions.concat(this.actions);
    }

    // build primary key getter and setter
    if (this.properties.length > 0 && ! cls.__lookupGetter__('id')) {
      var primaryKey = this.ids;

      if (primaryKey.length == 1) {
        cls.__defineGetter__('id', function() { return this[primaryKey[0]]; });
        cls.__defineSetter__('id', function(val) {
          this[primaryKey[0]] = val;
        });
      } else if (primaryKey.length > 1) {
        cls.__defineGetter__('id', function() {
          return primaryKey.map(function(key) { return this[key]; }); });
        cls.__defineSetter__('id', function(val) {
          primaryKey.map(function(key, i) { this[key] = val[i]; }); });
      }
    }

    cls.model_ = this;

    return cls;
  },

  getPrototype: function() {
    return this.prototype_ && this.prototype_.model_ == this ?
        this.prototype_ :
        (this.prototype_ = this.buildPrototype());
  },

  create: function(args) { return this.getPrototype().create(args); },

  isSubModel: function(model) {
    try {
      return model && (model == this ||
          this.isSubModel(model.getPrototype().__proto__.model_));
    } catch (x) {
      return false;
    }
  },

  hashCode: function() {
    var string = '';
    for (var key in this.properties) {
      string += this.properties[key].toString();
    }
    return string.hashCode();
  },

  isInstance: function(obj) {
    return obj && obj.model_ && this.isSubModel(obj.model_);
  },

  toString: function() { return 'ModelProto(' + this.name + ')'; }
};

/*
 * Ex.
 * OR(EQ(Issue.ASSIGNED_TO, 'kgr'), EQ(Issue.SEVERITY, 'Minor')).toSQL();
 *   -> "(assignedTo = 'kgr' OR severity = 'Minor')"
 * OR(EQ(Issue.ASSIGNED_TO, 'kgr'), EQ(Issue.SEVERITY, 'Minor')).f(
 *   Issue.create({assignedTo: 'kgr'}));
 *   -> true
 */
