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

CLASS({
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
      defaultValueFn: function() { return labelize(this.name); },
      help: 'The display label for the action.',
      documentation: function() { /* A human readable label for the $$DOC{ref:'.'}. May
        contain spaces or other odd characters.
         */}
    },
    {
      name: 'speechLabel',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.label; },
      help: 'The speech label for the action.',
      documentation: "A speakable label for the $$DOC{ref:'.'}. Used for accessibility."
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
      name: 'documentation',
      documentation: 'The developer documentation.',
      labels: ['documentation']
    },
    {
      name: 'default',
      type: 'Boolean',
      view: 'foam.ui.BooleanView',
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
      name: 'ligature',
      type: 'String',
      defaultValue: undefined,
      help: 'Provides a ligature for font-based icons for this action',
      documentation: function() { /*
            A "ligature" (short text string) a font-based icon to render for
            this $$DOC{ref:'Action'}.
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
      view: 'foam.ui.ArrayView',
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
      name: 'code',
      displayWidth: 80,
      displayHeight: 20,
      defaultValue: '',
      help: 'Function to implement action.',
      documentation: function() { /*
            This function supplies the execution of the $$DOC{ref:'Action'} when triggered.
        */}
    },
    {
      model_: 'FunctionProperty',
      name: 'action',
      displayWidth: 80,
      displayHeight: 20,
      defaultValue: '',
      getter: function() {
        console.log('deprecated use of Action.action');
        return this.code;
      },
      setter: function(code) {
        console.log('deprecated use of Action.action');
        return this.code = code;
      }
    },
    {
      model_: 'StringArrayProperty',
      name: 'keyboardShortcuts',
      documentation: function() { /*
            Keyboard shortcuts for the $$DOC{ref:'Action'}.
        */}
    },
    {
      name: 'translationHint',
      label: 'Description for Translation',
      type: 'String',
      defaultValue: ''
    },
    {
      name: 'priority',
      type: 'Int',
      defaultValue: 5,
      help: 'Measure of importance of showing this action to the user when it is rendered in a list.',
      documentation: function() { /*
            A measure of importance of showing this $$DOC{ref:'Action'} instance
            in list $$DOC{ref:'foam.ui.View'} of
            $$DOC{ref:'Action',usePlural:true}; a lower number indicates a
            higher priority. Lists should determine which actions to make
            visible by $$DOC{ref:'.priority'}, then sort them by
            $$DOC{ref:'.order'}.
        */}
    },
    {
      name: 'order',
      type: 'Float',
      defaultValue: 5.0,
      help: 'Indication of where this action should appear in an ordered list of actions.',
      documentation: function() { /*
            Indication of where this $$DOC{ref:'Action'} instance should appear
            in an ordered list $$DOC{ref:'foam.ui.View'} of
            $$DOC{ref:'Action',usePlural:true}. Lists should determine which
            actions to make visible by $$DOC{ref:'.priority'}, then sort them by
            $$DOC{ref:'.order'}.
        */}
    }
  ],
  methods: {
    maybeCall: function(X, that) { /* Executes this action if $$DOC{ref:'.isEnabled'} is allows it. */
      if ( this.isAvailable.call(that, this) && this.isEnabled.call(that, this) ) {
        this.code.call(that, X, this);
        that.publish(['action', this.name], this);
        return true;
      }
      return false;
    }
  }
});


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

