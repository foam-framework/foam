/*
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
 *
 * TODO: provide 'super' support for calling same method for parent class
 **/
var ModelProto = {

   __proto__: PropertyChangeSupport,

   TYPE: 'ModelProto <startup only, error if you see this>',

    buildPrototype: function() {
       var extendsModel = this.extendsModel && GLOBAL[this.extendsModel];

       var cls = {
          instance_: {},
	  __proto__:
	     extendsModel                             ? extendsModel.getPrototype() :
	     typeof this.extendsPrototype == 'object' ? this.extendsPrototype :
	     this.extendsPrototype                    ? GLOBAL[this.extendsPrototype] :
	                                                AbstractPrototype
       };

       /** Add a method to 'cls' and set it's name. **/
       function addMethod(name, method) {
         cls[name] = method;
         method.name = name;
         /*
          TODO: add 'super' support here.
         if ( cls.__proto__[name] ) {
           method.super2 = cls.__proto__[name];
           console.log('subclass: ', cls.name_, ' ', name);
         }
         */
       }

       cls.name_  = this.name;
       cls.TYPE   = this.name + "Prototype";

	// add sub-models
        this.models && this.models.forEach(function(m) {
console.log("InnerClass: ", cls.name_, m.name);
cls[m.name] = JSONUtil.chaosify(m);
console.log(cls);
 });

	// build properties
        this.properties && this.properties.forEach(function(p) { cls.defineProperty(p); });

	// templates
        this.templates && this.templates.forEach(function(t) { addMethod(t.name, TemplateUtil.compile(t.template)); });

	// mix-in mixins
        this.mixins && this.mixins.forEach(function(m) { /* TODO: something */ });

	// add action
        this.actions && this.actions.forEach(function(a) { addMethod(a.name, a.action); });

	// add methods
	for ( var key in this.methods )	{
	  var m = this.methods[key];
	  if ( MethodModel && MethodModel.isInstance(m) )
	    addMethod(m.name, m.code); //cls[m.name] = m.code;
	  else
	    addMethod(key, m); //cls[key] = m;
	}

        // todo: move this somewhere better
        var createListenerTrampoline = function(cls, name, fn) {
	   // bind a trampoline to the function which
	   // re-binds a bound version of the function
	   // when first called
           fn.name = name;

	   cls.__defineGetter__(name, function () {
	      var l = fn.bind(this);

	      this[name] = l;

	      return l;
	   });
        };

	// add listeners
        if ( Array.isArray(this.listeners) ) {
          this.listeners.forEach(function(l) {
	    createListenerTrampoline(cls, l.name, l.code);
          });
        } else if ( this.listeners )
          this.listeners.forEach(function(l, key) {
	    createListenerTrampoline(cls, key, l);
          });

	// add topics
        this.topics && this.topics.forEach(function(t) {
          // TODO: something
	});

        // copy parent model's properties and actions into this model
        if ( this.extendsModel ) {
	   this.properties = extendsModel.properties.concat(this.properties);
	   this.actions    = extendsModel.actions.concat(this.actions);
        }

       // build primary key getter and setter
       if ( this.properties.length > 0 && ! cls.__lookupGetter__('id') ) {
          var primaryKey = this.ids;
          if (primaryKey.length == 1) {
            cls.__defineGetter__("id", function() { return this[primaryKey[0]]; });
            cls.__defineSetter__("id", function(val) { this[primaryKey[0]] = val; });
          } else {
            cls.__defineGetter__("id", function() {
                return primaryKey.map(function(key) { return this[key]; }); });
            cls.__defineSetter__("id", function(val) {
                primaryKey.map(function(key, i) { this[key] = val[i]; }); });
          }
       }

       cls.model_ = this;

       return cls;
    },

    getPrototype: function() {
      return this.prototype_ && this.prototype_.model_ == this ?
	  this.prototype_ :
	  ( this.prototype_ = this.buildPrototype() );
    },

    create: function(args) { return this.getPrototype().create(args); },

    isSubModel: function(model) {
      try {
        return model == this || this.isSubModel(model.prototype_.__proto__.model_);
      } catch (x) {
        return false;
      }
    },

    isInstance: function(obj) { return obj && obj.model_ && this.isSubModel(obj.model_); },

    toString: function() { return "ModelProto(" + this.name + ")"; }
};

/*
 * Ex.
 * OR(EQ(Issue.ASSIGNED_TO, 'kgr'), EQ(Issue.SEVERITY, 'Minor')).toSQL();
 *   -> "(assignedTo = 'kgr' OR severity = 'Minor')"
 * OR(EQ(Issue.ASSIGNED_TO, 'kgr'), EQ(Issue.SEVERITY, 'Minor')).f(Issue.create({assignedTo: 'kgr'}));
 *   -> true
 */
