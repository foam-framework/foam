/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

// Bootstrap Support, discarded after use
var Bootstrap = {

  // Temporary collection of classes to be updated later.
  classes: [],

  start: function() {
    global.CLASS = Bootstrap.CLASS.bind(Bootstrap);
  },

  getClass: (function() {
    /*
      Create or Update a Prototype from a psedo-Model definition.
      (Model is 'this').
    */

    var AbstractClass = {
      prototype: {},
      create: function(args) {
        var obj = Object.create(this.prototype);
        obj.instance_ = Object.create(null);

        if ( args ) {
          for ( var key in args )
            if ( key.indexOf('_') == -1 )
              obj[key] = args[key];

          if ( args.instance_ )
            for ( var key in args.instance_ )
              obj[key] = args.instance_[key];
        }

        return obj;
      },
      installModel: function(m) {
        if ( m.axioms )
          for ( var i = 0 ; i < m.axioms.length ; i++ )
            this.installAxiom(m.axioms[i]);

        if ( m.methods )
          for ( var i = 0 ; i < m.methods.length ; i++ ) {
            var a = m.methods[i];
            if ( typeof a === 'function' )
              m.methods[i] = a = { name: a.name, code: a };
            this.prototype[a.name] = a.code;
          }

        if ( global.Property && m.properties )
          for ( var i = 0 ; i < m.properties.length ; i++ ) {
            var a = m.properties[i];
            if ( typeof a === 'string' ) m.properties[i] = a = { name: a };
            var type = global[(a.type || '') + 'Property'] || Property;
            this.installAxiom(type.create(a));
          }
      },
      installAxiom: function(a) {
        a.installInClass && a.installInClass(this);
        a.installInProto && a.installInProto(this.prototype);
      }
    };

    return function getClass() {
      var cls = global[this.name];

      if ( ! cls ) {
        var parent = this.extends ? global[this.extends] : AbstractClass ;
        cls = Object.create(parent);
        cls.prototype = Object.create(parent.prototype);
        cls.prototype.cls_ = cls;
        cls.ID___  = this.name + 'Class';
        cls.prototype.ID___  = this.name + 'Prototype';
        cls.name   = this.name;
        cls.model_ = this;
        global[cls.name] = cls;
      }

      cls.installModel(this);

      return cls;
    };
  })(),

  // Bootstrap Model definition which records incomplete models
  // so they can be patched at the end of the bootstrap process.
  CLASS: function(m) {
    this.classes.push(this.getClass.call(m));
  },

  endPhase1: function() {
    // Upgrade to final CLASS() definition.
    global.CLASS = function(m) { return Model.create(m).getClass(); };

    // Upgrade existing classes to real classes.
    for ( var i = 0 ; i < this.classes.length ; i++ )
      CLASS(this.classes[i].model_);
  },

  end: function() {
    // Substitute Bootstrap installModel() with
    // simpler axiom-only version.
    FObject.__proto__.installModel = function installModel(m) {
      if ( m.axioms )
        for ( var i = 0 ; i < m.axioms.length ; i++ )
          this.installAxiom(m.axioms[i]);
    };

    global.Bootstrap = null;
  }
};


Bootstrap.start();

CLASS({
  name: 'FObject',

  documentation: 'Base model for model hierarchy.',

  methods: [
    function hasOwnProperty(name) {
      return Object.hasOwnProperty.call(this.instance_, name);
    }
  ]
});


CLASS({
  name: 'Model',
  extends: 'FObject', // Isn't the default yet.

  documentation: 'Class/Prototype description.',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'extends',
      defaultValue: 'FObject'
    },
    {
      // type: 'Array',
      name: 'axioms',
      factory: function() { return []; }
    },
    {
      type: 'Array',
      subType: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        var cls = this.type ? global[this.type + 'Property'] : Property;
        return cls.create(o);
      }
    },
    {
      type: 'Array',
      subType: 'Method',
      name: 'methods',
      // TODO: this shouldn't be needed
      adapt: function(_, a, prop) {
        if ( ! a ) return [];
        return a.map(prop.adaptArrayElement.bind(prop));
      },
      adaptArrayElement: function(e) {
        if ( typeof e === 'function' ) {
          console.assert(e.name, 'Method must be named');
          return Method.create({name: e.name, code: e});
        }
        return e;
      }
    }
  ],

  methods: [
    Bootstrap.getClass
  ]
});