CLASS({
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
      labels: ['debug'],
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
      labels: ['debug'],
      documentation: function() { /* When running FOAM in a Java environment, specifies the Java type
        or class to use. */}
    },
    {
      name: 'javascriptType',
      type: 'String',
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The javascript type that represents the type of this property.',
      labels: ['debug'],
      documentation: function() { /* When running FOAM in a javascript environment, specifies the javascript
         type to use. */}
    },
    {
      name: 'swiftType',
      type: 'String',
      labels: ['swift'],
      defaultValueFn: function() { return this.type; },
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
      labels: ['debug'],
      documentation: function() { /*
        Indicates that this arugment is required for calls to the containing $$DOC{ref:'Method'}.
      */}
    },
    {
      name: 'defaultValue',
      help: 'Default Value if not required and not provided.',
      labels: ['debug'],
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
      labels: ['debug'],
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
      labels: ['debug'],
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'.'},
          through field labels or tooltips.
        */}
    },
    {
      model_: 'DocumentationProperty',
      name: 'documentation',
      documentation: 'The developer documentation.',
      labels: ['debug']
    }
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
      template: '<%= this.type %> <%= this.name %>',
      labels: ['debug'],
    },
    {
      model_: 'Template',

      name: 'closureSource',
      description: 'Closure JavaScript Source',
      template: '@param {<%= this.javascriptType %>} <%= this.name %> .',
      labels: ['debug']
    },
    {
      model_: 'Template',

      name: 'webIdl',
      description: 'Web IDL Source',
      template: '<%= this.type %> <%= this.name %>',
      labels: ['debug']
    }
  ]
});


CLASS({
  name: 'Template',

  tableProperties: [
    'name', 'description'
  ],

  documentation: function() {/*
    <p>A $$DOC{ref:'.'} is processed to create a method that generates content for a $$DOC{ref:'foam.ui.View'}.
    Sub-views can be created from inside the
    $$DOC{ref:'Template'} using special tags. The content is lazily processed, so the first time you ask for
    a $$DOC{ref:'Template'}
    the content is compiled, tags expanded and sub-views created. Generally a template is included in a
    $$DOC{ref:'foam.ui.View'}, since after compilation a method is created and attached to the $$DOC{ref:'foam.ui.View'}
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
       <li><code>&lt;!-- comment --&gt;</code> comments are stripped from $$DOC{ref:'Template',usePlural:true}.</li>
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
      documentation: "A human readable description of the $$DOC{ref:'.'}."
    },
    {
      model_: 'ArrayProperty',
      name: 'args',
      type: 'Array[Arg]',
      subType: 'Arg',
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
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
      view: 'foam.ui.TextAreaView',
      // Doesn't work because of bootstrapping issues.
      // preSet: function(_, t) { return typeof t === 'function' ? multiline(t) : t ; },
      help: 'Template text. <%= expr %> or <% out(...); %>',
      documentation: "The string content of the uncompiled $$DOC{ref:'Template'} body."
    },
    {
      name: 'path'
    },
    {
      name: 'futureTemplate',
      transient: true
    },
    {
      name: 'code',
      transient: true
    },
    /*
       {
       name: 'templates',
       type: 'Array[Template]',
       subType: 'Template',
       view: 'foam.ui.ArrayView',
       // defaultValue: [],
       help: 'Sub-templates of this template.'
       },*/
    {
      model_: 'DocumentationProperty',
      name: 'documentation',
      labels: ['debug'],
    },
    {
      name: 'language',
      type: 'String',
      lazyFactory: function() {
        return this.name === 'CSS' ? 'css' : 'html';
      }
    },
    {
      name: 'labels'
    }
  ]
});


