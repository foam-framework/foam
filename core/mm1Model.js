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
var BinaryProtoGrammar;

var DocumentationBootstrap = {
  name: 'documentation',
  type: 'Documentation',
  view: 'DetailView',
  help: 'Documentation associated with this entity.',
  documentation: "The developer documentation for this $$DOC{ref:'.'}. Use a $$DOC{ref:'DocModelView'} to view documentation.",
  setter: function(nu) {
    this.instance_.documentation = nu;
  },
  getter: function() {
    var doc = this.instance_.documentation;
    if (doc && typeof Documentation != "undefined" && Documentation // a source has to exist (otherwise we'll return undefined below)
        && (  !doc.model_ // but we don't know if the user set model_
           || !doc.model_.getPrototype // model_ could be a string
           || !Documentation.isInstance(doc) // check for correct type
        ) ) {
      // So in this case we have something in documentation, but it's not of the
      // "Documentation" model type, so FOAMalize it.
      if (doc.body) {
        this.instance_.documentation = Documentation.create( doc );
      } else {
        this.instance_.documentation = Documentation.create({ body: doc });
      }
    }
    // otherwise return the previously FOAMalized model or undefined if nothing specified.
    //console.log("getting ", this.instance_.documentation)
    return this.instance_.documentation;
  }
}



