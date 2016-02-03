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

// Bootstrap support, discarded after use
foam.boot = {

  // Temporary collection of classes to be updated later.
  classes: [],

  start: function() {
    global.CLASS = this.CLASS.bind(this);
  },

  getClass: (function() {
    /*
      Create or Update a Prototype from a psedo-Model definition.
      (Model is 'this').
    */
    var AbstractClass = {
      prototype: Object.prototype,
      axiomMap_: null,
      create: function create(args) {
        var obj = Object.create(this.prototype);
        obj.instance_ = Object.create(null);

        obj.initArgs(args);

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
        this.axiomMap_[a.name] = a;
        this.axiomCache_ = {};
        a.installInClass && a.installInClass(this);
        a.installInProto && a.installInProto(this.prototype);
      },
      isInstance: function isInstance(o) {
        return o.cls_ && this.isSubClass(o.cls_);
      },
      isSubClass: function isSubClass(o) {
        // TODO: switch from 'name' to 'id' when available
        if ( ! o ) return false;

        var subClasses_ = this.hasOwnProperty('subClasses_') ?
          this.subClasses_ :
          this.subClasses_ = {} ;

        if ( ! subClasses_.hasOwnProperty(o.name) )
          subClasses_[o.name] = ( o === this ) || this.isSubClass(o.__proto__);

        return subClasses_[o.name];
      },
      describe: function(opt_name) {
        console.log('CLASS:        ', this.name);
        console.log('extends:      ', this.model_.extends);
        console.log('----------------------------');
        for ( var key in this.axiomMap_ ) {
          var a = this.axiomMap_[key];
          console.log(foam.string.rightPad(a.cls_.name, 14), a.name);
        }
      },
      getAxiomByName: function(name) {
        return this.axiomMap_[name];
      },
      // The Following method will eventually change.
      // Would like to have efficient support for:
      //    .where() .orderBy() groupBy
      getAxiomsByClass: function(cls) {
        var as = this.axiomCache_[cls.name];
        if ( ! as ) {
          as = [];
          for ( var key in this.axiomMap_ ) {
            var a = this.axiomMap_[key];
            if ( cls.isInstance(a) )
              as.push(a);
          }
          this.axiomCache_[cls.name] = as;
        }

        return as;
      },
      getAxioms: function() {
        var as = this.axiomCache_[''];
        if ( ! as ) {
          as = [];
          for ( var key in this.axiomMap_ )
            as.push(this.axiomMap_[key]);
          this.axiomCache_[''] = as;
        }
        return as;
      },
      toString: function() {
        return this.name + 'Class';
      }
    };

    return function getClass() {
      var cls = global[this.name];

      if ( ! cls ) {
        var parent = this.extends ? global[this.extends] : AbstractClass ;
        // TODO: make some of these values non-innumerable
        cls                  = Object.create(parent);
        cls.prototype        = Object.create(parent.prototype);
        cls.prototype.cls_   = cls;
        cls.prototype.model_ = this;
        cls.prototype.ID__   = this.name + 'Prototype';
        cls.ID__             = this.name + 'Class';
        cls.axiomMap_        = Object.create(parent.axiomMap_);
        cls.axiomCache_      = {};
        cls.name             = this.name;
        cls.model_           = this;
        global[cls.name]     = cls;
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
    // Substitute AbstractClass.installModel() with simpler axiom-only version.
    FObject.__proto__.installModel = function installModel(m) {
      for ( var i = 0 ; i < m.axioms.length ; i++ )
        this.installAxiom(m.axioms[i]);
    };

    delete foam['boot'];
  }
};


foam.boot.start();

CLASS({
  name: 'FObject',

  documentation: 'Base model for model hierarchy.',

  methods: [
    function initArgs(args) {
      if ( ! args ) return;

      for ( var key in args )
        if ( key.indexOf('_') == -1 )
          this[key] = args[key];

      if ( args.instance_ )
        for ( var key in args.instance_ )
          this[key] = args.instance_[key];
    },
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
    'name',
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
      adaptArrayElement: function(e) {
        if ( typeof e === 'function' ) {
          console.assert(e.name, 'Method must be named');
          return Method.create({name: e.name, code: e});
        }
        return e;
      }
    }
  ],

  methods: [ foam.boot.getClass ]
});


CLASS({
  name: 'Property',
  extends: 'FObject',

  properties: [
    'name', 'type', 'defaultValue', 'factory', 'adapt', 'preSet', 'postSet', 'expression'
  ],

  methods: [
    function installInClass(c) { c[foam.string.constantize(this.name)] = this; },
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

  properties: [ 'name', 'code' ],

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
      defaultValue: function(_, a) { return a ? a.toString() : ''; }
    }
  ]
});


CLASS({
  name: 'ArrayProperty',
  extends: 'Property',

  properties: [
    'subType',
    {
      name: 'factory',
      defaultValue: function() { return []; }
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

foam.boot.endPhase1();


CLASS({
  name: 'FObject',

  methods: [
    function clearProperty(name) { delete this.instance_[name]; },
    function toString() {
      // Distinguish between prototypes and instances.
      return this.cls_.name + (this.instance_ ? '' : 'Proto')
    },
    function describe(opt_name) {
      console.log('Instance of', this.cls_.name);
      console.log('--------------------------------------------------');
      var ps = this.cls_.getAxiomsByClass(Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var p = ps[i];
        console.log(foam.string.rightPad(p.cls_.name, 20), foam.string.rightPad(p.name, 12), this[p.name]);
      }
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
    { name: 'name'  },
    { name: 'value' }
  ],

  methods: [
    function installInClass(cls)   { cls[foam.string.constantize(this.name)]   = this.value; },
    function installInProto(proto) { proto[foam.string.constantize(this.name)] = this.value; }
  ]
});


CLASS({
  name: 'Model',

  properties: [
    {
      type: 'AxiomArray',
      subType: 'Constant',
      name: 'constants',
      adapt: function(_, a, prop) {
        if ( ! a ) return [];
        if ( ! Array.isArray(a) ) {
          var cs = [];
          for ( var key in a )
            cs.push(Constant.create({name: key, value: a[key]}));
          return cs;
        }
        return a.map(prop.adaptArrayElement.bind(prop));
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        return typeof o === 'string'     ?
          Property.create({name: o})     :
          global[this.subType].create(o) ;
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Method',
      name: 'methods',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Method must be named');
          return Method.create({name: o.name, code: o});
        }
        return global[this.subType].create(o);
      }
    }
  ]
});

CLASS({
  name: 'FObject',
  methods: [
    function initArgs(args) {
      if ( ! args ) return;

      if ( args.__proto__ === Object.prototype ) {
        for ( var key in args )
          this[key] = args[key];
      } else if ( args.instance_ ) {
        for ( var key in args.instance_ )
          this[key] = args.instance_[key];
      } else {
        // TODO: should walk through Axioms with initAgents instead
        var a = this.getAxiomsByClass(Property);
        for ( var i = 0 ; i < a.length ; i++ ) {
          var name = a[i].name;
          if ( args.hasOwnProperty(name) )
            this[name] = args[name];
        }
      }
    }
  ]
});

foam.boot.end();


/*
  TODO:
  - Implement Property Overriding
  - replace initArgs() in boot.end()
  - SUPER support
  - Axiom query support
  - Add package and id to Model and Class
  - Proxy id, name, package, label, plural from Class to Model
  - Make Properties be adapter functions.
  - Make Properties be comparator functions.
  - Have Axioms know which class/model they belong to.
*/
