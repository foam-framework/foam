/**
 * @license
 * Copyright 2012-2014 Google Inc. All Rights Reserved.
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
// Now remove BootstrapModel so nobody tries to use it
// TODO: do this once no views use it directly
// delete BootstrapModel;

MODEL({
  name: 'Action',
  plural: 'Actions',

  tableProperties: [
    'name',
    'label'
  ],

  documentation: function() {  /*
    <p>An executable behavior that can be triggered by the user.
      $$DOC{ref:'Action',usePlural:true} are typically represented as buttons
      or menu items. Activating the $$DOC{ref:'Action'} causes the
      $$DOC{ref:'.action'} function $$DOC{ref:'Property'} to run. The user-facing
      control's state is handled by $$DOC{ref:'.isEnabled'} and $$DOC{ref:'.isAvailable'}.
    </p>
  */},


  properties: [
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the action.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} names should use camelCase staring with a lower case letter.
         */}
    },
    {
      name: 'label',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      help: 'The display label for the action.',
      documentation: function() { /* A human readable label for the $$DOC{ref:'.'}. May
        contain spaces or other odd characters.
         */}
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      defaultValue: '',
      help: 'Help text associated with the action.',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'.'},
          through field labels or tooltips.
        */}
    },
    {
      model_: 'DocumentationProperty',
      name: 'documentation'
    },
    {
      name: 'default',
      type: 'Boolean',
      view: 'BooleanView',
      defaultValue: false,
      help: 'Indicates if this is the default action.',
      documentation: function() { /*
          Indicates if this is the default $$DOC{ref:'Action'}.
        */}
    },
    {
      model_: 'FunctionProperty',
      name: 'isAvailable',
      label: 'Available',
      displayWidth: 70,
      displayHeight: 3,
      defaultValue: function() { return true; },
      help: 'Function to determine if action is available.',
      documentation: function() { /*
            A function used to determine if the $$DOC{ref:'Action'} is available.
        */}
    },
    {
      model_: 'FunctionProperty',
      name: 'isEnabled',
      label: 'Enabled',
      displayWidth: 70,
      displayHeight: 3,
      defaultValue: function() { return true; },
      help: 'Function to determine if action is enabled.',
      documentation: function() { /*
            A function used to determine if the $$DOC{ref:'Action'} is enabled.
        */}
    },
    {
      model_: 'FunctionProperty',
      name: 'labelFn',
      label: 'Label Function',
      defaultValue: function(action) { return action.label; },
      help: "Function to determine label. Defaults to 'this.label'.",
      documentation: function() { /*
            A function used to determine the label. Defaults to $$DOC{ref:'.label'}.
        */}
    },
    {
      name: 'iconUrl',
      type: 'String',
      defaultValue: undefined,
      help: 'Provides a url for an icon to render for this action',
      documentation: function() { /*
            A url for the icon to render for this $$DOC{ref:'Action'}.
                */}
    },
    {
      name: 'showLabel',
      type: 'String',
      defaultValue: true,
      help: 'Property indicating whether the label should be rendered alongside the icon',
      documentation: function() { /*
            Indicates whether the $$DOC{ref:'.label'} should be rendered alongside the icon.
        */}
    },
    {
      name: 'children',
      type: 'Array',
      factory: function() { return []; },
      subType: 'Action',
      view: 'ArrayView',
      help: 'Child actions of this action.',
      persistent: false,
      documentation: function() { /*
            Child $$DOC{ref:'Action',usePlural:true} of this instance.
        */}
    },
    {
      name: 'parent',
      type: 'String',
      help: 'The parent action of this action',
      documentation: function() { /*
            The parent $$DOC{ref:'Action'} of this instance.
        */}
    },
    {
      model_: 'FunctionProperty',
      name: 'action',
      displayWidth: 80,
      displayHeight: 20,
      defaultValue: '',
      help: 'Function to implement action.',
      documentation: function() { /*
            This function supplies the execution of the $$DOC{ref:'Action'} when triggered.
        */}
    },
    {
      model_: 'StringArrayProperty',
      name: 'keyboardShortcuts',
      documentation: function() { /*
            Keyboard shortcuts for the $$DOC{ref:'Action'}.
        */}
    }
  ],
  methods: {
    callIfEnabled: function(__ctx__, that) { /* doesn't appear in docs. Bootstrappy issue. */
      if ( this.isEnabled.call(that, this) ) this.action.call(that, __ctx__, this);
    }
  }
});