var Model = {
  __proto__: BootstrapModel,

  name:  'Model',
  plural:'Models',
  help:  "Describes the attributes and properties of an entity.",

  documentation: {
    body: function() { /*
      <p>In FOAM, $$DOC{ref:'Model'} is the basic unit for describing data and behavior.
      $$DOC{ref:'Model'} itself is a $$DOC{ref:'Model'}, since it defines what can be defined,
      but does so within the rules it is defining.</p>

      <p>In javascript code, <code>YourModel.create(...)</code> creates an instance of
      your model. This is context dependent, so generally you will be calling
      <code>this.X.YourModel.create({...})</code>. If this is too much typing, you
      can create aliases for other $$DOC{ref:'Model',usePlural:true} in the
      $$DOC{ref:'Model.imports'} property. </p>

      <p>Note:
      <ul>
        <li>Your own models will extend $$DOC{ref:'Model'}, or extend
        a model that extends $$DOC{ref:'Model'}.</li>

        <li>The definition of your model is a $$DOC{ref:'Model'} instance
        (with YourModel.model_ === Model), while instances
        of your model have your new type (myInstance.model_ === YourModel). This
        differs from other object-oriented systems where the definition of a class
        and instances of the class are completely separate entities. In FOAM everything
        is a $$DOC{ref:'Model'}, including itself.</li>

        <li>Creating a subcontext and replacing X.YourModel with a different model (such as
        YourTestModelMock created specifically for testing) will give you seamless dependency
        injection. See the
        $$DOC{ref:'DevDocumentation_Context..documentation.chapters.intro', text:'Context documentation'}
        for more information.</li>
      </ul>
      </p>
      <p>For more information about how $$DOC{ref:'Model',usePlural:true} are instantiated,
      see $$DOC{ref:'DevDocumentation_Welcome..documentation.chapters.modelsAtRuntime',text:'Welcome to Models at Runtime'}.
    */ }
  },

  tableProperties: [
    'package', 'name', 'label', 'plural'
  ],

  properties: [
    {
      name: 'id'
    },
    {
      name:  'sourcePath',
      help: 'Source location of this Model.',
      defaultValue: ''
    },
    {
      name:  'abstract',
      type: 'boolean',
      defaultValue: false,
      help: 'If the java class is abstract.',
      documentation: function() { /* When running FOAM in a Java environment, specifies whether the
        Java class built from this $$DOC{ref:'Model'} should be declared abstract.*/}
    },
    {
      name: 'package',
      help: 'Package that this Model belongs to.',
      defaultValue: '',
      postSet: function(_, p) { return this.id = p ? p + '.' + this.name : this.name; },
      documentation: function() { /*
        <p>The package (or namespace) in which the $$DOC{ref:'.'} belongs. The
        dot-separated package name is prepended to the $$DOC{ref:'.'} name.</p>
        <p>For example: </p>
        <p><code>MODEL ({ name: 'Train', package: 'com.company.modules' });<br/>
                 ...<br/>
                 // when creating an instance of the model (your $$DOC{ref:'DevDocumentation_Context', text:'context'}
                        is this.X):<br/>
                 this.X.com.company.modules.Train.create();<br/>
        </code></p>
        <p>Use $$DOC{ref:'Model.imports'} to avoid typing the package name repeatedly.</p>
        <p>When running FOAM in a Java environment, specifies the
        package in which to declare the Java class built from this $$DOC{ref:'Model'}.
        </p>
        */}
    },
    {
      name:  'name',
      type:  'String',
      postSet: function(_, n) { return this.id = this.package ? this.package + '.' + n : n; },
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the entity.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'Model.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'Model'} definition names should use CamelCase starting with a capital letter, while
        $$DOC{ref:'Property',usePlural:true}, $$DOC{ref:'Method',usePlural:true}, and other features
        defined inside a $$DOC{ref:'Model'} should use camelCase staring with a lower case letter.
         */}
    },
    {
      name: 'exportKey',
      type: 'String',
      required: false,
      hidden: true,
      defaultValue: '',
      help: 'Key to export value as, if exported.',
      documentation: function() {/* */}
    },
    {
      name: 'label',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      help: 'The display label for the entity.',
      documentation: function() { /* A human readable label for the $$DOC{ref:'Model'}. May
        contain spaces or other odd characters.
         */}
    },
    {
      name: 'javaClassName',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return (this.abstract ? 'Abstract' : '') + this.name; },
      help: 'The Java classname of this Model.',
      documentation: function() { /* When running FOAM in a Java environment, specifies the name of the
        Java class to be built from this $$DOC{ref:'Model'}.*/}
    },
    {
      name: 'extendsModel',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The parent model of this model.',
      documentation: function() { /*
        <p>Specifies the $$DOC{ref:'Model.name'} of the $$DOC{ref:'Model'} that
        this model should inherit from. Like object-oriented inheritance, this $$DOC{ref:'Model'} will gain the
        $$DOC{ref:'Property',usePlural:true}, $$DOC{ref:'Method',usePlural:true}, and other features
        defined inside the $$DOC{ref:'Model'} you extend.</p>
        <p>You may override features by redefining them in your $$DOC{ref:'Model'}.</p>
        <p>Like most inheritance schemes, instances of your $$DOC{ref:'Model'} may be used in place of
        instances of the $$DOC{ref:'Model'} you extend.</p>
         */}
    },
    {
      name: 'plural',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name + 's'; },
      help: 'The plural form of this model\'s name.',
      documentation: function() { /* The plural form of $$DOC{ref:'Model.name'}, for use in documentation
        and other human-readable areas. */}
    },
    {
      name: 'version',
      type: 'int',
      defaultValue: 1,
      help: 'Version number of model.',
      documentation: function() { /* For backwards compatibility, major changes should be marked by
        incrementing the version number. */}

    },
    {
      name: 'ids',
      label: 'Key Properties',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValueFn: function() {
        var id = this.getProperty('id');
        if ( id ) return ['id'];
        return this.properties.length ? [this.properties[0].name] : [];
      },
      help: 'Properties which make up unique id.',
      documentation: function() { /* An optional list of names of $$DOC{ref:'Property',usePlural:true} from
        this $$DOC{ref:'Model'}, which can be used together as a primary key. The $$DOC{ref:'Property',usePlural:true},
        when combined, should uniquely identify an instance of your $$DOC{ref:'Model'}.
        $$DOC{ref:'DAO',usePlural:true} that support indexing can use this as a suggestion on how to index
        instances of your $$DOC{ref:'Model'}. */}

    },
    {
      name: 'requires',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValueFn: function() { return []; },
      help: 'Model imports.',
      documentation: function() { /*
          <p>List of model imports, as strings of the form:
            <code>'Model-Path [as Alias]'</code>.</p>
          <p>Aliases are created on your instances that reference the full
            path of the model, taking it from your this.X
            $$DOC{ref:'DevDocumentation_Context', text:'context'}.</p>
          <p>For example:</p>
          <p><code>requires: [ 'mypackage.DataLayer.BigDAO',
                   'mypackage.UI.SmallTextView as TextView' ]<br/>
                   ...<br/>
                   // in your Model's methods: <br/>
                  this.BigDAO.create();   // equivalent to this.X.mypackage.DataLayer.BigDAO.create()<br/>
                  this.TextView.create(); // equivalent to this.X.mypackage.UI.SmallTextView.create()<br/>
                  </code></p>
        */}
    },
    {
      name: 'imports',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValueFn: function() { return []; },
      help: 'Context imports.',
      documentation: function() { /*
          <p>List of context items to import, as strings of the form:
          <code>Key [as Alias]</code>.</p>
          <p>Imported items are installed into your $$DOC{ref:'Model'}
          as pseudo-properties, using their $$DOC{ref:'Model.name', text:'name'}
          or the alias specified here.</p>
          <p><code>imports: [ 'productList.selectedItem',
                   'productList.selectionDAO as selectedProductDAO' ]<br/>
                   ...<br/>
                   // in your Model's methods: <br/>
                  this.selectedItem.get();          // equivalent to this.X.productList.selectedItem.get()<br/>
                  this.selectedProductDAO.select(); // equivalent to this.X.productList.selectionDAO.select()<br/>
                  </code></p>
        */}
    },
    {
      name: 'exports',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValueFn: function() { return []; },
      help: 'Context exports.',
      documentation: function() { /*
          <p>List of $$DOC{ref:'Property',usePlural:true} to export to your sub-context,
           as strings of the form:
          <code>PropertyName [as Alias]</code>.</p>
          <p>Properties you wish to share with other instances you create
            (like sub-$$DOC{ref:'View',usePlural:true} or $$DOC{ref:'DAO',usePlural:true})
            can be exported automatically by listing them here. Your this.X is replaced with
            a sub-context, so parent contexts in instances that have created do not
            see exported properties.</p>
          <p><code>exports: [ 'myProperty', 'name as parentName' ]<br/>
                  ...<br/>
                  // in your Model's methods: <br/>
                  this.selectedItem.get();          // equivalent to this.X.productList.selectedItem.get()<br/>
                  this.selectedProductDAO.select(); // equivalent to this.X.productList.selectionDAO.select()<br/>
                  </code></p>
        */}
    },
    {
      name: 'implements',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValueFn: function() { return []; },
      help: 'Interfaces implemented by this Model.',
      documentation: function() { /* $$DOC{ref:'Interface',usePlural:true} implemented by this $$DOC{ref:'Model'} .*/}
    },
    {
      name: 'traits',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValueFn: function() { return []; },
      help: 'Traits to mix-into this Model.',
      documentation: function() { /* Traits allow you to mix extra features into your $$DOC{ref:'Model'}
         through composition, avoiding inheritance where unecesssary. */}
    },
    {
      name: 'tableProperties',
      type: 'Array[String]',
      view: 'StringArrayView',
      displayWidth: 70,
      factory: function() {
        return this.properties.map(function(o) { return o.name; });
      },
      help: 'Properties to be displayed in table view. Defaults to all properties.',
      documentation: function() { /* Indicates the $$DOC{ref:'Property',usePlural:true} to display when viewing a list of instances
        of this $$DOC{ref:'Model'} in a table or other $$DOC{ref:'Property'} viewer. */}
    },
    {
      name: 'searchProperties',
      type: 'Array[String]',
      view: 'StringArrayView',
      displayWidth: 70,
      defaultValueFn: function() {
        return this.tableProperties;
      },
      help: 'Properties display in a search view. Defaults to table properties.',
      documentation: function() { /* Indicates the $$DOC{ref:'Property',usePlural:true} to display when viewing
        of this $$DOC{ref:'Model'} in a search view. */}
    },
    {
      name: 'properties',
      type: 'Array[Property]',
      subType: 'Property',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Properties associated with the entity.',
      preSet: function(oldValue, newValue) {
        if ( ! Property ) return;
        // Convert Maps to Properties if required
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var p = newValue[i];

          if ( typeof p === 'string' ) newValue[i] = p = { name: p };

          if ( ! p.model_ ) {
            p = newValue[i] = Property.create(p);
          } else if ( typeof p.model_ === 'string' ) {
            p = newValue[i] = FOAM(p);
          }

          // create property constant
          this[p.name.constantize()] = newValue[i];
        }

        this.propertyMap_ = null;

        return newValue;
      },
      documentation: function() { /*
        <p>The $$DOC{ref:'Property',usePlural:true} of a $$DOC{ref:'Model'} act as data members
          and connection points. A $$DOC{ref:'Property'} can store a modelled value, and bind
          to other $$DOC{ref:'Property',usePlural:true} for easy reactive programming.</p>
        <p>Note that, like $$DOC{ref:'Model'} being a $$DOC{ref:'Model'} itself, the
          $$DOC{ref:'Model.properties'} feature of all models is itself a $$DOC{ref:'Property'}.
        */}
    },
    {
      name: 'actions',
      type: 'Array[Action]',
      subType: 'Action',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Actions associated with the entity.',
      preSet: function(_, newValue) {
        if ( ! Action ) return newValue;

        // Convert Maps to Properties if required
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var p = newValue[i];

          if ( ! p.model_ ) {
            newValue[i] = Action.create(p);
          } else if ( typeof p.model_ === 'string' ) {
            newValue[i] = FOAM(p);
          }

          // create property constant
          this[p.name.constantize()] = newValue[i];
        }

        return newValue;
      },
      documentation: function() { /*
        <p>$$DOC{ref:'Action',usePlural:true} implement a behavior and attach a label, icon, and typically a
        button-like $$DOC{ref:'View'} or menu item to activate the behavior.</p>
        */}

    },
    {
      name: 'constants',
      type: 'Array[Constant]',
      subType: 'Constant',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Constants associated with the entity.',
      preSet: function(_, newValue) {
        if ( ! Constant ) return newValue;

        if ( Array.isArray(newValue) ) return JSONUtil.arrayToObjArray(this.X, newValue, Constant);

        // convert a map of values to an array of Constant objects
        var constants = [];

        for ( var key in newValue ) {
          var oldValue = newValue[key];

          var constant = Constant.create({
            name:  key,
            value: oldValue
          });

          constants.push(constant);
        }

        return constants;
      }
    },
    {
      name: 'methods',
      type: 'Array[Method]',
      subType: 'Method',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Methods associated with the entity.',
      preSet: function(_, newValue) {
        if ( ! Method ) return newValue;

        if ( Array.isArray(newValue) ) return JSONUtil.arrayToObjArray(this.X, newValue, Method);

        // convert a map of functions to an array of Method instances
        var methods = [];

        for ( var key in newValue ) {
          var oldValue = newValue[key];

          var method   = Method.create({
            name: key,
            code: oldValue
          });

          // Model Feature object.
          if ( typeof oldValue == 'function' ) {
            if ( Arg ) {
              method.args = oldValue.toString().match(/^function[ _$\w]*\(([ ,\w]*)/)[1].split(',').map(function(name) {
                return Arg.create({name: name.trim()});
              });
            }
          } else {
            console.warn('Constant defined as Method: ', this.name + '.' + key);
            debugger;
          }

          methods.push(method);
        }

        return methods;
      },
      documentation: function() { /*
        <p>$$DOC{ref:'Method',usePlural:true} contain code that runs in the instance's scope, so code
        in your $$DOC{ref:'Method'} has access to the other $$DOC{ref:'Property',usePlural:true} and
        features of your $$DOC{ref:'Model'}.</p>
        <ul>
          <li><code>this.propertyName</code> gives the value of a $$DOC{ref:'Property'}</li>
          <li><code>this.propertyName$</code> is the binding point for the $$DOC{ref:'Property'}. Assignment
              will bind bi-directionally, or <code>Events.follow(src, dst)</code> will bind from
              src to dst.</li>
          <li><code>this.methodName</code> calls another $$DOC{ref:'Method'} of this
                  $$DOC{ref:'Model'}</li>
          <li><code>this.SUPER()</code> calls the $$DOC{ref:'Method'} implementation from the
                    base $$DOC{ref:'Model'} (specified in $$DOC{ref:'Model.extendsModel'}). Calling
                    <code>this.SUPER()</code> is extremely important in your <code>init()</code>
                     $$DOC{ref:'Method'}, if you provide one.</li>
        </ul>
        <p>In JSON, $$DOC{ref:'Model.methods'} may be specified as a dictionary:</p>
        <p><code>methods: { methodName: function(arg1) {  ...your code here... }, anotherMethod: ... }</code></p>
        */}
    },
    {
      name: 'listeners',
      type: 'Array[Method]',
      subType: 'Method',
      view: 'ArrayView',
      factory: function() { return []; },
      preSet: function(_, newValue) {
        if ( Array.isArray(newValue) ) return JSONUtil.arrayToObjArray(this.X, newValue, Method);
        return newValue;
      },
      defaultValue: [],
      help: 'Event listeners associated with the entity.',
      documentation: function() { /*
        <p>The $$DOC{ref:'Model.listeners'} $$DOC{ref:'Property'} contains a list of $$DOC{ref:'Method',usePlural:true},
          but is separate and differs from the $$DOC{ref:'Model.methods'} $$DOC{ref:'Property'} in how the scope
          is handled. For a listener, <code>this</code> is bound to your instance, so when the listener is
          invoked by an event from elsewhere in the system it can still access the features of its $$DOC{ref:'Model'}
          instance.</p>
        <p>In javascript, listeners are connected using
          <code>OtherProperty.addListener(myModelInstance.myListener);</code></p>
      */}
    },
    /*
      {
      name: 'topics',
      type: 'Array[topic]',
      subType: 'Topic',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Event topics associated with the entity.'
      },
    */
    {
      name: 'templates',
      type: 'Array[Template]',
      subType: 'Template',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      postSet: function(_, templates) {
        TemplateUtil.modelExpandTemplates(this, templates);
      },
      //         defaultValueFn: function() { return []; },
      help: 'Templates associated with this entity.',
      documentation: function() { /*
        The $$DOC{ref:'Template',usePlural:true} to process and install into instances of this
        $$DOC{ref:'Model'}. $$DOC{ref:'View',usePlural:true} created inside each $$DOC{ref:'Template'}
        using the $$DOC{ref:'.templates',text:'$$propertyName{args}'} view creation tag become available
        as <code>myInstance.propertyNameView</code>.
        */}
    },
    {
      name: 'models',
      type: 'Array[Model]',
      subType: 'Model',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Sub-models embedded within this model.',
      documentation: function() { /*
        $$DOC{ref:'Model',usePlural:true} may be nested inside one another to better organize them.
        $$DOC{ref:'Model',usePlural:true} declared this way do not gain special access to their containing
        $$DOC{ref:'Model'}, but are only accessible through their container.
        */}
    },
    {
      name: 'tests',
      label: 'Unit Tests',
      type: 'Array[Unit Test]',
      subType: 'UnitTest',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Unit tests associated with this model.',
      documentation: function() { /*
          Create $$DOC{ref:'UnitTest',usePlural:true} that should run to test the functionality of this
          $$DOC{ref:'Model'} here.
        */}
    },
    {
      name: 'relationships',
      subType: 'Relationship',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Relationships of this model to other models.',
      preSet: function(_, newValue) {
        if ( ! Relationship ) return newValue;

        // Convert Maps to Relationships if required
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var p = newValue[i];

          if ( ! p.model_ ) {
            p = newValue[i] = Relationship.create(p);
          } else if ( typeof p.model_ === 'string' ) {
            p = newValue[i] = FOAM(p);
          }

          // create property constant
          this[p.name.constantize()] = newValue[i];
        }

        return newValue;
      },
      documentation: function() { /*
          <p>$$DOC{ref:'Relationship',usePlural:true} indicate a parent-child relation between instances of
          this $$DOC{ref:'Model'} and the indicated $$DOC{ref:'Model',usePlural:true}, through the indicated
          $$DOC{ref:'Property',usePlural:true}. If your $$DOC{ref:'Model',usePlural:true} build a tree
          structure of instances, they could likely benefit from a declared $$DOC{ref:'Relationship'}.
          </p>
        */}
    },
    {
      name: 'issues',
      type: 'Array[Issue]',
      subType: 'Issue',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Issues associated with this model.',
      documentation: function() { /*
          Bug tracking inside the FOAM system can attach $$DOC{ref:'Issue',usePlural:true} directly to the
          affected $$DOC{ref:'Model',usePlural:true}.
        */}
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      view: 'TextAreaView',
      defaultValue: '',
      help: 'Help text associated with the entity.',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'Model'} or
          $$DOC{ref:'Property'}, through field labels or tooltips.
        */}

    },
    DocumentationBootstrap,
    {
      name: 'notes',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      view: 'TextAreaView',
      defaultValue: '',
      help: 'Internal documentation associated with this entity.',
      documentation: function() { /*
          Internal documentation or implementation-specific 'todo' notes.
        */}

    },
    {
      name: 'createActionFactory',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Factory to create the action object for creating this object',
      documentation: function() { /* Factory to create the action object for creating this object  */}
    },
    {
      name: 'deleteActionFactory',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Factory to create the action object for deleting this object',
        documentation: function() { /* Factory to create the action object for deleting this object  */}
    }
  ],

  templates:[
    {
      model_: 'Template',
      name: 'javaSource',
      description: 'Java Source',
      "template": "// Generated by FOAM, do not modify.\u000a// Version <%= this.version %>\u000a<%\u000a  var className       = this.javaClassName;\u000a  var parentClassName = this.extendsModel ? this.extendsModel : 'FObject';\u000a\u000a  if ( GLOBAL[parentClassName] && GLOBAL[parentClassName].abstract ) parentClassName = 'Abstract' + parentClassName;\u000a\u000a%>\u000a<% if ( this.package ) { %>\\\u000apackage <%= this.package %>;\u000a\u000a<% } %>\\\u000aimport foam.core.*;\u000a\u000apublic<%= this.abstract ? ' abstract' : '' %> class <%= className %>\u000a   extends <%= parentClassName %>\u000a{\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a   public final static Property <%= prop.name.constantize() %> = new Abstract<%= prop.javaType.capitalize() %>Property() {\u000a     public String getName() { return \"<%= prop.name %>_\"; }\u000a     public String getLabel() { return \"<%= prop.label %>\"; }\u000a     public Object get(Object o) { return ((<%= this.name %>) o).get<%= prop.name.capitalize() %>(); }\u000a     public void set(Object o, Object v) { ((<%= this.name %>) o).set<%= prop.name.capitalize() %>(toNative(v)); }\u000a     public int compare(Object o1, Object o2) { return compareValues(((<%= this.name%>)o1).<%= prop.name %>_, ((<%= this.name%>)o2).<%= prop.name %>_); }\u000a   };\u000a   <% } %>\u000a\u000a   final static Model model__ = new AbstractModel(new Property[] {<% for ( var key in this.properties ) { var prop = this.properties[key]; %> <%= prop.name.constantize() %>,<% } %> }) {\u000a     public String getName() { return \"<%= this.name %>\"; }\u000a     public String getLabel() { return \"<%= this.label %>\"; }\u000a     public Property id() { return <%= this.ids.length ? this.ids[0].constantize() : 'null' %>; }\u000a   };\u000a\u000a   public Model model() {\u000a     return model__;\u000a   }\u000a   public static Model MODEL() {\u000a     return model__;\u000a   }\u000a\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a   private <%= prop.javaType %> <%= prop.name %>_;   <% } %>\u000a\u000a   public <%= className %>()\u000a   {\u000a   }\u000a<% if ( this.properties.length ) { %> \u000a   public <%= className %>(<% for ( var key in this.properties ) { var prop = this.properties[key]; %><%= prop.javaType, ' ', prop.name, key < this.properties.length-1 ? ', ': '' %><% } %>)\u000a   {   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a      <%= prop.name %>_ = <%= prop.name %>;   <% } %>\u000a   }\u000a<% } %>\u000a\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a   public <%= prop.javaType %> get<%= prop.name.capitalize() %>() {\u000a       return <%= prop.name %>_;\u000a   };\u000a   public void set<%= prop.name.capitalize() %>(<%= prop.javaType, ' ', prop.name %>) {\u000a       <%= prop.name %>_ = <%= prop.name %>;\u000a   };\u000a   <% } %>\u000a\u000a   public int hashCode() { \u000a      int hash = 1;\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a      hash = hash * 31 + hash(<%= prop.name %>_);   <% } %>\u000a\u000a      return hash;\u000a   }\u000a\u000a   public int compareTo(Object obj) {\u000a      if ( obj == this ) return 0;\u000a      if ( obj == null ) return 1;\u000a\u000a      <%= this.name %> other = (<%= this.name %>) obj;\u000a \u000a      int cmp;\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a      if ( ( cmp = compare(get<%= prop.name.capitalize() %>(), other.get<%= prop.name.capitalize() %>()) ) != 0 ) return cmp;   <% } %>\u000a\u000a      return 0;\u000a   }\u000a\u000a   public StringBuilder append(StringBuilder b) {\u000a      return b\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\\\u000a      .append(\"<%= prop.name %>=\").append(get<%= prop.name.capitalize() %>())<%= key < this.properties.length-1 ? '.append(\", \")' : '' %> \u000a   <% } %>      ;\u000a   }\u000a\u000a   public Object fclone() {\u000a      <%= this.name %> c = new <%= this.name %>();\u000a      <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\\\u000ac.set<%= prop.name.capitalize() %>(get<%= prop.name.capitalize() %>());\u000a      <% } %>\\\u000areturn c;\u000a   }\u000a\u000a}"
    },
    {
      model_: 'Template',
      name: 'closureExterns',
      description: 'Closure Externs JavaScript Source',
      template: '/**\n' +
        ' * @constructor\n' +
        ' */\n' +
        '<%= this.name %> = function() {};\n' +
        '<% for ( var i = 0 ; i < this.properties.length ; i++ ) { var prop = this.properties[i]; %>' +
        '\n<%= prop.closureSource(undefined, this.name) %>\n' +
        '<% } %>' +
        '<% for ( var i = 0 ; i < this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '\n<%= meth.closureSource(undefined, this.name) %>\n' +
        '<% } %>'
    },
    {
      model_: 'Template',
      name: 'dartSource',
      description: 'Dart Class Source',
      template: '<% out(this.name); %>\n{\n<% for ( var key in this.properties ) { var prop = this.properties[key]; %>   var <%= prop.name %>;\n<% } %>\n\n   <%= this.name %>()\n   {\n\n   }\n\n   <%= this.name %>(<% for ( var key in this.properties ) { var prop = this.properties[key]; %>this.<%= prop.name, key < this.properties.length-1 ? ", ": "" %><% } %>)\n}'
    }
  ],

  toString: function() { return "Model"; }
};