CLASS({
  name: 'Property',
  extends: 'FObject',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'type'
    },
    {
      name: 'defaultValue'
    },
    {
      name: 'factory'
    },
    {
      name: 'adapt'
    },
    {
      name: 'preSet'
    },
    {
      name: 'postSet'
    },
    {
      name: 'expression'
    }
  ],

  methods: [
    function installInClass(c) { c[constantize(this.name)] = this; },
    function installInProto(proto) {
      /*
        Install a property onto a prototype from a Property definition.
        (Property is 'this').
      */
      var prop            = this;
      var name            = this.name;
      var adapt           = this.adapt
      var preSet          = this.preSet;
      var postSet         = this.postSet;
      var factory         = this.factory;
      var hasDefaultValue = this.hasOwnProperty('defaultValue');
      var defaultValue    = this.defaultValue;

      /* Future: needs events and slot support first.
         var slotName        = name + '$';
         Object.defineProperty(proto, slotName, {
         get: function propSlotGetter() {
         return this.getSlot(name);
         },
         set: function propSlotSetter(value) {
         value.link.link(this.getSlot(name));
         },
         configurable: true
         });
      */

      // TODO: implement 'expression'

      Object.defineProperty(proto, name, {
        get: prop.getter || function propGetter() {
          if ( ( hasDefaultValue || factory ) &&
               ! this.hasOwnProperty(name) )
          {
            if ( hasDefaultValue ) return defaultValue;

            var value = factory.call(this);
            this.instance_[name] = value;
            return value;
          }

          return this.instance_[name];
        },
        set: prop.setter || function propSetter(newValue) {
          // TODO: add logic to not trigger factory
          var oldValue = this[name];

          if ( adapt )  newValue = adapt.call(this, oldValue, newValue, prop);

          if ( preSet ) newValue = preSet.call(this, oldValue, newValue, prop);

          this.instance_[name] = newValue;

          // TODO: fire property change event

          // TODO: call global setter

          if ( postSet ) postSet.call(this, oldValue, newValue, prop);
        },
        configurable: true
      });
    }
  ]
});


CLASS({
  name: 'Method',
  extends: 'FObject',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'code'
    }
  ],

  methods: [
    function installInProto(proto) { proto[this.name] = this.code; }
  ]
});


CLASS({
  name: 'StringProperty',
  extends: 'Property',

  properties: [
    {
      name: 'defaultValue',
      defaultValue: ''
    },
    {
      name: 'preSet',
      defaultValue: function(_, a) {
        return a ? a.toString() : '';
      }
    }
  ]
});


CLASS({
  name: 'ArrayProperty',
  extends: 'Property',

  properties: [
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'subType'
    },
    {
      name: 'preSet',
      defaultValue: function(_, a, prop) {
        var cls = global[prop.subType];
        // TODO: loop for performance
        return a.map(function(p) { return cls.create(p); });
      }
    },
    {
      name: 'adapt',
      defaultValue: function(_, a, prop) {
        if ( ! a ) return [];
        return a.map(prop.adaptArrayElement.bind(prop));
      }
    },
    {
      name: 'adaptArrayElement',
      defaultValue: function(o) {
        return global[this.subType].create(o);
      }
    }
  ]
});

Bootstrap.endPhase1();


CLASS({
  name: 'FObject',

  methods: [
    function clearProperty(name) { delete this.instance_[name]; },
    function toString() {
      // Distinguish between prototypes and instances.
      return this.model_.name + (this.instance_ ? '' : 'Proto')
    }
  ],

  // TODO: insert core/FObject.js functionality

  // TODO: insert EventService and PropertyChangeSupport here
});


CLASS({
  name: 'AxiomArrayProperty',
  extends: 'ArrayProperty',

  properties: [
    {
      name: 'postSet',
      defaultValue: function(_, a) {
        (this.axioms || (this.axioms = [])).push.apply(this.axioms, a); }
    }
  ]
});


CLASS({
  name: 'Constant',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'value'
    }
  ],

  methods: [
    function installInClass(cls) { cls[constantize(this.name)] = this.value; },
    function installInProto(proto) { proto[constantize(this.name)] = this.value; }
  ]
});


CLASS({
  name: 'Model',

  properties: [
    {
      type: 'AxiomArray',
      subType: 'Constant',
      name: 'constants'
    },
    {
      type: 'AxiomArray',
      subType: 'Property',
      name: 'properties'
    },
    {
      type: 'AxiomArray',
      subType: 'Method',
      name: 'methods',
      // TODO: shouldn't be needed when property inheritance is implemented.
      adaptArrayElement: function(e) {
        if ( typeof e === 'function' ) {
          console.assert(e.name, 'Method must be named');
          return Method.create({name: e.name, code: e});
        }
        return e;
      }
    }
  ]
});

Bootstrap.end();


/*
  Notes:

  remove create from regular objects
  acreate or afromJSON

  TODO:
  - property overriding
*/
