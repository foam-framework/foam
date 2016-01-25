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

var FProto = {
  // Parent of all generated Prototypes
  create: function(args) {
    var obj = Object.create(this);
    obj.instance_ = {};

    // TODO: lookup if valid method names
    for ( var key in args ) obj[key] = args[key];

    return obj;
  }
};


// Temporary collection of models to be updated later.
var models = [];

// Bootstrap Model definition which just creates place-holder prototypes
// which are then patched later.
function MODEL(m) {
  var proto = Object.create(FProto);
  global[m.name] = proto;
  proto.model_ = m;

  if ( m.axioms ) {
    for ( var i = 0 ; i < m.axioms.length ; i++ ) {
      var a = m.axioms[i];
      a.install.call(a, proto);
    }
  }

  if ( m.methods ) {
    for ( var i = 0 ; i < m.methods.length ; i++ ) {
      var meth = m.methods[i];
      proto[meth.name] = meth.code;
    }
  }

  models.push(m);
}


MODEL({
  name: 'FObject',
  extends: null,

  documentation: 'Base model for model hierarchy.',

  properties: [
  ],

  methods: [
    {
      name: 'toString',
      code: function() {
        // Distinguish between prototypes and instances.
        return (this.instance_ ? 'FProto' : '') + this.model_.name;
      }
    }
  ],

  // TODO: insert core/FObject.js functionality

  // TODO: insert EventService and PropertyChangeSupport here

  axioms: [
  ]
});


MODEL({
  name: 'Model',

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
      type: 'Array',
      subType: 'Property',
      name: 'properties'/*,
      adapt: function(_, ps) {
        
      }*/
    },
    {
      type: 'Array',
      subType: 'Method',
      name: 'methods',
      adaptElement: function(e) {
        if ( typeof e === 'function' ) {
          console.assert(e.name, 'Method must be named');
          return Method.create({name: e.name, code: e});
        }
        return e;
      }
    },
    {
      name: 'proto',
      factory: function() {
        var proto = this.extends ? Object.create(global[this.extends]) : {};
        var m     = this;

        proto.model_ = this;

        if ( m.axioms ) {
          for ( var j = 0 ; j < m.axioms.length ; j++ ) {
            var a = m.axioms[j];
            a.install.call(a, proto);
          }
        }

        // TODO: should be covered by .axions above
        if ( m.methods ) {
          for ( var j = 0 ; j < m.methods.length ; j++ ) {
            var meth = m.methods[j];
            proto[meth.name] = meth.code;
          }
        }
        
        // TODO: should be covered by .axions above
        if ( m.properties ) {
          for ( var j = 0 ; j < m.properties.length ; j++ ) {
            var p = m.properties[j];
            Property.install.call(p, proto);
          }
        }

        return proto;
      }
    }
  ]
});


MODEL({
  name: 'Property',

  properties: [
    {
      name: 'type'
    },
    {
      name: 'name'
    },
    {
      name: 'defaultValue'
    },
    {
      name: 'factory'
    },
    {
      name: 'preSet'
    },
    {
      name: 'expression'
      // TODO: not implemented
    }
  ],

  methods: [
    {
      name: 'install',
      code: function(proto) {
        /*
          Install a property onto a prototype from a Property definition.
          (Property is 'this').
        */
        proto[constantize(this.name)] = this;

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
            
            if ( adapt )  newValue = adapt.call(this, oldValue, newValue);
            
            if ( preSet ) newValue = preSet.call(this, oldValue, newValue);
            
            this.instance_[name] = newValue;
            
            // TODO: fire property change event
            
            // TODO: call global setter
            
            if ( postSet ) postSet.call(this, oldValue, newValue);
          },
          configurable: true
        });
      }
    }
  ]
});


MODEL({
  name: 'Method',

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
      name: 'install',
      code: function(proto) {
        proto[this.name] = this.code;
      }
    }
  ]
});


MODEL({
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
    {
      name: 'install',
      code: function(proto) {
        proto[constantize(this.name)] = this.value;
      }
    }
  ]
});


MODEL({
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


MODEL({
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
      defaultValue: function(_, a) {
        // TODO: loop for performance
        return a.map(function() { return global[this.subType].create(a); });
      }
    },
    {
      name: 'adaptElement'
    },
    {
      name: 'adapt',
      defaultValue: function(a) {
        if ( ! a ) return [];
        return a.map(this.adaptElement);
      }
    }
  ]
});



/*
  create: create object then update
  remote create from regular objects or remove from prototypes
  acreate or afromJSON

  TODO:
  - property overriding

*/


// Bootstrap Prototypes

for ( var i = 0 ; i < models.length ; i++ ) {
  var m = models[i];
  var proto = global[m.name];

  if ( m.properties ) {
    for ( var j = 0 ; j < m.properties.length ; j++ ) {
      var p = m.properties[j];
      Property.install.call(p, proto);
    }
  }
}


MODEL = function(m) {
  var model = Model.create(m);
  var proto = model.proto;
  global[m.name] = proto;
  return proto;
}

var CLASS = MODEL;


CLASS({
  name: 'Person',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'age'
    }
  ],

  methods: [
    {
      name: 'sayHello',
      code: function() { console.log('Hello World!'); }
    }      
  ]
});

var p = Person.create({name: 'Adam', age: 0});
console.log(p.name, p.age);
p.sayHello();