CLASS({
  name: 'Constant',
  plural: 'constants',

  tableProperties: [
    'name',
    'value',
    'description'
  ],

  documentation: function() {/*
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
      model_: 'DocumentationProperty',
      name: 'documentation',
      documentation: 'The developer documentation.',
      labels: ['debug']
    },
    {
      name: 'value',
      help: 'The value of the constant..'
    },
    {
      name:  'type',
      defaultValue: '',
      help: 'Type of the constant.'
    },
    {
      name: 'translationHint',
      label: 'Description for Translation',
      type: 'String',
      defaultValue: ''
    }
  ]
});


CLASS({
  name: 'Message',
  plural: 'messages',

  tableProperties: [
    'name',
    'value',
    'translationHint'
  ],

  documentation: function() {/*
  */},

  properties: [
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the message.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} names should use camelCase staring with a lower case letter.
         */}
    },
    {
      name: 'value',
      type: 'String',
      help: 'The message itself.'
    },
    {
      name: 'meaning',
      type: 'String',
      help: 'Linguistic clarification to resolve ambiguity.',
      documentation: function() {/* A human readable discussion of the
        $$DOC{ref:'.'} to resolve linguistic ambiguities.
      */}
    },
    {
      model_: 'ArrayProperty',
      name: 'placeholders',
      help: 'Placeholders to inject into the message.',
      documentation: function() {/* Array of plain Javascript objects
        describing in-message placeholders. The data can be expanded into
        $$DOC{ref:'foam.i18n.Placeholder'}, for example.
      */}
    },
    {
      model_: 'FunctionProperty',
      name: 'replaceValues',
      documentation: function() {/* Function that binds values to message
        contents.
      */},
      defaultValue: function() { return this.value; }
    },
    {
      name: 'translationHint',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'A brief description of this message and the context in which it used.',
      documentation: function() {/* A human readable description of the
        $$DOC{ref:'.'} and its context for the purpose of translation.
      */}
    }
  ]
});