Action.getPrototype().callIfEnabled = function(__ctx__, that) {
  if ( this.isEnabled.call(that, this) ) this.action.call(that, __ctx__, this);
};


/* Not used yet
   MODEL({
   name: 'Topic',

   tableProperties: [
   'name',
   'description'
   ],

   properties: [
   {
   name:  'name',
   type:  'String',
   required: true,
   displayWidth: 30,
   displayHeight: 1,
   defaultValue: '',
   // todo: test this
   preSet: function (newValue) {
   return newValue.toUpperCase();
   },
   help: 'The coding identifier for this topic.'
   },
   {
   name: 'description',
   type: 'String',
   displayWidth: 70,
   displayHeight: 1,
   defaultValue: '',
   help: 'A brief description of this topic.'
   }
   ]
   });
*/

MODEL({
  name: 'Arg',

  tableProperties: [
    'type',
    'name',
    'description'
  ],

  documentation: function() { /*
      <p>Represents one $$DOC{ref:'Method'} argument, including the type information.</p>
  */},

  properties: [
    {
      name:  'type',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: 'Object',
      help: 'The type of this argument.',
      documentation: function() { /* <p>The type of the $$DOC{ref:'.'}, either a primitive type or a $$DOC{ref:'Model'}.</p>
      */}
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
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the entity.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} names should use camelCase staring with a lower case letter.
         */}
    },
    {
      model_: 'BooleanProperty',
      name: 'required',
      defaultValue: true,
      documentation: function() { /*
        Indicates that this arugment is required for calls to the containing $$DOC{ref:'Method'}.
      */}
    },
    {
      name: 'defaultValue',
      help: 'Default Value if not required and not provided.',
      documentation: function() { /*
        The default value to use if this argument is not required and not provided to the $$DOC{ref:'Method'} call.
      */}
    },
    {
      name: 'description',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'A brief description of this argument.',
      documentation: function() { /*
        A human-readable description of the argument.
      */}
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      defaultValue: '',
      help: 'Help text associated with the entity.',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'.'},
          through field labels or tooltips.
        */}
    },
    {
      model_: 'DocumentationProperty',
      name: 'documentation'
    },
  ],

  methods: {
    decorateFunction: function(f, i) {
      if ( this.type === 'Object' ) return f;
      var type = this.type;

      return this.required ?
        function() {
          console.assert(arguments[i] !== undefined, 'Missing required argument# ' + i);
          console.assert(typeof arguments[i] === type,  'argument# ' + i + ' type expected to be ' + type + ', but was ' + (typeof arguments[i]) + ': ' + arguments[i]);
          return f.apply(this, arguments);
        } :
        function() {
          console.assert(arguments[i] === undefined || typeof arguments[i] === type,
              'argument# ' + i + ' type expected to be ' + type + ', but was ' + (typeof arguments[i]) + ': ' + arguments[i]);
          return f.apply(this, arguments);
        } ;
    }
  },

  templates:[
    {
      model_: 'Template',

      name: 'javaSource',
      description: 'Java Source',
      template: '<%= this.type %> <%= this.name %>'
    },
    {
      model_: 'Template',

      name: 'closureSource',
      description: 'Closure JavaScript Source',
      template: '@param {<%= this.javascriptType %>} <%= this.name %> .'
    },
    {
      model_: 'Template',

      name: 'webIdl',
      description: 'Web IDL Source',
      template: '<%= this.type %> <%= this.name %>'
    }
  ]
});


