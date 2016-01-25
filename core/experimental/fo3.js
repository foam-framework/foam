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
var global = global || this;

// Minimal Stdlib, to be replaced

function memoize1(f) {
  /** Faster version of memoize() when only dealing with one argument. **/
  var cache = {};
  var g = function(arg) {
    var key = arg ? arg.toString() : '';
    if ( ! cache.hasOwnProperty(key) ) cache[key] = f.call(this, arg);
    return cache[key];
  };
  g.name = f.name;
  return g;
}

var constantize = memoize1(function(str) {
  // switchFromCamelCaseToConstantFormat to SWITCH_FROM_CAMEL_CASE_TO_CONSTANT_FORMAT
  // TODO: add property to specify constantization. For now catch special case to avoid conflict with context this.X and this.Y.
  if ( str === 'x' ) return 'X_';
  if ( str === 'y' ) return 'Y_';
  if ( str === '$' ) return '$_';
  return str.replace(/[a-z][^0-9a-z_]/g, function(a) {
    return a.substring(0,1) + '_' + a.substring(1,2);
  }).toUpperCase();
});

// End of Stdlib


var models = [];
function MODEL(m) {
  global[m.name] = {};
  models.push(m);
}


MODEL({
  name: 'FObject',
  extends: null,

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

  axioms: [
  ]
});


MODEL({
  name: 'Model',

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
      name: 'properties'
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
        var p = this.extends ? Object.create(global[this.extends.proto]) : {};
        p.model_ = this;
        return p;
      }
    }
  ],

  methods: [
    {
      name: 'create',
      code: function() {
        var obj = Object.create(this);
        obj.instance_ = {};
        return obj;
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
    }
  ],

  methods: [
    {
      name: 'install',
      code: function(proto) {
        proto[constantize(this.name)] = this;

        var name            = prop.name;
        var slotName        = name + '$';
        var adapt           = this.adapt
        var preSet          = this.preSet;
        var postSet         = this.postSet;
        var getter          = this.getter;
        var setter          = this.setter;
        var factory         = this.factory;
        var hasDefaultValue = this.hasOwnProperty('defaultValue');
        var defaultValue    = this.defaultValue;

        /* Future
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


for ( var i = 0 ; i < models.length ; i++ ) {
  var m = models[i];
  var proto = global[m.name];

  if ( m.axioms ) {
    for ( var i = 0 ; i < m.axioms ; i++ ) {
      var a = m.axioms[i];
      a.install.call(a, proto);
    }
  }
}

for ( var i = 0 ; i < models.length ; i++ ) {
  var m = models[i];
  var proto = global[m.name];
  if ( m.methods ) {
    for ( var i = 0 ; i < m.methods ; i++ ) {
      var meth = m.methods[i];
      proto[meth.name] = meth.code;
    }
  }
}

for ( var i = 0 ; i < models.length ; i++ ) {
  var m = models[i];
  var proto = global[m.name];
  if ( m.properties ) {
    for ( var i = 0 ; i < m.properties ; i++ ) {
      var p = m.properties[i];
      Property.install.call(p, proto);
    }
  }
}
