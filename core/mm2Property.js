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

GLOBAL.Property = {
  __proto__: BootstrapModel,
  instance_: {},

  name:  'Property',
  implements: ['ExprProtocol'],
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
      swiftType: 'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      mode: 'read-only', // TODO: this should be 'final' when available
      help: 'The coding identifier for the property.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} names should use camelCase staring with a lower case letter.
         */}
    },
    {
      name: 'labels',
      type: 'Array',
      subType: 'String',
      labels: ['debug', 'javascript'],
    },
    {
      name: 'label',
      swiftType: 'String',
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
      name: 'translationHint',
      type: 'String',
      required: false,
      documentation: 'Used to describe the property for translators.',
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
      name: 'swiftDefaultValue',
      labels: ['swift', 'compiletime'],
    },
    {
      name: 'javaDefaultValue',
      labels: ['java', 'compiletime'],
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
      labels: ['compiletime', 'java'],
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The java type that represents the type of this property.',
      documentation: function() { /* When running FOAM in a Java environment, specifies the Java type
        or class to use. */}
    },
    {
      name: 'javascriptType',
      type: 'String',
      labels: ['compiletime', 'javascript'],
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
      labels: ['compiletime', 'swift'],
      defaultValue: 'AnyObject?',
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
      // type: 'Array[String]',
      labels: ['javascript'],
      view: 'foam.ui.StringArrayView',
      factory: function() { return []; },
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
      name: 'subKey',
      // type: 'EXPR',
      labels: ['javascript'],
      displayWidth: 20,
      defaultValue: 'ID',
      help: 'The foreign key that this property references.',
      documentation: function() {/*
        Used to project whole objects of $$DOC{ref:'.subType'} into the value
        of this Property. For foreign key properties, this is the foreign property.
        For eg. an email property, when the subType is a whole Contact object,
        subKey will be EMAIL.
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
      // For U2, replaces hidden
      name: 'visibility',
      choices: [ 'rw', 'final', 'ro', 'hidden' ],
      postSet: function(_, v) { if ( 'hidden' === v ) this.hidden = true; }
    },
    {
      name: 'hidden',
      type: 'Boolean',
      view: 'foam.ui.BooleanView',
      defaultValue: false,
      postSet: function(old, hidden) { if ( (! old) && hidden ) this.visibility = 'hidden'; },
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
      type: 'Int',
      displayWidth: 8,
      displayHeight: 1,
      defaultValue: 30,
      help: 'The display width of the property.',
      documentation: function() { /*
        A width suggestion for views that automatically render the $$DOC{ref:'Property'}.
      */}
    },
    {
      name: 'displayHeight',
      type: 'Int',
      displayWidth: 8,
      displayHeight: 1,
      defaultValue: 1,
      help: 'The display height of the property.',
      documentation: function() { /*
        A height suggestion for views that automatically render the $$DOC{ref:'Property'}.
      */}
    },
    {
//      type: 'ViewFactory',
      name: 'view',
      // type: 'view',
      labels: ['javascript'],
      defaultValue: 'foam.ui.TextFieldView',
      help: 'View component for the property.',
      documentation: function() { /*
        The default $$DOC{ref:'foam.ui.View'} to use when rendering the $$DOC{ref:'Property'}.
        Specify a string or an object with factory_ and other properties specified.
      */}
    },
    {
//      type: 'ViewFactory',
      name: 'toPropertyE',
      labels: ['javascript'],
      defaultValue: function toPropertyE(X) {
        var e = this.displayHeight > 1 ?
          X.lookup('foam.u2.MultiLineTextField').create(null, X) :
          X.lookup('foam.u2.TextField').create(null, X)    ;

        e.attrs({size: this.displayWidth});

        return e;
      },
      adapt: function(_, nu) {
        if ( typeof nu === 'string' ) {
          var f = function(X) { return X.lookup(nu).create(null, X); };
          f.toString = function() { return "'"+nu+"'"; };
          return f;
        } else {
          return nu;
        }
      },
    },
    {
//      type: 'ViewFactory',
      name: 'detailView',
      // type: 'view',
      labels: ['javascript'],
      defaultValueFn: function() { return this.view; },
      help: 'View component for the property when rendering within a DetailView.',
      documentation: function() { /*
        The default $$DOC{ref:'foam.ui.View'} to use when rendering the $$DOC{ref:'Property'}
        as a part of a $$DOC{ref:'foam.ui.DetailView'}. Specify a string or an object with
        factory_ and other properties specified.
      */}
    },
    {
//      type: 'ViewFactory',
      name: 'citationView',
      // type: 'view',
      labels: ['javascript'],
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
      labels: ['compiletime', 'swift'],
      defaultValueFn: function() { return this.view.substring(this.view.lastIndexOf('.')+1); },
      help: 'The default view name for this property in swift.'
    },
    {
//      type: 'Function',
      name: 'detailViewPreRow',
      labels: ['javascript'],
      defaultValue: function() { return ""; },
      help: 'Inject HTML before row in DetailView.',
      documentation: function() { /*
        An optional function to
        inject HTML before the row in $$DOC{ref:'foam.ui.DetailView'}.
      */}
    },
    {
//      type: 'Function',
      name: 'detailViewPostRow',
      labels: ['javascript'],
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
      labels: ['javascript'],
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
      labels: ['javascript'],
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
      labels: ['javascript'],
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
      labels: ['javascript'],
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
      labels: ['javascript'],
      required: false,
      view: 'foam.ui.FunctionView',
      help: 'Factory for creating the initial value. Only called when the property is accessed for the first time.',
      documentation: function() { /*
        Like the $$DOC{ref:'.factory'} function, but only evaulated when this $$DOC{ref:'Property'} is
        accessed for the first time.
      */}
    },
    {
      name: 'regex',
      labels: ['javascript'],
    },
    {
      name: 'validate',
      type: 'Function',
      labels: ['javascript'],
      required: false,
      view: 'foam.ui.FunctionView',
      help: 'Function for validating property value.',
      preSet: function(_, f) {
        if ( ! f.dependencies ) {
          var str = f.toString();
          var deps = str.match(/^function[ _$\w]*\(([ ,\w]*)/)[1];
          if ( deps )
            deps = deps.split(',').map(function(name) { return name.trim(); });
          else
            deps = [];

          var f2 = function() {
            var args = [];
            for ( var i = 0 ; i < deps.length ; i++ )
              args.push(this[deps[i]]);
            return f.apply(this, args);
          };

          f2.dependencies = deps;
          f2.toString = function() { return f.toString(); };

          return f2;
        }
        return f;
      },
      compareProperty: function(o1, o2) {
        return o1.toString() !== o2.toString();
      },
      documentation: function() { /*
        Arguments to the validate function should be named after the properties
        of this object. They will be passed in when the validate() function is
        run. Return an error string if validation fails.
      */}
    },
    {
      name: 'swiftValidate',
      swiftType: 'FoamFunction?',
      labels: ['swift'],
      preSet: function(_, f) {
        if (typeof f !== "function") return f;
        var str = f.toString();
        var deps = str.
          match(/^function[ _$\w]*\(([ ,\w]*)/)[1].
          split(',').
          map(function(name) { return name.trim(); });
        return {
          code: multiline(f),
          deps: deps,
        };
      },
    },
    {
      name: 'javaAdapt',
      type: 'String',
      labels: ['compiletime', 'java'],
      adapt: function(_, n) {
        if ( typeof n == "function" ) return multiline(n);
        return n;
      }
    },
    {
      name: 'javaPreSet',
      type: 'String',
      labels: ['compiletime', 'java'],
      adapt: function(_, n) {
        if ( typeof n == "function" ) return multiline(n);
        return n;
      }
    },
    {
      name: 'javaPostSet',
      type: 'String',
      labels: ['compiletime', 'java'],
      adapt: function(_, n) {
        if ( typeof n == "function" ) return multiline(n);
        return n;
      }
    },
    {
      name: 'javaFactory',
      type: 'String',
      labels: ['compiletime', 'java'],
      adapt: function(_, n) {
        if ( typeof n == "function" ) return multiline(n);
        return n;
      }
    },
    {
      name: 'javaLazyFactory',
      type: 'String',
      labels: ['compiletime', 'java'],
      adapt: function(_, n) {
        if ( typeof n == "function" ) return multiline(n);
        return n;
      }
    },
    {
      name: 'swiftAdapt',
      type: 'String',
      labels: ['compiletime', 'swift'],
      defaultValue: function() {/*
        <% if (this.swiftType == 'AnyObject?') { %>
          return newValue
        <% } else { %>
          return newValue as! <%= this.swiftType %>
        <% } %>
      */},
    },
    {
      name: 'swiftPreSet',
      type: 'String',
      labels: ['compiletime', 'swift'],
      defaultValue: 'return newValue',
    },
    {
      name: 'swiftPostSet',
      type: 'String',
      labels: ['compiletime', 'swift'],
      defaultValue: '//swiftPostSet goes here.',
    },
    {
      name: 'swiftGetter',
      type: 'String',
      labels: ['compiletime', 'swift'],
    },
    {
      name: 'swiftFactory',
      type: 'String',
      labels: ['compiletime', 'swift'],
    },
    {
      name: 'swiftLazyFactory',
      type: 'String',
      labels: ['compiletime', 'swift'],
    },
    {
      name: 'getter',
      type: 'Function',
      labels: ['javascript'],
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
      labels: ['javascript'],
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
      labels: ['javascript'],
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
      labels: ['javascript'],
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
      labels: ['javascript'],
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
      labels: ['javascript'],
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
      labels: ['javascript'],
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
    {
      name: 'helpTranslationHint',
      type: 'String',
      help: 'The translation hint for the help property.',
    },
    DocumentationBootstrap,
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      defaultValue: 0,
      required: false,
      help: 'The protobuf tag number for this field.',
      documentation: 'The protobuf tag number for this field.'
    },
    {
      name: 'actionFactory',
      type: 'Function',
      labels: ['javascript'],
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
      labels: ['javascript'],
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
      labels: ['javascript'],
      defaultValue: function(s) { return s; },
      help: 'Function to extract value from a String.'
    },
    {
      name: 'fromElement',
      labels: ['javascript'],
      defaultValue: function propertyFromElement(e, p) {
        if ( ! p.type || ! this.X.lookup || p.type === 'String' ) {
          this[p.name] = p.fromString(e.innerHTML);
          return;
        }
        var model = this.X.lookup(p.type);
        if ( ! model ) {
          this[p.name] = p.fromString(e.innerHTML);
          return;
        }
        var o = model.create();
        if ( ! o.fromElement ){
          this[p.name] = p.fromString(e.innerHTML);
          return;
        }
        this[p.name] = o.fromElement(e);
      },
      help: 'Function to extract from a DOM Element.',
      documentation: "Function to extract a value from a DOM Element."
    },
    {
      name: 'propertyToJSON',
      labels: ['javascript'],
      defaultValue: function(visitor, output, o) {
        if ( ! this.transient ) output[this.name] = visitor.visit(o[this.name]);
      },
      help: 'Function to extract from a DOM Element.',
      documentation: "Function to extract a value from a DOM Element."
    },
    {
      name: 'autocompleter',
      subType: 'Autocompleter',
      labels: ['javascript'],
      help: 'Name or model for the autocompleter for this property.',
      documentation: function() { /*
        Name or $$DOC{ref:'Model'} for the $$DOC{ref:'Autocompleter'} for this $$DOC{ref:'Property'}.
      */}
    },
    {
      name: 'install',
      type: 'Function',
      labels: ['javascript'],
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
    {
      name: 'attribute',
      type: 'Boolean',
      help: 'True if this property is settable as an element attribute.',
      defaultValue: false
    }
  ],

  methods: [
    function partialEval() { return this; },
    {
      name: 'f',
      code: function(obj) { return obj[this.name] },
      args: [
        {
          name: 'obj',
          swiftType: 'AnyObject?',
        },
      ],
      swiftReturnType: 'AnyObject?',
      swiftCode: function() {/*
        if obj == nil { return nil }
        if let fobj = obj as? FObject {
          return fobj.get(self.name)
        }
        return nil
      */},
    },
    {
      name: 'compare',
      code: function(o1, o2) {
        return this.compareProperty(this.f(o1), this.f(o2));
      },
      args: [
        {
          name: 'o1',
          swiftIsMutable: true,
          swiftType: 'AnyObject?',
        },
        {
          name: 'o2',
          swiftIsMutable: true,
          swiftType: 'AnyObject?',
        },
      ],
      swiftReturnType: 'Int',
      swiftCode: function() {/*
        o1 = self.f(o1)
        o2 = self.f(o2)
        if o1 === o2 { return 0 }
        if o1 == nil && o2 == nil { return 0 }
        if o1 == nil { return -1 }
        if o2 == nil { return 1 }
        if o1!.isEqual(o2) { return 0 }
        return o1?.hashValue > o2?.hashValue ? 1 : -1
      */}
    },
    function readResolve() {
      return this.modelId ?
        this.X.lookup(this.modelId)[constantize(this.name)] : this;
    },
    function toSQL() { return this.name; },
    function toMQL() { return this.name; },
    function toBQL() { return this.name; },
    function cloneProperty(value, cloneArgs) {
      cloneArgs[this.name] = ( value && value.clone ) ? value.clone() : value;
    },
    function deepCloneProperty(value, cloneArgs) {
      cloneArgs[this.name] = ( value && value.deepClone ) ? value.deepClone() : value;
    },
    function exprClone() {
      return this;
    },
    function dot(nextProp) {
      var PropertySequence = this.X.lookup('foam.mlang.PropertySequence');
      if ( ! PropertySequence ) {
        console.warn('Missing foam.mlang.PropertySequence for Property.dot()');
        return this;
      }
      if ( PropertySequence.isInstance(this) ) {
        if ( this.next_ ) this.next_ = this.next_.dot(nextProp);
        else              this.next_ = nextProp;
        return this;
      } else {
        return PropertySequence.xbind({ next_: nextProp }).create(this, this.Y);
      }
    },
    function initPropertyAgents(proto, fastInit) {
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
            Events.dynamicFn(
                dynamicValue[0].bind(o),
                function() { o[name] = dynamicValue[1].call(o); },
                X || this.X);
          });
        } else {
          proto.addInitAgent(10, name + ': dynamicValue', function(o, X) {
            Events.dynamicFn(
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
    },
    function toE(opt_X) {
      var X = opt_X || this.X;
      return X.lookup('foam.u2.PropertyView').create({prop: this, view: this.toPropertyE(X)}, X);
    }
  ],

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

Model.methods = {};
"createMethod_ getProperty getAction hashCode buildPrototype addTraitToModel_ buildProtoImports_ buildProtoProperties_ buildProtoMethods_ getPrototype isSubModel isInstance getAllRequires arequire getMyFeature getRawFeature getAllMyRawFeatures getFeature getAllRawFeatures atest getRuntimeProperties getRuntimeActions create".split(' ').forEach(function(k) { Model.methods[k] = BootstrapModel[k]; });


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