MODEL({
  name: 'Method',
  plural: 'Methods',

  tableProperties: [
    'name',
    'description'
  ],

  documentation: function() {/*
    <p>A $$DOC{ref:'Method'} represents a callable piece of code with
    $$DOC{ref:'args',text:'arguments'} and an optional return value.
    </p>
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
  */},

  properties: [
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the entity.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} names should use camelCase staring with a lower case letter.
         */}
    },
    {
      name: 'description',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'A brief description of this method.',
      documentation: function() { /* A human readable description of the $$DOC{ref:'.'}.
         */}

    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      defaultValue: '',
      help: 'Help text associated with the entity.',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'.'},
          through field labels or tooltips.
        */}
    },
    {
      model_: 'DocumentationProperty',
      name: 'documentation',
    },
    {
      name: 'code',
      type: 'Function',
      displayWidth: 80,
      displayHeight: 30,
      view: 'FunctionView',
      help: 'Javascript code to implement this method.',
      postSet: function() {
        // check for documentation in a multiline comment at the beginning of the code
        // accepts "/* comment */ function() {...." or "function() { /* comment */ ..."
        // TODO: technically unicode letters are valid in javascript identifiers, which we are not catching here for function arguments.
        var multilineComment = /^\s*function\s*\([\$\s\w\,]*?\)\s*{\s*\/\*([\s\S]*?)\*\/[\s\S]*$|^\s*\/\*([\s\S]*?)\*\/([\s\S]*)/.exec(this.code.toString());
        if ( multilineComment ) {
          var bodyFn = multilineComment[1];
          this.documentation = this.__ctx__.Documentation.create({
                name: this.name,
                body: bodyFn
          })
        }

      },
      documentation: function() { /*
          <p>The code to execute for the $$DOC{ref:'Method'} call.</p>
          <p>In a special case for javascript documentation, an initial multiline comment, if present,
           will be pulled from your code and used as a documentation template:
            <code>function() { \/\* docs here \*\/ code... }</code></p>

        */}
    },
    {
      name:  'returnType',
      defaultValue: '',
      help: 'Return type.',
      documentation: function() { /*
          The return type of the $$DOC{ref:'Method'}.
        */}
    },
    {
      model_: 'BooleanProperty',
      name: 'returnTypeRequired',
      defaultValue: true,
      documentation: function() { /*
          Indicates whether the return type is checked. TODO: ???
        */}
    },
    {
      model_: 'ArrayProperty',
      name: 'args',
      type: 'Array[Arg]',
      subType: 'Arg',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Method arguments.',
      documentation: function() { /*
          The $$DOC{ref:'Arg',text:'Arguments'} for the method.
        */}
    },
    {
      name: 'isMerged',
      help: 'As a listener, should this be merged?',
      documentation: function() { /*
          For a listener $$DOC{ref:'Method'}, indicates that the events should be merged to avoid
          repeated activations.
        */}
    },
    {
      model_: 'BooleanProperty',
      name: 'isFramed',
      help: 'As a listener, should this be animated?',
      defaultValue: false,
      documentation: function() { /*
          For a listener $$DOC{ref:'Method'}, indicates that this should be animated.
        */}

    },
  ],

  templates:[
    {
      model_: 'Template',

      name: 'javaSource',
      description: 'Java Source',
      template: '<%= this.returnType || "void" %> <%= this.name %>(' +
        '<% for ( var i = 0 ; i < this.args.length ; i++ ) { var arg = this.args[i]; %>' +
        '<%= arg.javaSource() %><% if ( i < this.args.length-1 ) out(", ");%>' +
        '<% } %>' +
        ')'
    },
    {
      model_: 'Template',

      name: 'closureSource',
      description: 'Closure JavaScript Source',
      // TODO:  Change returnType to returnType.javascriptType
      template:
      '/**\n' +
        '<% for ( var i = 0; i < this.args.length ; i++ ) { var arg = this.args[i]; %>' +
        ' * <%= arg.closureSource() %>\n' +
        '<% } %>' +
        '<% if (this.returnType) { %>' +
        ' * @return {<%= this.returnType %>} .\n' +
        '<% } %>' +
        ' */\n' +
        '<%= arguments[1] %>.prototype.<%= this.name %> = goog.abstractMethod;'
    },
    {
      model_: 'Template',

      name: 'webIdl',
      description: 'Web IDL Source',
      template:
      '<%= this.returnType || \'void\' %> <%= this.name %>(' +
        '<% for ( var i = 0 ; i < this.args.length ; i++ ) { var arg = this.args[i]; %>' +
        '<%= arg.webIdl() %><% if ( i < this.args.length-1 ) out(", "); %>' +
        '<% } %>' +
        ')'
    }
  ]
});

Method.getPrototype().decorateFunction = function(f) {
  for ( var i = 0 ; i < this.args.length ; i++ ) {
    var arg = this.args[i];

    f = arg.decorateFunction(f, i);
  }

  var returnType = this.returnType;

  return returnType ?
    function() {
      var ret = f.apply(this, arguments);
      console.assert(typeof ret !== returnType, 'return type expected to be ' + returnType + ', but was ' + (typeof ret) + ': ' + ret);
      return ret;
    } : f ;
};

function superMethodDecorator(mName, f) {
  return function() {
    var args = argsToArray(arguments);
    args.unshift(this.__proto__.__proto__[mName].bind(this));
    return f.apply(this, args);
  };
}

