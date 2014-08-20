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
var StringProperty = Model.create({
  extendsModel: 'Property',

  name:  'StringProperty',
  help:  "Describes a properties of type String.",

  properties: [
    {
      name: 'displayHeight',
      type: 'int',
      displayWidth: 8,
      defaultValue: 1,
      help: 'The display height of the property.'
    },
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'String',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'preSet',
      defaultValue: function (_, v) {
        return v === undefined || v === null ? '' : v.toString();
      }
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 70,
      defaultValue: 'String',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'TextFieldView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


var BooleanProperty = Model.create({
  extendsModel: 'Property',

  name:  'BooleanProperty',
  help:  "Describes a properties of type String.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Boolean',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 70,
      defaultValue: 'bool',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'BooleanView'
    },
    {
      name: 'defaultValue',
      defaultValue: false
    },
    {
      name: 'preSet',
      defaultValue: function (_, v) { return !!v; }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'fromElement',
      defaultValue: function(e) {
        var txt = e.innerHTML.trim();
        return txt.equalsIC('y') || txt.equalsIC('yes') || txt.equalsIC('true') || txt.equalsIC('t');
      }
    }

  ]
});


/*
  preSet: function (d) {
  return typeof d === 'string' ? new Date(d) : d;
  },
  tableFormatter: function(d) {
  return d.toDateString();
  },
  factory: function() { return new Date(); }

*/


var DateProperty = Model.create({
  extendsModel: 'Property',

  name:  'DateProperty',
  help:  "Describes a properties of type String.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Date',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 50
    },
    {
      name: 'javaType',
      type: 'String',
      defaultValue: 'Date',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      // TODO: create custom DateView
      defaultValue: 'DateFieldView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'preSet',
      defaultValue: function (_, d) {
        return typeof d === 'string' ? new Date(d) : d;
      }
    },
    {
      name: 'tableFormatter',
      defaultValue: function(d) {
        return d ? d.toRelativeDateString() : '';
      }
    },
    {
      name: 'compareProperty',
      defaultValue: function(o1, o2) {
        if ( ! o1 ) return ( ! o2 ) ? 0: -1;
        if ( ! o2 ) return 1;

        return o1.compareTo(o2);
      }
    }
  ]
});


var DateTimeProperty = Model.create({
  extendsModel: 'DateProperty',

  name:  'DateTimeProperty',
  help:  "Describes a properties of type String.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 25,
      defaultValue: 'datetime',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'preSet',
      defaultValue: function(_, d) {
        if ( typeof d === 'number' ) return new Date(d);
        if ( typeof d === 'string' ) return new Date(d);
        return d;
      }
    },
    {
      name: 'view',
      defaultValue: 'DateTimeFieldView'
    }
  ]
});


var IntProperty = Model.create({
  extendsModel: 'Property',

  name:  'IntProperty',
  help:  "Describes a properties of type Int.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Int',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 10
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'int',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'IntFieldView'
    },
    {
      name: 'preSet',
      defaultValue: function (_, v) { return parseInt(v || 0); }
    },
    {
      name: 'defaultValue',
      defaultValue: 0
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'compareProperty',
      defaultValue: function(o1, o2) {
        return o1 === o2 ? 0 : o1 > o2 ? 1 : -1;
      }
    }
  ]
});


var FloatProperty = Model.create({
  extendsModel: 'Property',

  name:  'FloatProperty',
  help:  "Describes a properties of type Float.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Float',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'defaultValue',
      defaultValue: 0.0
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'double',
      help: 'The Java type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 15
    },
    {
      name: 'view',
      defaultValue: 'FloatFieldView'
    },
    {
      name: 'preSet',
      defaultValue: function (_, v) { return parseFloat(v || 0.0); }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


var FunctionProperty = Model.create({
  extendsModel: 'Property',

  name:  'FunctionProperty',
  help:  "Describes a properties of type Function.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Function',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'Function',
      help: 'The Java type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 15
    },
    {
      name: 'view',
      defaultValue: 'FunctionView'
    },
    {
      name: 'defaultValue',
      defaultValue: function() {}
    },
    {
      name: 'fromElement',
      defaultValue: function(e) {
        var txt = e.innerHTML.trim();

        return txt.startsWith('function') ?
          eval('(' + txt + ')') :
          new Function(txt) ;
      }
    },
    {
      name: 'preSet',
      defaultValue: function(_, value) {
        if ( typeof value === 'string' ) {
          return value.startsWith('function') ?
              eval('(' + value + ')') :
              new Function(value);
        }
        return value;
      }
    }
  ]
});