CLASS({
  name: 'Method',
  plural: 'Methods',

  tableProperties: [
    'name',
    'description'
  ],

  documentation: function() {/*
    <p>A $$DOC{ref:'Method'} represents a callable piece of code with
    $$DOC{ref:'.args',text:'arguments'} and an optional return value.
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
      <li><p><code>this.SUPER()</code> calls the $$DOC{ref:'Method'} implementation from the
                base $$DOC{ref:'Model'} (specified in $$DOC{ref:'Model.extendsModel'}).</p>
                <ul>
                  <li>
                      <p>Calling
                      <code>this.SUPER()</code> is extremely important in your <code>init()</code>
                      $$DOC{ref:'Method'}, if you provide one.</p>
                      <p>You can also specify <code>SUPER</code> as the
                      first argument of your Javascript function, and it will be populated with the
                      correct base function automatically:</p>
                      <p><code>function(other_arg) {<br/>
                                  &nbsp;&nbsp; this.SUPER(other_arg); // calls super, argument is optional depending on what your base method takes.<br/>
                                  &nbsp;&nbsp; ...<br/></code>
                      </p>
                    </li>
                  </ul>
                </li>
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
      labels: ['debug'],
      help: 'Help text associated with the entity.',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'.'},
          through field labels or tooltips.
        */}
    },
    {
      model_: 'DocumentationProperty',
      name: 'documentation',
      documentation: 'The developer documentation.',
      labels: ['debug']
    },
    {
      name: 'code',
      type: 'Function',
      displayWidth: 80,
      displayHeight: 30,
      view: 'foam.ui.FunctionView',
      help: 'Javascript code to implement this method.',
      postSet: function() {
        if ( ! _DOC_ ) return;
        // check for documentation in a multiline comment at the beginning of the code
        // accepts "/* comment */ function() {...." or "function() { /* comment */ ..."
        // TODO: technically unicode letters are valid in javascript identifiers, which we are not catching here for function arguments.
        var multilineComment = /^\s*function\s*\([\$\s\w\,]*?\)\s*{\s*\/\*([\s\S]*?)\*\/[\s\S]*$|^\s*\/\*([\s\S]*?)\*\/([\s\S]*)/.exec(this.code.toString());
        if ( multilineComment ) {
          var bodyFn = multilineComment[1];
          this.documentation = this.Y.Documentation.create({
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
        */},
      labels: ['debug']
    },
    {
      name: 'swiftReturnType',
      labels: ['swift'],
      defaultValueFn: function() { return this.returnType; }
    },
    {
      model_: 'BooleanProperty',
      name: 'returnTypeRequired',
      defaultValue: true,
      documentation: function() { /*
          Indicates whether the return type is checked.
        */},
      labels: ['debug']
    },
    {
      model_: 'ArrayProperty',
      name: 'args',
      type: 'Array[Arg]',
      subType: 'Arg',
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      help: 'Method arguments.',
      documentation: function() { /*
          The $$DOC{ref:'Arg',text:'Arguments'} for the method.
        */},
      labels: ['debug']
    },
    {
      name: 'whenIdle',
      help: 'Should this listener be deferred until the system is idle (ie. not running any animations).',
      documentation: function() { /*
          For a listener $$DOC{ref:'Method'}, indicates that the events should be delayed until animations are finished.
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
          For a listener $$DOC{ref:'Method'}, indicates that this listener is animated,
          and events should be merged to trigger only once per frame.
        */}
    },
    {
      name: 'labels'
    },
    {
      model_: 'TemplateProperty',
      name: 'swiftSource',
      labels: ['swift'],
      defaultValue: '<% true; %>',
    },
    {
      model_: 'TemplateProperty',
      name: 'javaSource',
      labels: ['java'],
      defaultValue: function() {/*
    <%= this.returnType || "void" %> <%= this.name %>(<%
 for ( var i = 0 ; this.args && i < this.args.length ; i++ ) { var arg = this.args[i];
%><%= arg.javaSource() %><% if ( i < this.args.length-1 ) out(", ");
%><% } %>) {}\n*/}
    }
  ],

  templates:[
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

// initialize to empty object for the two methods added below
Method.getPrototype().decorateFunction = function(f) {
  for ( var i = 0 ; i < this.args.length ; i++ ) {
    var arg = this.args[i];

    f = arg.decorateFunction(f, i);
  }

  var returnType = this.returnType;

  return returnType ?
    function() {
      var ret = f.apply(this, arguments);
      console.assert(typeof ret === returnType, 'return type expected to be ' + returnType + ', but was ' + (typeof ret) + ': ' + ret);
      return ret;
    } : f ;
};

Method.getPrototype().generateFunction = function() {
  var f = this.code;

  return DEBUG ? this.decorateFunction(f) : f;
};

Method.methods = {
  decorateFunction: Method.getPrototype().decorateFunction,
  generateFunction: Method.getPrototype().generateFunction
};


CLASS({
  name: 'Documentation',

  tableProperties: [
    'name'
  ],

  documentation: function() {/*
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
    */},

  properties: [
    {
      name: 'name',
      type: 'String',
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
      documentation: "The main body text of the document. Any valid template can be used, including the $$DOC{ref:'foam.documentation.DocView'} specific $$DOC{ref:'foam.documentation.DocView',text:'$$DOC{\"ref\"}'} tag.",
      preSet: function(_, template) {
        return TemplateUtil.expandTemplate(this, template);
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'chapters',
      type: 'Array[Document]',
      subtype: 'Documentation',
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      help: 'Sub-documents comprising the full body of this document.',
      documentation: "Optional sub-documents to be included in this document. A viewer may choose to provide an index or a table of contents.",
      labels: ['debug'],
      preSet: function(old, nu) {
        if ( ! _DOC_ ) return []; // returning undefined causes problems
        var self = this;
        var foamalized = [];
        // create models if necessary
        nu.forEach(function(chapter) {
          if (chapter && typeof self.Y.Documentation != "undefined" && self.Y.Documentation // a source has to exist (otherwise we'll return undefined below)
              && (  !chapter.model_ // but we don't know if the user set model_
                 || !chapter.model_.getPrototype // model_ could be a string
                 || !self.Y.Documentation.isInstance(chapter) // check for correct type
              ) ) {
            // So in this case we have something in documentation, but it's not of the
            // "Documentation" model type, so FOAMalize it.
            if (chapter.body) {
              foamalized.push(self.Y.Documentation.create( chapter ));
            } else {
              foamalized.push(self.Y.Documentation.create({ body: chapter }));
            }
          } else {
            foamalized.push(chapter);
          }
        });
        return foamalized;
      },
      //postSet: function() { console.log("post ",this.chapters); }
    }
  ]
});