Method.getPrototype().generateFunction = function() {
  var f = this.code;

  if ( this.args.length && this.args[0].name == 'SUPER' ) {
    f = superMethodDecorator(this.name, f);
  }

  return DEBUG ? this.decorateFunction(f) : f;
};


MODEL({
  name: 'Interface',
  plural: 'Interfaces',

  tableProperties: [
    'package', 'name', 'description'
  ],

  documentation: function() { /*
      <p>$$DOC{ref:'Interface',usePlural:true} specify a set of methods with no
      implementation. $$DOC{ref:'Model',usePlural:true} implementing $$DOC{ref:'Interface'}
      fill in the implementation as needed. This is analogous to
      $$DOC{ref:'Interface',usePlural:true} in object-oriented languages.</p>
    */},

  properties: [
    {
      name:  'package',
      help: 'Interface package.',
      documentation: function() { /* When running FOAM in a Java environment, specifies the
         package in which to declare the Java class built from this $$DOC{ref:'.'}.*/}
    },
    {
      name: 'extends',
      type: 'Array[String]',
      view: 'StringArrayView',
      help: 'Interfaces extended by this interface.',
      documentation: function() { /*
        The other $$DOC{ref:'Interface',usePlural:true} this $$DOC{ref:'Interface'} inherits
        from. Unlike most $$DOC{ref:'Model',usePlural:true},
        $$DOC{ref:'Interface',usePlural:true} should only extend other
        $$DOC{ref:'Interface',usePlural:true}, and have $$DOC{ref:'Model.extendsModel'}
        set to $$DOC{ref:'Interface'}.
      */}
    },
    {
      name:  'name',
      required: true,
      help: 'Interface name.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} definition names should use CamelCase starting with a capital letter.
         */}
    },
    {
      name:  'description',
      type:  'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The interface\'s description.',
      documentation: function() { /* A human readable description of the $$DOC{ref:'.'}. */ }
    },
    {
      name: 'help',
      label: 'Help Text',
      displayWidth: 70,
      displayHeight: 6,
      view: 'TextAreaView',
      help: 'Help text associated with the argument.',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'.'},
          through field labels or tooltips.
        */}
    },
    {
      model_: 'DocumentationProperty',
      name: 'documentation'
    },
    {
      model_: 'ArrayProperty',
      name: 'methods',
      type: 'Array[Method]',
      subType: 'Method',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Methods associated with the interface.',
      documentation: function() { /*
        <p>The $$DOC{ref:'Method',usePlural:true} that the interface requires
        extenders to implement.</p>
        */}
    }
  ],
  templates:[
    {
      model_: 'Template',

      name: 'javaSource',
      description: 'Java Source',
      template: 'public interface <% out(this.name); %>\n' +
        '<% if ( this.extends.length ) { %>   extends <%= this.extends.join(", ") %>\n<% } %>' +
        '{\n<% for ( var i = 0 ; i < this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '   <%= meth.javaSource() %>;\n' +
        '<% } %>' +
        '}'
    },
    {
      model_: 'Template',

      name: 'closureSource',
      description: 'Closure JavaScript Source',
      template:
      'goog.provide(\'<%= this.name %>\');\n' +
        '\n' +
        '/**\n' +
        ' * @interface\n' +
        '<% for ( var i = 0 ; i < this.extends.length ; i++ ) { var ext = this.extends[i]; %>' +
        ' * @extends {<%= ext %>}\n' +
        '<% } %>' +
        ' */\n' +
        '<%= this.name %> = function() {};\n' +
        '<% for ( var i = 0 ; i <  this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '\n<%= meth.closureSource(undefined, this.name) %>\n' +
        '<% } %>'
    },
    {
      model_: 'Template',

      name: 'webIdl',
      description: 'Web IDL Source',
      template:
      'interface <%= this.name %> <% if (this.extends.length) { %>: <%= this.extends[0] %> <% } %>{\n' +
        '<% for ( var i = 0 ; i < this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '  <%= meth.webIdl() %>;\n' +
        '<% } %>' +
        '}'
    }
  ]

});