var ArrayProperty = Model.create({
  extendsModel: 'Property',

  name:  'ArrayProperty',
  help:  "Describes a properties of type Array.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Array',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'subType',
      type: 'String',
      displayWidth: 20,
      defaultValue: '',
      help: 'The FOAM sub-type of this property.'
    },
    {
      name: 'preSet',
      defaultValue: function(_, a, prop) {
        var m = GLOBAL[prop.subType];

        if ( ! m ) return a;

        for ( var i = 0 ; i < a.length ; i++ ) {
          // TODO: remove when 'redundant model_'s removed
          /*
            if ( a[i].model_ ) {
            if ( a[i].model_ == prop.subType ) {
            console.log('********* redundant model_ ', prop.subType)
            } else {
            console.log('*');
            }
            }
          */
          a[i] = a[i].model_ ? FOAM(a[i]) : m.create(a[i]);
        }

        return a;
      }
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValueFn: function(p) { return p.subType + '[]'; },
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'ArrayView'
    },
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'install',
      defaultValue: function(prop) {
        defineLazyProperty(this, prop.name + '$Proxy', function() {
          var dao = ArrayDAO.create({
            array$: this.propertyValue(prop.name),
            model: prop.subType
          });

          return {
            get: function() { return dao; },
            configurable: true
          };
        });
      }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


var ReferenceProperty = Model.create({
  extendsModel: 'Property',

  name:  'ReferenceProperty',
  help:  "A foreign key reference to another Entity.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Reference',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'subType',
      type: 'String',
      displayWidth: 20,
      defaultValue: '',
      help: 'The FOAM sub-type of this property.'
    },
    {
      name: 'subKey',
      type: 'EXPR',
      displayWidth: 20,
      factory: function() { return this.subType + '.ID'; },
      help: 'The foreign key that this property references.'
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      // TODO: should obtain primary-key type from subType
      defaultValueFn: function(p) { return 'Object'; },
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'TextFieldView'
// TODO: Uncomment when all usages of ReferenceProperty/ReferenceArrayProperty fixed.
//      defaultValue: 'KeyView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


var StringArrayProperty = Model.create({
  extendsModel: 'Property',

  name:  'StringArrayProperty',
  help:  "An array of String values.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Array[]',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'subType',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'String',
      help: 'The FOAM sub-type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 50
    },
    {
      name: 'preSet',
      defaultValue: function(_, v) { return Array.isArray(v) ? v : [v]; }
    },
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'String[]',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'StringArrayView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'exclusive',
      defaultValue: false
    }
  ]
});


var DAOProperty = Model.create({
  extendsModel: 'Property',

  name: 'DAOProperty',
  help: "Describes a DAO property.",

  properties: [
    {
      name: 'type',
      defaultValue: 'DAO',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'ArrayView'
    },
    {
//      model_: 'FunctionProperty',
      name: 'onDAOUpdate'
    },
    {
      name: 'install',
      defaultValue: function(prop) {
        defineLazyProperty(this, prop.name + '$Proxy', function() {
          var proxy = ProxyDAO.create({delegate: this[prop.name]});

          this.addPropertyListener(prop.name, function(_, _, _, dao) {
            proxy.delegate = dao;
          });

          return {
            get: function() { return proxy; },
            configurable: true
          };
        });
      }
    }
  ]
});


var ModelProperty = Model.create({
  extendsModel: 'Property',

  help: "Describes a Model property.",

  properties: [
    {
      name: 'type',
      defaultValue: 'Model'
    },
    {
      name: 'preSet',
      defaultValue: function(_, model) {
        return FOAM.lookup(model, this.X);
      }
    }
  ]
});


var ReferenceArrayProperty = Model.create({
  name: 'ReferenceArrayProperty',
  extendsModel: 'ReferenceProperty',

  properties: [
    {
      name: 'type',
      defaultValue: 'Array',
      displayWidth: 20,
      help: 'The FOAM type of this property.'
    },
    {
      name: 'factory',
      defaultValue: function() { return []; },
    },
    {
      name: 'view',
      defaultValue: 'StringArrayView',
// TODO: Uncomment when all usages of ReferenceProperty/ReferenceArrayProperty fixed.
//      defaultValue: 'DAOKeyView'
    }
  ]
});


var ViewFactoryProperty = Model.create({
  name: 'ViewFactoryProperty',
  extendsModel: 'Property',

  properties: [
    {
      name: 'preSet',
      defaultValue: function(_, value) {
        if (typeof value === 'function') return value;

        var viewModel = this.X['DetailView'];
        if (typeof value === 'string') viewModel = this.X[value];
        if (value.model_) {
            if (typeof value.model_ === 'string') viewModel = FOAM(value);
            else viewModel = value.model_;
        }
        return function(value, viewModel, cfg) {
          return viewModel.create(
              typeof value === 'object' ? value : {}
          ).copyFrom(cfg);
        }.bind(this, value, viewModel);
      }
    }
  ]
});


var ViewProperty = Model.create({
  name: 'ViewProperty',
  extendsModel: 'Property',

  properties: [
    {
      name: 'preSet',
      defaultValue: function(_, value) {
        if (this.X.View.isInstance(value)) return value;
        if (typeof value === 'function') return value(this);

        var viewModel = this.X['DetailView'];
        if (typeof value === 'string') viewModel = this.X[value];
        if (value.model_) {
            if (typeof value.model_ === 'string') viewModel = FOAM(value);
            else viewModel = value.model_;
        }
        return viewModel.create(typeof value === 'object' ? value : {});
      }
    }
  ]
});


var EMailProperty = StringProperty;
var URLProperty = StringProperty;
