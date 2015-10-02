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
  labels: ['javascript'],
  help: 'Documentation associated with this entity.',
  documentation: "The developer documentation for this $$DOC{ref:'.'}. Use a $$DOC{ref:'DocModelView'} to view documentation.",
  setter: function(nu) {
    if ( ! _DOC_ ) return;
    this.instance_.documentation = nu;
  },
  getter: function() {
    if ( ! _DOC_ ) return '';
    var doc = this.instance_.documentation;
    if ( doc && typeof Documentation != "undefined" && Documentation // a source has to exist (otherwise we'll return undefined below)
        && (  ! doc.model_ // but we don't know if the user set model_
           || ! doc.model_.getPrototype // model_ could be a string
           || ! Documentation.isInstance(doc) // check for correct type
        ) ) {
      // So in this case we have something in documentation, but it's not of the
      // "Documentation" model type, so FOAMalize it.
      if ( doc.body ) {
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
  instance_: {},

  name:  'Model',
  plural:'Models',
  help:  "Describes the attributes and properties of an entity.",

  documentation: {
    body: function() { /*
      <p>In FOAM, $$DOC{ref:'Model'} is the basic unit for describing data and behavior.
      $$DOC{ref:'Model'} itself is a $$DOC{ref:'Model'}, since it defines what can be defined,
      but also defines itself. See
      $$DOC{ref:'developerDocs.Welcome.chapters.modelsAtRuntime', text: 'Models in Action'}
      for more details.</p>


      <p>To create an instance of a $$DOC{ref:'Model'}, add it in your
      $$DOC{ref:'Model.requires'} list, then, in Javascript:</p>
      <p>
        <code>this.YourModel.create({ propName: val... })</code> creates an instance.
      </p>
      <p>
      Under the covers, $$DOC{ref:'Model.requires'} is creating an alias for the
      $$DOC{ref:'Model'} instance that exists in your context. You can access it
      directly at <code>this.X.yourPackage.YourModel</code>.</p>

      <p>Note:
      <ul>
        <li>The definition of your model is a $$DOC{ref:'Model'} instance
        (with YourModel.model_ === Model), while instances
        of your model have your new type (myInstance.model_ === YourModel). This
        differs from other object-oriented systems where the definition of a class
        and instances of the class are completely separate entities. In FOAM every
        class definition
        is an instance of $$DOC{ref:'Model'}, including itself.</li>

        <li>$$DOC{ref:'Model.exports',text:'Exporting'} a model property allows
        seamless dependency injection. See the
        $$DOC{ref:'developerDocs.Context', text:'Context documentation'}
        for more information.</li>

        <li>Calling .create direclty on a $$DOC{ref:'Model'} from your context,
        without using the $$DOC{ref:'.requires'} shortcut, must include the
        context: <code>this.X.MyModel.create({args}, this.X);</code>. Use
        $$DOC{ref:'.requires'} unless you have some compelling reason not to!</li>
      </ul>
      </p>
      <p>For more information about how $$DOC{ref:'Model',usePlural:true} are instantiated,
      see $$DOC{ref:'developerDocs.Welcome.chapters.modelsAtRuntime',text:'Welcome to Models at Runtime'}.
    */ }
  },

  tableProperties: [
    'package', 'name', 'label', 'plural'
  ],

  properties: [
    {
      name: 'id',
      hidden: true,
      transient: true
    },
    {
      name:  'sourcePath',
      help: 'Source location of this Model.',
      defaultValue: '',
      mode: 'read-only',
      transient: true
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
                 // when creating an instance of the model (your $$DOC{ref:'developerDocs.Context', text:'context'}
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
      name: 'label',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return labelize(this.name); },
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
      name: 'swiftClassName',
      type: 'String',
      labels: ['swift'],
      defaultValueFn: function() { return (this.abstract ? 'Abstract' : '') + this.name; },
      help: 'The Swift classname of this model.'
    },
    {
      name: 'extendsModel',
      label: 'Extends',
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
      name: 'traits',
      type: 'Array[String]',
      view: 'foam.ui.StringArrayView',
      defaultValueFn: function() { return []; },
      help: 'Traits to mix-into this Model.',
      documentation: function() { /* Traits allow you to mix extra features into your $$DOC{ref:'Model'}
         through composition, avoiding inheritance where unecesssary. */}
    },
    {
      name: 'plural',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name + 's'; },
      help: 'The plural form of this model\'s name.',
      documentation: function() { /* The plural form of $$DOC{ref:'Model.name'}, for use in database
        table naming, labels and documentation. The format generally follows the same
        contsraints as $$DOC{ref:'.name'}. */}
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
      view: 'foam.ui.StringArrayView',
      defaultValueFn: function() {
        var id = this.getProperty('id');
        if ( id ) return ['id'];
        var props = this.getRuntimeProperties();
        return props.length ? [props[0].name] : [];
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
      view: 'foam.ui.StringArrayView',
      defaultValueFn: function() { return []; },
      help: 'Model imports.',
      documentation: function() { /*
          <p>List of model imports, as strings of the form:
            <code>'Model-Path [as Alias]'</code>.</p>
          <p>Aliases are created on your instances that reference the full
            path of the model, taking it from your this.X
            $$DOC{ref:'developerDocs.Context', text:'context'}.</p>
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
      view: 'foam.ui.StringArrayView',
      defaultValueFn: function() { return []; },
      help: 'Context imports.',
      documentation: function() { /*
          <p>List of context items to import, as strings of the form:
          <code>Key [as Alias]</code>.</p>
          <p>Imported items are installed into your $$DOC{ref:'Model'}
          as pseudo-properties, using their $$DOC{ref:'Model.name', text:'name'}
          or the alias specified here.</p>
          <p><code>imports: [ 'selectedItem',
                   'selectionDAO as dao' ]<br/>
                   ...<br/>
                   // in your Model's methods: <br/>
                  this.selectedItem.get(); // equivalent to this.X.selectedItem.get()<br/>
                  this.dao.select(); // equivalent to this.X.selectionDAO.select()<br/>
                  </code></p>
          <p>If you have $$DOC{ref:'.exports',text:'exported'} properties from a
          $$DOC{ref:'Model'} in a parent context, you can import those items and give
          them aliases for convenient access without the <code>this.X</code>.</p>
          <p>You can also re-export items you have imported, either with a different
          name or to replace the item you imported with a different property. While
          everyone can see changes to the value inside the imported property, only
          children (instances you create in your $$DOC{ref:'Model'}) will see
          $$DOC{ref:'Model.exports'} replacing the property itself.
        */}
    },
    {
      name: 'exports',
      type: 'Array[String]',
      view: 'foam.ui.StringArrayView',
      defaultValueFn: function() { return []; },
      help: 'Context exports.',
      documentation: function() { /*
          <p>A list of $$DOC{ref:'Property',usePlural:true} to export to your sub-context,
           as strings of the form:
          <code>PropertyName [as Alias]</code>.</p>
          <p>Properties you wish to share with other instances you create
            (like sub-$$DOC{ref:'foam.ui.View',usePlural:true})
            can be exported automatically by listing them here.
            You are automatically sub-contexted, so your parent context does not
            see exported properties. In other words, exports are seen by children,
            not by parents.</p>
            <p>Instances you create can declare $$DOC{ref:'Model.imports'} to
            conveniently grab your exported items from the context.<p>
          <p><code>MODEL({ name: firstModel<br/>
               &nbsp;&nbsp;   exports: [ 'myProperty', 'name as parentName' ],<br/>
               &nbsp;&nbsp;   properties: [<br/>
               &nbsp;&nbsp;     {<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp; name: 'proper',<br/>
                <br/>
                 &nbsp;&nbsp;&nbsp;&nbsp; // This property will create a DetailView for us<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp; view: { factory_: 'foam.ui.DetailView',<br/>
                <br/>
v                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // we can import the properties our creator exported.<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; imports: [ 'myProperty', 'parentName' ],<br/>
                <br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; methods: { toHTML: function() {<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // our context is provided by firstModel, so:<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.myProperty = 4; // we can see exported myProperty<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; out.print(this.parentName); // aliased, links back to our name<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;     }}},<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;     ...<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;     { name: 'myProperty' },<br/>
                 &nbsp;&nbsp;&nbsp;&nbsp;     { name: 'name' }<br/>
                 &nbsp;&nbsp; ]<br/>
                 &nbsp;&nbsp; ...<br/>
                  </code></p>
        */}
    },
    {
      name: 'implements',
      type: 'Array[String]',
      view: 'foam.ui.StringArrayView',
      defaultValueFn: function() { return []; },
      help: 'Interfaces implemented by this Model.',
      documentation: function() { /* $$DOC{ref:'Interface',usePlural:true} implemented by this $$DOC{ref:'Model'} .*/}
    },
    {
      name: 'tableProperties',
      type: 'Array[String]',
      view: 'foam.ui.StringArrayView',
      displayWidth: 70,
      lazyFactory: function() {
        return (this.properties || this.properties_).filter(function(o) {
          return !o.hidden;
        }).map(function(o) {
          return o.name;
        });
      },
      help: 'Properties to be displayed in table view. Defaults to all properties.',
      documentation: function() { /* Indicates the $$DOC{ref:'Property',usePlural:true} to display when viewing a list of instances
        of this $$DOC{ref:'Model'} in a table or other $$DOC{ref:'Property'} viewer. */}
    },
    {
      name: 'searchProperties',
      type: 'Array[String]',
      view: 'foam.ui.StringArrayView',
      displayWidth: 70,
      defaultValueFn: function() {
        return this.tableProperties;
      },
      help: 'Properties display in a search view. Defaults to table properties.',
      documentation: function() { /* Indicates the $$DOC{ref:'Property',usePlural:true} to display when viewing
        of this $$DOC{ref:'Model'} in a search view. */}
    },
    {
//      model_: 'ArrayProperty',
      name: 'properties',
      type: 'Array[Property]',
      subType: 'Property',
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      help: 'Properties associated with the entity.',
      preSet: function(oldValue, newValue) {
        // Convert Maps to Properties if required
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var p = newValue[i];

          if ( typeof p === 'string' ) {
            newValue[i] = p = { name: p };
          } else if ( Array.isArray(p) ) {
            newValue[i] = p = { name: p[0], defaultValue: p[1] };
          }

          if ( p.labels && ! FEATURE_ENABLED(p.labels) ) {
            newValue.splice(i,1);
            i--;
            continue;
          }

          if ( ! p.model_ ) {
            p = newValue[i] = Property.create(p);
          } else if ( typeof p.model_ === 'string' ) {
            p = newValue[i] = JSONUtil.mapToObj(this.X, p);
          }

          // create property constant
          this[constantize(p.name)] = newValue[i];
        }

        this.propertyMap_ = null;

        return newValue;
      },
      postSet: function(_, newValue) {
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          newValue[i].modelId = this.id;
        }
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
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      propertyToJSON: function(visitor, output, o) {
        if ( o[this.name].length ) output[this.name] = o[this.name];
      },
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
          if ( p.name && ! this[constantize(p.name)] ) {
            this[constantize(p.name)] = newValue[i];
          }
        }

        return newValue;
      },
      documentation: function() { /*
        <p>$$DOC{ref:'Action',usePlural:true} implement a behavior and attach a label, icon, and typically a
        button-like $$DOC{ref:'foam.ui.View'} or menu item to activate the behavior.</p>
        */}

    },
    {
      name: 'constants',
      type: 'Array[Constant]',
      subType: 'Constant',
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      propertyToJSON: function(visitor, output, o) {
        if ( o[this.name].length ) output[this.name] = o[this.name];
      },
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
      name: 'messages',
      type: 'Array[Message]',
      subType: 'Constant',
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      propertyToJSON: function(visitor, output, o) {
        if ( o[this.name].length ) output[this.name] = o[this.name];
      },
      help: 'Messages associated with the entity.',
      preSet: function(_, newValue) {
        if ( ! GLOBAL.Message ) return newValue;

        if ( Array.isArray(newValue) ) return JSONUtil.arrayToObjArray(this.X, newValue, Message);

        // convert a map of values to an array of Message objects
        var messages = [];

        for ( var key in newValue ) {
          var oldValue = newValue[key];

          var message = Message.create({
            name:  key,
            value: oldValue
          });

          messages.push(message);
        }

        return messages;
      }
    },
    {
//      model_: 'ArrayProperty',
      name: 'methods',
      subType: 'Method',
      factory: function() { return []; },
      help: 'Methods associated with the entity.',
      adapt: function(_, a) {
        if ( ! Method ) return a;

        function createMethod(X, name, fn) {
          var method = Method.create({
            name: name,
            code: fn
          });

          if ( FEATURE_ENABLED(['debug']) && Arg ) {
            var str = fn.toString();
            var match = str.match(/^function[ _$\w]*\(([ ,\w]+)/);
            if ( match )
            method.args = match[1].split(',').
              map(function(name) { return Arg.create({name: name.trim()}); });
          }

          return method;
        }

        if ( Array.isArray(a) ) {
          for ( var i = 0 ; i < a.length ; i++ ) {
            a[i] = ( typeof a[i] === 'function' ) ?
              createMethod(this.X, a[i].name, a[i]) :
              JSONUtil.mapToObj(this.X, a[i], Method, seq) ;
          }
          return a;
        }

        // convert a map of functions to an array of Method instances, DEPRECATED
        var methods = [];
        for ( var key in a ) methods.push(createMethod(this.X, key, a[key]));
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
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      propertyToJSON: function(visitor, output, o) {
        if ( o[this.name].length ) output[this.name] = o[this.name];
      },
      preSet: function(_, newValue) {
        if ( Array.isArray(newValue) ) return JSONUtil.arrayToObjArray(this.X, newValue, Method);
        return newValue;
      },
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
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      // defaultValue: [],
      help: 'Event topics associated with the entity.'
      },
    */
    {
      name: 'templates',
      type: 'Array[Template]',
      subType: 'Template',
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      propertyToJSON: function(visitor, output, o) {
        if ( o[this.name].length ) output[this.name] = o[this.name];
      },
      preSet: function(_, templates) {
        for ( var i = 0 ; i < templates.length ; i++ ) {
          if ( templates[i].labels && ! FEATURE_ENABLED(templates[i].labels) ) {
            templates.splice(i, 1);
            i--;
            continue;
          }
        }
        return templates;
      },
      postSet: function(_, templates) { TemplateUtil.expandModelTemplates(this); },
      help: 'Templates associated with this entity.',
      documentation: function() { /*
        The $$DOC{ref:'Template',usePlural:true} to process and install into instances of this
        $$DOC{ref:'Model'}. $$DOC{ref:'foam.ui.View',usePlural:true} created inside each $$DOC{ref:'Template'}
        using the $$DOC{ref:'.templates',text:'$$propertyName{args}'} view creation tag become available
        as <code>myInstance.propertyNameView</code>.
        */}
    },
    {
      name: 'models',
      type: 'Array[Model]',
      subType: 'Model',
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      propertyToJSON: function(visitor, output, o) {
        if ( o[this.name].length ) output[this.name] = o[this.name];
      },
      adapt: function(_, newValue) {
        if ( ! Model ) return newValue;
        return Array.isArray(newValue) ? JSONUtil.arrayToObjArray(this.X, newValue, Model) : newValue;
      },
      postSet: function(_, models) {
        for ( var i = 0 ; i < models.length ; i++ ) this[models[i].name] = models[i];
      },
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
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      propertyToJSON: function(visitor, output, o) {
        if ( o[this.name].length ) output[this.name] = o[this.name];
      },
      adapt: function(_, a) {
        if ( ! a ) return a;
        for ( var i = 0 ; i < a.length ; i++ ) {
          if ( typeof a[i] === "function" ) {
            a[i] = UnitTest.create({
              name: a[i].name,
              code: a[i]
            });
          }
        }
        return a;
      },
      help: 'Unit tests associated with this model.',
      documentation: function() { /*
          Create $$DOC{ref:'UnitTest',usePlural:true} that should run to test the functionality of this
          $$DOC{ref:'Model'} here.
        */}
    },
    {
      name: 'relationships',
      subType: 'Relationship',
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      propertyToJSON: function(visitor, output, o) {
        if ( o[this.name].length ) output[this.name] = o[this.name];
      },
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
          this[constantize(p.name)] = newValue[i];
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
      labels: ['debug'],
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      propertyToJSON: function(visitor, output, o) {
        if ( o[this.name].length ) output[this.name] = o[this.name];
      },
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
      view: 'foam.ui.TextAreaView',
      defaultValue: '',
      help: 'Help text associated with the entity.',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'Model'} or
          $$DOC{ref:'Property'}, through field labels or tooltips.
        */}

    },
    {
      name: 'i18nComplete_',
      defaultValue: false,
      hidden: true,
      transient: true
    },
    {
      name: 'translationHint',
      label: 'Description for Translation',
      type: 'String',
      defaultValueFn: function() { return this.name; }
    },
    DocumentationBootstrap,
    {
      name: 'notes',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      view: 'foam.ui.TextAreaView',
      defaultValue: '',
      help: 'Internal documentation associated with this entity.',
      documentation: function() { /*
          Internal documentation or implementation-specific 'todo' notes.
        */}
    }
  ],

  templates:[
  //  {
  //    model_: 'Template',
  //    name: 'closureExterns',
  //    description: 'Closure Externs JavaScript Source',
  //    template: '/**\n' +
  //      ' * @constructor\n' +
  //      ' */\n' +
  //      '<%= this.name %> = function() {};\n' +
  //      '<% for ( var i = 0 ; i < this.properties.length ; i++ ) { var prop = this.properties[i]; %>' +
  //      '\n<%= prop.closureSource(undefined, this.name) %>\n' +
  //      '<% } %>' +
  //      '<% for ( var i = 0 ; i < this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
  //      '\n<%= meth.closureSource(undefined, this.name) %>\n' +
  //      '<% } %>'
  //  },
  //  {
  //    model_: 'Template',
  //    name: 'dartSource',
  //    description: 'Dart Class Source',
  //    template: '<% out(this.name); %>\n{\n<% for ( var key in this.properties ) { var prop = this.properties[key]; %>   var <%= prop.name %>;\n<% } %>\n\n   <%= this.name %>()\n   {\n\n   }\n\n   <%= this.name %>(<% for ( var key in this.properties ) { var prop = this.properties[key]; %>this.<%= prop.name, key < this.properties.length-1 ? ", ": "" %><% } %>)\n}'
  //  },
  //  {
  //    model_: 'Template',
  //    name: 'protobufSource',
  //    description: 'Protobuf source',
  //    template: 'message <%= this.name %> {\n<% for (var i = 0, prop; prop = this.properties[i]; i++ ) { if ( prop.prototag == null ) continue; if ( prop.help ) { %>//<%= prop.help %>\n<% } %>  <% if ( prop.type.startsWith("Array") ) { %>repeated<% } else if ( false ) { %>required<% } else { %>optional<% } %>  <%= prop.protobufType %> <%= prop.name %> = <%= prop.prototag %>;\n\n<% } %>}\n'
  //  }
  ],

  toString: function() { return "Model"; }
};
