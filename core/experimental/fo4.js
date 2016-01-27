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

  // Temporary collection of models to be updated later.
  classes: [],

  start: function() {
    global.CLASS = Bootstrap.CLASS.bind(Bootstrap);
  },

  classFactory: (function() {
    /*
      Create or Update a Prototype from a psedo-Model definition.
      'this' is a Model.
    */

    var AbstractClass = {
      proto: {},
      create: function() {
        return this.proto.create.apply(this.proto, arguments);
      },
      installAxiom: function(a) {
        a.installOnClass && a.installOnClass(this);
        a.installOnProto && a.installOnProto(this.proto);
      }
    };

    return function() {
      var cls = global[this.name];

      if ( ! cls ) {
        if ( this.extends ) {
          var parent = global[this.extends];
          cls = Object.create(parent);
          cls.proto = Object.create(parent.proto);
        } else {
          cls = Object.create(AbstractClass);
        }
        
        cls.name   = this.name;
        cls.model_ = this;
        
        global[this.name] = cls;
      }
      
      var proto = cls.proto;
      
      if ( this.axioms )
        for ( var i = 0 ; i < this.axioms.length ; i++ )
          cls.installAxiom(this.axioms[i]);
      
      if ( this.methods ) {
        for ( var i = 0 ; i < this.methods.length ; i++ ) {
          var meth = this.methods[i];
          proto[meth.name] = meth.code;
        }
      }
      
      if ( global.Property && this.properties ) {
        for ( var i = 0 ; i < this.properties.length ; i++ ) {
          var p    = this.properties[i];
          var cls  = p.type ? global[p.type + 'Property'] : Property;
          cls.installAxiom(cls.create(p));
        }
      }

      return cls;
    };
  })(),

  // Bootstrap Model definition which records incomplete models
  // so they can be patched at the end of the bootstrap process.
  CLASS: function(m) {
    this.classes.push(this.classFactory.call(m));
  },

  updateModels: function() {
    var classes = this.classes;

    for ( var i = 0 ; i < classes.length ; i++ ) {
      var cls = classes[i];
      var m   = cls.model_;

      if ( m.properties )
        for ( var j = 0 ; j < m.properties.length ; j++ )
          cls.installAxiom(m.properties[j]);
    }

    for ( var i = 0 ; i < classes.length ; i++ ) {
      var cls = classes[i];
      var m   = cls.model_;

      if ( m.properties ) {
        for ( var j = 0 ; j < m.properties.length ; j++ ) {
          var p = m.properties[j];
          if ( p.type ) {
            var propType = global[p.type + 'Property'];
            if ( propType ) {
              console.log('Updating: ', i, m.name, p.name, p.type);
              cls.installAxiom(propType.create(p));
            } else {
              console.warn('Unknown Property type: ', p.type);
            }
          }
        }
      }
    }
  },

  end: function() {
    Bootstrap.updateModels();

    global.CLASS = function(m) {
      var model = Model.create(m);
      var cls   = model.createClass();
      global[m.name] = cls;
      return cls;
    }

    global.Bootstrap = null;
  }
};


Bootstrap.start();

CLASS({
  name: 'FObject',
  extends: null,

  documentation: 'Base model for model hierarchy.',

  methods: [
    {
      name: 'create',
      code: function(args) {
        var obj = Object.create(this);
        obj.instance_ = {};

        // TODO: lookup if valid method names
        for ( var key in args ) obj[key] = args[key];

        return obj;
      }
    },
    {
      name: 'toString',
      code: function() {
        // Distinguish between prototypes and instances.
        return this.model_.name + (this.instance_ ? '' : 'Proto')
      }
    }
  ],

  // TODO: insert core/FObject.js functionality

  // TODO: insert EventService and PropertyChangeSupport here
});


CLASS({
  name: 'Model',
  extends: 'FObject', // Don't remove, isn't the default yet.

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
        var t = this.type ? global[this.type + 'Property'] : Property;
        return t.create(o);
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
    {
      name: 'createClass',
      code: Bootstrap.classFactory
    }
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
      // TODO: implement
    }
  ],

  methods: [
    {
      name: 'installInClass',
      code: function(proto) {
        proto[constantize(this.name)] = this;
      }
    },
    {
      name: 'installInProto',
      code: function(proto) {
        /*
          Install a property onto a prototype from a Property definition.
          (Property is 'this').
        */
        var prop            = this;
        var name            = this.name;
        var adapt           = this.adapt
        var preSet          = this.preSet;
        var postSet         = this.postSet;
        var getter          = this.getter;
        var setter          = this.setter;
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

        Object.defineProperty(proto, name, {
          get: function propGetter() {
            if ( getter ) return getter.call(this);

            if ( ( hasDefaultValue || factory ) &&
                 ! this.instance_.hasOwnProperty(name) )
            {
              if ( hasDefaultValue ) return defaultValue;

              var value = factory.call(this);
              this.instance_[name] = value;
              return value;
            }

            return this.instance_[name];
          },
          set: function propSetter(newValue) {
            if ( setter ) {
              setter.call(this, newValue);
              return;
            }

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
    {
      name: 'installInProto',
      code: function(proto) { proto[this.name] = this.code; }
    }
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

// TODO: Why does this need to be in the Bootstrap?
CLASS({
  name: 'AxiomArrayProperty',
  extends: 'ArrayProperty',

  properties: [
    {
      name: 'postSet',
      defaultValue: function(_, a) { this.axioms.push.apply(this.axioms, a); }
    }
  ]
});

Bootstrap.end();


CLASS({
  name: 'Constant',
  extends: 'FObject', // This line shouldn't be needed.

  properties: [
    {
      name: 'name'
    },
    {
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'installInClass',
      code: function(cls) { cls[constantize(this.name)] = this.value; }
    },
    {
      name: 'installInProto',
      code: function(proto) { proto[constantize(this.name)] = this.value; }
    }
  ]
});

CLASS({
  name: 'Model',

  properties: [
    {
      type: 'AxiomArray',
      subType: 'Constant',
      name: 'constants'
    }
  ]
});


/*
  Notes:

  remove create from regular objects
  acreate or afromJSON

  TODO:
  - property overriding
*/
