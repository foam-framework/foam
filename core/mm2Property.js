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
  __proto__: BootstrapModel,
  instance_: {},

  name:  'Property',
  plural:'Properties',
  help:  'Describes a properties of a modelled entity.',

  ids: [ 'name' ],

  tableProperties: [
    'name',
    'label',
    'type',
    'required',
    'defaultValue'
  ],

  documentation: function() { /*
    <p>The $$DOC{ref:'Property',usePlural:true} of a $$DOC{ref:'Model'} act as data members
      and connection points. A $$DOC{ref:'Property'} can store a modelled value, and bind
      to other $$DOC{ref:'Property',usePlural:true} for easy reactive programming.</p>
    <p>Note that, like $$DOC{ref:'Model'} being a $$DOC{ref:'Model'} itself, the
      $$DOC{ref:'Model.properties'} feature of all models is itself a $$DOC{ref:'Property'}.
    <p>
  */},

  properties: [
    {
      name: 'name',
      type: 'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the property.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} names should use camelCase staring with a lower case letter.
         */}
    },
    {
      name: 'label',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return labelize(this.name); },
      help: 'The display label for the property.',
      documentation: function() { /* A human readable label for the $$DOC{ref:'.'}. May
        contain spaces or other odd characters.
         */}
    },
    {
      name: 'speechLabel',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.label; },
      help: 'The speech label for the property.',
      documentation: function() { /* A speakable label for the $$DOC{ref:'.'}. Used for accesibility.
         */}
    },
    {
      name: 'tableLabel',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.label; },
      help: 'The table display label for the entity.',
      documentation: function() { /* A human readable label for the $$DOC{ref:'Model'} for use in tables. May
        contain spaces or other odd characters.
         */}
    },
    {
      name: 'type',
      type: 'String',
      required: true,
      // todo: curry arguments
      view: {
        factory_: 'foam.ui.ChoiceView',
        choices: [
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
          'Int',
          'Object',
          'Password',
          'String',
          'String[]',
          'URL'
        ]
      },
      defaultValue: 'String',
      help: 'The type of the property.',
      documentation: function() { /* <p>The type of the $$DOC{ref:'.'}, either a primitive type or
          a $$DOC{ref:'Model'}.</p> <p>Primitives include:</p>
      <ul>
          <li>Array</li>
          <li>Boolean</li>
          <li>Color</li>
          <li>Date</li>
          <li>DateTime</li>
          <li>Email</li>
          <li>Enum</li>
          <li>Float</li>
          <li>Function</li>
          <li>Image</li>
          <li>Int</li>
          <li>Object</li>
          <li>Password</li>
          <li>String</li>
          <li>String[]</li>
          <li>URL</li>
      </ul>
         */}
    },
    {
      name: 'defaultSwiftValue',
      defaultValueFn: function() {
        switch(typeof this.defaultValue) {
        case "string":
          return '"' + this.defaultValue + '"';
        default:
          return this.defaultValue;
        }
      }
    },
    {
      name: 'protobufType',
      type: 'String',
      required: false,
      help: 'The protobuf type that represents the type of this property.',
      defaultValueFn: function() { return this.type.toLowerCase(); },
      documentation: function() {/* When generating protobuf definitions, specifies the type to use for the field this represents. */}
    },
    {
      name: 'javaType',
      type: 'String',
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The java type that represents the type of this property.',
      documentation: function() { /* When running FOAM in a Java environment, specifies the Java type
        or class to use. */}
    },
    {
      name: 'javascriptType',
      type: 'String',
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The javascript type that represents the type of this property.',
      documentation: function() { /* When running FOAM in a javascript environment, specifies the javascript
         type to use. */}
    },
    {
      name: 'swiftType',
      type: 'String',
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The Swift type that represents this type of property.',
    },
    {
      name: 'shortName',
      type: 'String',
      required: true,
      displayWidth: 10,
      displayHeight: 1,
      defaultValue: '',
      help: 'A short alternate name to be used for compact encoding.',
      documentation: "A short alternate $$DOC{ref:'.name'} to be used for compact encoding."
    },
    {
      name: 'singular',
      type: 'String',
      required: false,
      displayWidth: 70
    },
    {
      name: 'aliases',
      type: 'Array[String]',
      view: 'foam.ui.StringArrayView',
      defaultValue: [],
      help: 'Alternate names for this property.',
      documentation: function() { /*
        Aliases can be used as synonyms for this $$DOC{ref:'Property'} in code or to look it up by name.
      */}
    },
    {
      name: 'mode',
      type: 'String',
      defaultValue: 'read-write',
      view: { factory_: 'foam.ui.ChoiceView', choices: ['read-only', 'read-write', 'final'] },
      documentation: function() { /*
        To restrict modification to a $$DOC{ref:'Property'}, the $$DOC{ref:'.mode'} can be set to read-only
        to block changes, or to final to block overriding this $$DOC{ref:'Property'} in descendents of
        the $$DOC{ref:'Model'} that owns this $$DOC{ref:'Property'}.
      */}
    },
    {
      name: 'subType',
      label: 'Sub-Type',
      type: 'String',
      displayWidth: 30,
      // todo: keyView of Models
      help: 'The type of the property.',
      documentation: function() { /*
        In array types, the $$DOC{ref:'.subType'} indicates the type that the array contains.
      */}
    },
    {
      name: 'units',
      type: 'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The units of the property.',
      documentation: function() { /*
        The units of the $$DOC{ref:'Property'}.
      */}
    },
    {
      name: 'required',
      type: 'Boolean',
      view: 'foam.ui.BooleanView',
      defaultValue: true,
      help: 'Indicates if the property is a required field.',
      documentation: function() { /*
        Indicates whether the $$DOC{ref:'Property'} is required for its owner $$DOC{ref:'Model'} to
        function properly.
      */}
    },
    {
      name: 'hidden',
      type: 'Boolean',
      view: 'foam.ui.BooleanView',
      defaultValue: false,
      help: 'Indicates if the property is hidden.',
      documentation: function() { /*
        Indicates whether the $$DOC{ref:'Property'} is for internal use and should be hidden from
        the user when viewing tables or other views of $$DOC{ref:'Model'}
        $$DOC{ref:'Property',usePlural:true}.
      */}
    },
    {
      name: 'transient',
      type: 'Boolean',
      view: 'foam.ui.BooleanView',
      defaultValue: false,
      help: 'Indicates if the property is transient.',
      documentation: function() { /*
        Indicates whether the $$DOC{ref:'Property'} is transient, and should not be saved permanently
        or serialized.
      */}
    },
    {
      name: 'modelId',
      type: 'String',
      view: 'foam.ui.TextFieldView',
      help: 'Id of the model that this is a property of',
      transient: true
    },
    {
      name: 'displayWidth',
      type: 'int',
      displayWidth: 8,
      displayHeight: 1,
      defaultValue: '30',
      help: 'The display width of the property.',
      documentation: function() { /*
        A width suggestion for views that automatically render the $$DOC{ref:'Property'}.
      */}
    },
    {
      name: 'displayHeight',
      type: 'int',
      displayWidth: 8,
      displayHeight: 1,
      defaultValue: 1,
      help: 'The display height of the property.',
      documentation: function() { /*
        A height suggestion for views that automatically render the $$DOC{ref:'Property'}.
      */}
    },
    {
//      model_: 'ViewFactoryProperty',
      name: 'view',
      type: 'view',
      defaultValue: 'foam.ui.TextFieldView',
      help: 'View component for the property.',
      documentation: function() { /*
        The default $$DOC{ref:'foam.ui.View'} to use when rendering the $$DOC{ref:'Property'}.
        Specify a string or an object with factory_ and other properties specified.
      */}
    },
    {
//      model_: 'ViewFactoryProperty',
      name: 'detailView',
      type: 'view',
      defaultValueFn: function() { return this.view; },
      help: 'View component for the property when rendering within a DetailView.',
      documentation: function() { /*
        The default $$DOC{ref:'foam.ui.View'} to use when rendering the $$DOC{ref:'Property'}
        as a part of a $$DOC{ref:'foam.ui.DetailView'}. Specify a string or an object with
        factory_ and other properties specified.
      */}
    },
    {
//      model_: 'ViewFactoryProperty',
      name: 'citationView',
      type: 'view',
      defaultValueFn: function() { return this.view; },
      help: 'View component for the property when rendering within a CitationView.',
      documentation: function() { /*
        The default $$DOC{ref:'foam.ui.View'} to use when rendering the $$DOC{ref:'Property'}
        as a part of a $$DOC{ref:'CitationView'}. Specify a string or an object with
        factory_ and other properties specified.
      */}
    },
    {
      name: 'swiftView',
      type: 'String',
      defaultValueFn: function() { return this.view.substring(this.view.lastIndexOf('.')+1); },
      help: 'The default view name for this property in swift.'
    },
    {
//      model_: 'FunctionProperty',
      name: 'detailViewPreRow',
      defaultValue: function() { return ""; },
      help: 'Inject HTML before row in DetailView.',
      documentation: function() { /*
        An optional function to
        inject HTML before the row in $$DOC{ref:'foam.ui.DetailView'}.
      */}
    },
    {
//      model_: 'FunctionProperty',
      name: 'detailViewPostRow',
      defaultValue: function() { return ""; },
      help: 'Inject HTML before row in DetailView.',
      documentation: function() { /*
        An optional function to
        inject HTML after the row in $$DOC{ref:'foam.ui.DetailView'}.
      */}
    },
    {
      name: 'defaultValue',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      postSet: function(old, nu) {
        if ( nu && this.defaultValueFn ) this.defaultValueFn = undefined;
      },
      help: 'The property\'s default value.',
      documentation: function() { /*
        An optional function to
        inject HTML before the row in $$DOC{ref:'foam.ui.DetailView'}.
      */}
    },
    {
      name: 'defaultValueFn',
      label: 'Default Value Function',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      postSet: function(old, nu) {
        if ( nu && this.defaultValue ) this.defaultValue = undefined;
      },
      help: 'The property\'s default value function.',
      documentation: function() { /*
        Optional function that is evaluated when a default value is required. Will unset any
        $$DOC{ref:'.defaultValue'} that has been set.
      */}
    },
    {
      name: 'dynamicValue',
      label: "Value's Dynamic Function",
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: "A dynamic function which computes the property's value.",
      documentation: function() { /*
        Allows the value of this $$DOC{ref:'Property'} to be calculated dynamically.
        Other $$DOC{ref:'Property',usePlural:true} and bindable objects used inside the function will be
        automatically bound and the function re-evaluated when a dependency changes.
      */}

    },
    {
      name: 'factory',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: 'Factory for creating initial value when new object instantiated.',
      documentation: function() { /*
        An optional function that creates the instance used to store the $$DOC{ref:'Property'} value.
        This is useful when the $$DOC{ref:'Property'} type is a complex $$DOC{ref:'Model'} that requires
        construction parameters.
      */}
    },
    {
      name: 'lazyFactory',
      type: 'Function',
      required: false,
      view: 'foam.ui.FunctionView',
      help: 'Factory for creating the initial value. Only called when the property is accessed for the first time.',
      documentation: function() { /*
        Like the $$DOC{ref:'.factory'} function, but only evaulated when this $$DOC{ref:'Property'} is
        accessed for the first time.
      */}
    },
    {
      name: 'getter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: 'The property\'s default value function.',
      documentation: function() { /*
        For advanced use. Supplying a $$DOC{ref:'.getter'} allows you to completely re-implement the $$DOC{ref:'Property'}
        storage mechanism, to calculcate the value, or cache, or pre-process the value as it is requested.
        In most cases you can just supply a $$DOC{ref:'.preSet'} or $$DOC{ref:'.postSet'} instead.
      */}
    },
    {
      name: 'adapt',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: 'An adapter function called before preSet.',
      documentation: function() { /*
        Allows you to modify the incoming value before it is set. Parameters <code>(old, nu)</code> are
        supplied with the old and new value. Return the value you want to be set.
      */}
    },
    {
      name: 'preSet',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: 'An adapter function called before normal setter logic.',
      documentation: function() { /*
        Allows you to modify the incoming value before it is set. Parameters <code>(old, nu)</code> are
        supplied with the old and new value. Return the value you want to be set.
      */}
    },
    {
      name: 'postSet',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: 'A function called after normal setter logic, but before property change event fired.',
      documentation: function() { /*
        Allows you to react after the value of the $$DOC{ref:'Property'} has been set,
        but before property change event is fired.
        Parameters <code>(old, nu)</code> are supplied with the old and new value.
      */}
    },
    {
      name: 'setter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: 'The property\'s default value function.',
      documentation: function() { /*
        For advanced use. Supplying a $$DOC{ref:'.setter'} allows you to completely re-implement the $$DOC{ref:'Property'}
        storage mechanism, to calculcate the value, or cache, or pre-process the value as it is set.
        In most cases you can just supply a $$DOC{ref:'.preSet'} or $$DOC{ref:'.postSet'} instead.
      */}
    },
    {
      name: 'tableFormatter',
      label: 'Table Cell Formatter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: 'Function to format value for display in TableView.',
      documentation: "A function to format the value for display in a $$DOC{ref:'foam.ui.TableView'}."
    },
    {
      name: 'summaryFormatter',
      label: 'Summary Formatter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: 'Function to format value for display in SummaryView.',
      documentation: "A function to format the value for display in a $$DOC{ref:'SummaryView'}."
    },
    {
      name: 'tableWidth',
      type: 'String',
      required: false,
      defaultValue: '',
      help: 'Table View Column Width.',
      documentation: "A Suggestion for $$DOC{ref:'foam.ui.TableView'} column width."
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 6,
      view: 'foam.ui.TextAreaView',
      defaultValue: '',
      help: 'Help text associated with the property.',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'Property'},
          through field labels or tooltips.
        */}
    },
    DocumentationBootstrap,
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.',
      documentation: 'The protobuf tag number for this field.'
    },
    {
      name: 'actionFactory',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: 'Factory to create the action objects for taking this property from value A to value B',
      documentation: "Factory to create the $$DOC{ref:'Action'} objects for taking this $$DOC{ref:'Property'} from value A to value B"
    },
    {
      name: 'compareProperty',
      type: 'Function',
      view: 'foam.ui.FunctionView',
      displayWidth: 70,
      displayHeight: 5,
      defaultValue: function(o1, o2) {
        if ( o1 === o2 ) return 0;
        if ( ! o1 && ! o2 ) return 0;
        if ( ! o1 ) return -1;
        if ( ! o2 ) return  1;
        if ( o1.localeCompare ) return o1.localeCompare(o2);
        if ( o1.compareTo ) return o1.compareTo(o2);
        return o1.$UID.compareTo(o2.$UID);
      },
      help: 'Comparator function.',
      documentation: "A comparator function two compare two instances of this $$DOC{ref:'Property'}."
    },
    {
      name: 'fromString',
      defaultValue: function(s, p) { this[p.name] = s; },
      help: 'Function to extract value from a String.'
    },
    {
      name: 'fromElement',
      defaultValue: function propertyFromElement(e, p) {
        if ( ! p.type || ! this.X.lookup || p.type === 'String' ) {
          p.fromString.call(this, e.innerHTML, p);
          return;
        }
        var model = this.X.lookup(p.type);
        if ( ! model ) {
          p.fromString.call(this, e.innerHTML, p);
          return;
        }
        var o = model.create();
        if ( ! o.fromElement ){
          p.fromString.call(this, e.innerHTML, p);
          return;
        }
        this[p.name] = o.fromElement(e);
      },
      help: 'Function to extract from a DOM Element.',
      documentation: "Function to extract a value from a DOM Element."
    },
    {
      name: 'propertyToJSON',
      defaultValue: function(visitor, output, o) {
        if ( ! this.transient ) output[this.name] = visitor.visit(o[this.name]);
      },
      help: 'Function to extract from a DOM Element.',
      documentation: "Function to extract a value from a DOM Element."
    },
    {
      name: 'autocompleter',
      subType: 'Autocompleter',
      help: 'Name or model for the autocompleter for this property.',
      documentation: function() { /*
        Name or $$DOC{ref:'Model'} for the $$DOC{ref:'Autocompleter'} for this $$DOC{ref:'Property'}.
      */}
    },
    {
      name: 'install',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'foam.ui.FunctionView',
      defaultValue: '',
      help: "A function which installs additional features into the Model's prototype.",
      documentation: function() { /*
        A function which installs additional features into our $$DOC{ref:'Model'} prototype.
        This allows extra language dependent features or accessors to be added to instances
        for use in code.
      */}
    },
    {
      name: 'exclusive',
      type: 'Boolean',
      view: 'foam.ui.BooleanView',
      defaultValue: true,
      help: 'Indicates if the property can only have a single value.',
      documentation: function() { /*
        Indicates if the $$DOC{ref:'Property'} can only have a single value.
      */}
    },
    {
      name: 'memorable',
      type: 'Boolean',
      help: 'True if this value should be included in a memento for this object.',
      defaultValue: false
    },
  ],

  methods: {
    partialEval: function() { return this; },
    f: function(obj) { return obj[this.name] },
    compare: function(o1, o2) {
      return this.compareProperty(this.f(o1), this.f(o2));
    },
    readResolve: function() {
      return this.modelId ?
        this.X.lookup(this.modelId)[constantize(this.name)] : this;
    },
    toSQL: function() { return this.name; },
    toMQL: function() { return this.name; },
    toBQL: function() { return this.name; },
    cloneProperty: function(/* this=prop, */ value) {
      return ( value && value.clone ) ? value.clone() : value;
    },
    deepCloneProperty: function(/* this=prop, */ value) {
      return ( value && value.deepClone ) ? value.deepClone() : value;
    },
    initPropertyAgents: function(proto, fastInit) {
      var prop   = this;
      var name   = prop.name;
      var name$_ = prop.name$_;

      if ( ! fastInit ) proto.addInitAgent(
        (this.postSet || this.setter) ? 9 : 0,
        name + ': ' + (this.postSet || this.setter ? 'copy arg (postSet)' : 'copy arg'),
        function(o, X, m) {
          if ( ! m ) return;
          if ( m.hasOwnProperty(name)   ) o[name]   = m[name];
          if ( m.hasOwnProperty(name$_) ) o[name$_] = m[name$_];
        }
      );

      if ( this.dynamicValue ) {
        var dynamicValue = prop.dynamicValue;
        if ( Array.isArray(dynamicValue) ) {
          proto.addInitAgent(10, name + ': dynamicValue', function(o, X) {
            Events.dynamic(
                dynamicValue[0].bind(o),
                function() { o[name] = dynamicValue[1].call(o); },
                X || this.X);
          });
        } else {
          proto.addInitAgent(10, name + ': dynamicValue', function(o, X) {
            Events.dynamic(
                dynamicValue.bind(o),
                function(value) { o[name] = value; },
                X || this.X);
          });
        }
      }

      if ( this.factory ) {
        proto.addInitAgent(11, name + ': factory', function(o, X) {
          if ( ! o.hasOwnProperty(name) ) o[name];
        });
      }
    }
  },

  //templates: [
  //  {
  //    model_: 'Template',
  //    name: 'closureSource',
  //    description: 'Closure Externs JavaScript Source',
  //    template:
  //    '/**\n' +
  //      ' * @type {<%= this.javascriptType %>}\n' +
  //      ' */\n' +
  //      '<%= arguments[1] %>.prototype.<%= this.name %> = undefined;'
  //  }
  //],

  toString: function() { return "Property"; }
};