MODEL({
  name: 'Template',

  tableProperties: [
    'name', 'description'
  ],

  documentation: function() {/*
    <p>A $$DOC{ref:'.'} is processed to create a method that generates content for a $$DOC{ref:'View'}.
    Sub-views can be created from inside the
    $$DOC{ref:'Template'} using special tags. The content is lazily processed, so the first time you ask for
    a $$DOC{ref:'Template'}
    the content is compiled, tags expanded and sub-views created. Generally a template is included in a
    $$DOC{ref:'View'}, since after compilation a method is created and attached to the $$DOC{ref:'View'}
    containing the template.
    </p>
    <p>For convenience, $$DOC{ref:'Template',usePlural:true} can be specified as a function with a block
    comment inside to avoid line wrapping problems:
    <code>templates: [ myTemplate: function() { \/\* my template content \*\/ }]</code>
    </p>
    <p>HTML $$DOC{ref:'Template',usePlural:true} can include the following JSP-style tags:
    </p>
    <ul>
       <li><code>&lt;% code %&gt;</code>: code inserted into template, but nothing implicitly output</li>
       <li><code>&lt;%= comma-separated-values %&gt;</code>: all values are appended to template output</li>
       <li><code>&lt;%# expression %&gt;</code>: dynamic (auto-updating) expression is output</li>
       <li><code>\\&lt;new-line&gt;</code>: ignored</li>
       <li><code>$$DOC{ref:'Template',text:'%%value'}(&lt;whitespace&gt;|{parameters})</code>: output a single value to the template output</li>
       <li><code>$$DOC{ref:'Template',text:'$$feature'}(&lt;whitespace&gt;|{parameters})</code>: output the View or Action for the current Value</li>
    </ul>
  */},

  properties: [
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The template\'s unique name.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} names should use camelCase staring with a lower case letter.
      */}
    },
    {
      name:  'description',
      type:  'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The template\'s description.',
      documentation: function() { /* A human readable description of the $$DOC{ref:'.'}.
         */}
    },
    {
      model_: 'ArrayProperty',
      name: 'args',
      type: 'Array[Arg]',
      subType: 'Arg',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Method arguments.',
      documentation: function() { /*
          The $$DOC{ref:'Arg',text:'Arguments'} for the $$DOC{ref:'Template'}.
        */}
    },
    {
      name: 'template',
      type: 'String',
      displayWidth: 180,
      displayHeight: 30,
      rows: 30, cols: 80,
      defaultValue: '',
      view: 'TextAreaView',
      // Doesn't work because of bootstrapping issues.
      // preSet: function(_, t) { return typeof t === 'function' ? multiline(t) : t ; },
      help: 'Template text. <%= expr %> or <% out(...); %>',
      documentation: function() { /* The string content of the uncompiled $$DOC{ref:'Template'} body.
         */}
    }/*,
       {
       name: 'templates',
       type: 'Array[Template]',
       subType: 'Template',
       view: 'ArrayView',
       defaultValue: [],
       help: 'Sub-templates of this template.'
       }*/
  ]

});

MODEL({
  name: 'Documentation',

  tableProperties: [
    'name'
  ],

  documentation: {
    model_: 'Documentation',
    body: function() {/*
      <p>The $$DOC{ref:'Documentation'} model is used to store documentation text to
      describe the use of other models. Set the $$DOC{ref:'Model.documentation'} property
      of your model and specify the body text:</p>
      <ul>
        <li><p>Fully define the Documentation model:</p><p>documentation:
        { model_: 'Documentation', body: function() { \/\* your doc text \*\/} }</p>
        </li>
        <li><p>Define as a function:</p><p>documentation:
            function() { \/\* your doc text \*\/} </p>
        </li>
        <li><p>Define as a one-line string:</p><p>documentation:
            "your doc text" </p>
        </li>
      </ul>
    */}
  },

  properties: [
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: 'documentation',
      help: 'The Document\'s unique name.',
      documentation: "An optional name for the document. Documentation is normally referenced by the name of the containing Model."
    },
    {
      name:  'label',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The Document\'s title or descriptive label.',
      documentation: "A human readable title to display. Used for books of documentation and chapters."
    },
    {
      name: 'body',
      type: 'Template',
      defaultValue: '',
      help: 'The main content of the document.',
      documentation: "The main body text of the document. Any valid template can be used, including the $$DOC{ref:'DocView'} specific $$DOC{ref:'DocView',text:'$$DOC{\"ref\"}'} and $$DOC{ref:'DocView',text:'$$THISDATA{}'} tags.",
      preSet: function(_, template) {
          return TemplateUtil.templateMemberExpander(template, this.__ctx__);
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'chapters',
      type: 'Array[Document]',
      subtype: 'Documentation',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Sub-documents comprising the full body of this document.',
      documentation: "Optional sub-documents to be included in this document. A viewer may choose to provide an index or a table of contents.",
    },

  ]

});

// HACK to get around property-template bootstrap ordering issues
TemplateUtil.modelExpandTemplates(Property, Property.templates);
