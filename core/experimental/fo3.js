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


function MODEL(m) {
  global[m.name] = m;
  // Insert magic here
}


MODEL({
  name: 'FProto',
  extends: null

  methods: [
    {
      name: 'toString',
      code: function() {
        // Distinguish between prototypes and Objects.
        return (this.instance_ ? 'FProto' : '') + this.model_.name;
      }
    }
  ]
});


MODEL({
  name: 'FObject',
  extends: 'FProto',

  properties: [
  ],

  methods: [
    {
      name: 'toString',
      code: function() { return this.model_.name; }
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
      // TODO: replace with lazyFactory
      factory: function() {
        return {
          __proto__: FProto,
          model_: this
        }
      }
    }
  ],

  methods: [
    {
      name: 'create',
      code: function() { return { __proto__: this, instance_: {} } },
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
      name: 'installInModel',
      function(model) {
        model[constantize(this.name)] = this;
      }
    },
    {
      name: 'installInProto',
      function(proto) {
        this.installInModel(proto);

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
      name: 'installInProto',
      function(proto) {
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
      name: 'installInModel',
      function(model) {
        model[constantize(this.name)] = this.value;
      }
    },
    {
      name: 'installInProto',
      function(proto) {
        this.installInModel(proto);
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
*/