Model.methods = {
  getProperty:              BootstrapModel.getProperty,
  getAction:                BootstrapModel.getAction,
  hashCode:                 BootstrapModel.hashCode,
  buildPrototype:           BootstrapModel.buildPrototype,
  addTraitToModel_:         BootstrapModel.addTraitToModel_,
  buildProtoImports_:       BootstrapModel.buildProtoImports_,
  buildProtoProperties_:    BootstrapModel.buildProtoProperties_,
  buildProtoMethods_:       BootstrapModel.buildProtoMethods_,
  getPrototype:             BootstrapModel.getPrototype,
  isSubModel:               BootstrapModel.isSubModel,
  isInstance:               BootstrapModel.isInstance,
  getAllRequires:           BootstrapModel.getAllRequires,
  arequire:                 BootstrapModel.arequire,
  getMyFeature:             BootstrapModel.getMyFeature,
  getRawFeature:            BootstrapModel.getRawFeature,
  getAllMyRawFeatures:      BootstrapModel.getAllMyRawFeatures,
  getFeature:               BootstrapModel.getFeature,
  getAllRawFeatures:        BootstrapModel.getAllRawFeatures,
  atest:                    BootstrapModel.atest,
  getRuntimeProperties:     BootstrapModel.getRuntimeProperties
};

// This is the coolest line of code that I've ever written
// or ever will write. Oct. 4, 2011 -- KGR
Model = Model.create(Model);
Model.model_ = Model;
Model.create = BootstrapModel.create;

Property = Model.create(Property);

// Property properties are still Bootstrap Models, so upgrade them.
var ps = Property.getRuntimeProperties();
for ( var i = 0 ; i < ps.length ; i++ ) {
  Property[constantize(ps[i].name)] = ps[i] = Property.create(ps[i]);
}

USED_MODELS.Property = true;
USED_MODELS.Model = true;
