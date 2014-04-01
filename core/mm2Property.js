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
var Property = {
  __proto__: ModelProto,

  name:  'Property',
  plural:'Properties',
  help:  "Describes a properties of a modelled entity.",

  ids: [ 'name' ],

  tableProperties: [
    'name',
    'label',
    'type',
    'required',
    'defaultValue'
  ],

  properties: [
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the property.'
    },
    {
      name: 'label',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      help: 'The display label for the property.'
    },
    {
      name: 'tableLabel',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      help: 'The table display label for the entity.'
    },
    {
      name: 'type',
      type: 'String',
      required: true,
      // todo: curry arguments
      view: {
        create: function() { return ChoiceView.create({choices: [
          'Array',
          'Boolean',
          'Color',
          'Date',
          'DateTime',
          'Email',
          'Enum',
          'Float',
          'Function',
          'Image',
          'Integer',
          'Object',
          'Password',
          'String',
          'String[]',
          'URL'
        ]});}
      },
      defaultValue: 'String',
      help: 'The type of the property.'
    },
    {
      name: 'javaType',
      type: 'String',
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The java type that represents the type of this property.'
    },
    {
      name: 'javascriptType',
      type: 'String',
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The javascript type that represents the type of this property.'
    },
    {
      name:  'shortName',
      type:  'String',
      required: true,
      displayWidth: 10,
      displayHeight: 1,
      defaultValue: '',
      help: 'A short alternate name to be used for compact encoding.'
    },
    {
      name: 'aliases',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValue: [],
      help: 'Alternate names for this property.'
    },
    {
      name:  'mode',
      type:  'String',
      defaultValue: 'read-write',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); } }
    },
    {
      name: 'subType',
      label: 'Sub-Type',
      type: 'String',
      displayWidth: 30,
      // todo: keyView of Models
      help: 'The type of the property.'
    },
    {
      name: 'units',
      type: 'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The units of the property.'
    },
    {
      name: 'required',
      type: 'Boolean',
      view: 'BooleanView',
      defaultValue: true,
      help: 'Indicates if the property is a required field.'
    },
    {
      name: 'hidden',
      type: 'Boolean',
      view: 'BooleanView',
      defaultValue: false,
      help: 'Indicates if the property is hidden.'
    },
    {
      name: 'transient',
      type: 'Boolean',
      view: 'BooleanView',
      defaultValue: false,
      help: 'Indicates if the property is transient.'
    },
    {
      name: 'displayWidth',
      type: 'int',
      displayWidth: 8,
      displayHeight: 1,
      defaultValue: '30',
      help: 'The display width of the property.'
    },
    {
      name: 'displayHeight',
      type: 'int',
      displayWidth: 8,
      displayHeight: 1,
      defaultValue: 1,
      help: 'The display height of the property.'
    },
    {
      name: 'view',
      type: 'view',
      defaultValue: 'TextFieldView',
      help: 'View component for the property.'
    },
    {
      model_: 'FunctionProperty',
      name: 'detailViewPreRow',
      defaultValue: function() { return ""; },
      help: 'Inject HTML before row in DetailView.'
    },
    {
      model_: 'FunctionProperty',
      name: 'detailViewPostRow',
      defaultValue: function() { return ""; },
      help: 'Inject HTML before row in DetailView.'
    },
    {
      name: 'defaultValue',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The property\'s default value.'
    },
    {
      name: 'defaultValueFn',
      label: 'Default Value Function',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'The property\'s default value function.'
    },
    {
      name: 'valueFactory',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Factory for creating initial value when new object instantiated.'
    },
    {
      name: 'getter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'The property\'s default value function.'
    },
    {
      name: 'preSet',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'An adapter function called before normal setter logic.'
    },
    {
      name: 'postSet',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'A function called after normal setter logic, but before property change event fired.'
    },
    {
      name: 'setter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'The property\'s default value function.'
    },
    {
      name: 'tableFormatter',
      label: 'Table Cell Formatter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Function to format value for display in TableView.'
    },
    {
      name: 'summaryFormatter',
      label: 'Summary Formatter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Function to format value for display in SummaryView.'
    },
    {
      name: 'tableWidth',
      type: 'String',
      required: false,
      defaultValue: '',
      help: 'Table View Column Width.'
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 6,
      view: 'TextAreaView',
      defaultValue: '',
      help: 'Help text associated with the property.'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Integer',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'actionFactory',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Factory to create the action objects for taking this property from value A to value B'
    },
    {
      name: 'compareProperty',
      type: 'Function',
      view: 'FunctionView',
      displayWidth: 70,
      displayHeight: 5,
      defaultValue: function(o1, o2) {
        return (o1.localeCompare || o1.compareTo).call(o1, o2);
      },
      help: 'Comparator function.'
    },
    {
      name: 'fromElement',
      defaultValue: function(e) { return e.innerHTML; },
      help: 'Function to extract from from DOM Element.'
    }
  ],

  methods: {
    f: function(obj) { return obj[this.name] || obj; },
    compare: function(o1, o2) {
      return this.compareProperty(this.f(o1), this.f(o2));
    },
    toSQL: function() { return this.name; },
    toMQL: function() { return this.name; }
  },

  getProperty: function(name) {
debugger; // Why is this here?  Is it ever called?
    for ( var i = 0 ; i < this.properties.length ; i++ ) {
      var p = this.properties[i];

      if ( p.name === name ) return p;
    }

    document.writeln("couldn't find: " + name);
    return null;
  },

  templates: [
    {
      model_: 'Template',
      name: 'closureSource',
      description: 'Closure Externs JavaScript Source',
      template:
      '/**\n' +
        ' * @type {<%= this.javascriptType %>}\n' +
        ' */\n' +
        '<%= arguments[1] %>.prototype.<%= this.name %> = undefined;'
    }
  ],

  toString: function() { return "Property"; }
};


Model.methods = {
  getPropertyWithoutCache_: ModelProto.getPropertyWithoutCache_,
  getProperty:              ModelProto.getProperty,
  hashCode:                 ModelProto.hashCode,
  buildPrototype:           ModelProto.buildPrototype,
  getPrototype:             ModelProto.getPrototype,
  isSubModel:               ModelProto.isSubModel,
  isInstance:               ModelProto.isInstance
};

// This is the coolest line of code that I've ever written
// or ever will write. Oct. 4, 2011 -- KGR
Model = Model.create(Model);
Model.model_ = Model;

Property = Model.create(Property);
