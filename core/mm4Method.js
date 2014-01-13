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
// Now remove ModelProto so nobody tries to use it
// TODO: do this once no views use it directly
// delete ModelProto;

var Action = FOAM({
    model_: 'Model',

   name: 'Action',

    tableProperties: [
      'name',
      'label'
    ],

    properties: [
       {
           name:  'name',
           type:  'String',
           required: true,
           displayWidth: 30,
           displayHeight: 1,
           defaultValue: '',
           help: 'The coding identifier for the action.'
       },
       {
           name: 'label',
           type: 'String',
           displayWidth: 70,
           displayHeight: 1,
           defaultValueFn: function() { return this.name.labelize(); },
           help: 'The display label for the action.'
       },
       {
           name: 'help',
           label: 'Help Text',
           type: 'String',
           displayWidth: 70,
           displayHeight: 6,
           defaultValue: '',
           help: 'Help text associated with the action.'
       },
       {
           name: 'default',
           type: 'Boolean',
           view: 'BooleanView',
           defaultValue: false,
           help: 'Indicates if this is the default action.'
       },
       {
           name: 'isAvailable',
           label: 'Available',
           type: 'String',
           displayWidth: 70,
           displayHeight: 3,
           view: 'FunctionView',
           defaultValue: function() { return true; },
           help: 'Function to determine if action is available.'
       },
       {
           name: 'isEnabled',
           label: 'Enabled',
           type: 'String',
           displayWidth: 70,
           displayHeight: 3,
           view: 'FunctionView',
           defaultValue: function(obj, ret) { ret(true); },
           help: 'Function to determine if action is enabled.'
       },
       {
           name: 'iconUrl',
           type: 'String',
           defaultValue: undefined,
           help: 'Provides a url for an icon to render for this action'
       },
       {
           name: 'showLabel',
           type: 'String',
           defaultValue: true,
           help: 'Property indicating whether the label should be rendered along side the icon'
       },
       {
           name: 'children',
           type: 'Array',
           valueFactory: function() { return []; },
           subType: 'Action',
           view: 'ArrayView',
           help: 'Child actions of this action.',
           persistent: false
       },
       {
           name: 'parent',
           type: 'String',
           help: 'The parent action of this action'
       },
       {
           name: 'action',
           type: 'Function',
           displayWidth: 80,
           displayHeight: 20,
           defaultValue: '',
           view: 'FunctionView',
           help: 'Function to implement action.'
       }
   ]
});

/* Not used yet
var Topic = FOAM({
    model_: 'Model',

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

var Arg = FOAM({
    model_: 'Model',

   name: 'Arg',

    tableProperties: [
      'type',
      'name',
      'description'
    ],

    properties: [
       {
           name:  'type',
           type:  'String',
           required: true,
           displayWidth: 30,
           displayHeight: 1,
           defaultValue: 'Object',
           help: 'The type of this argument.'
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
           name:  'name',
           type:  'String',
           required: true,
           displayWidth: 30,
           displayHeight: 1,
           defaultValue: '',
           help: 'The coding identifier for the entity.'
       },
       {
          model_: 'BooleanProperty',
          name: 'required',
          default: true
       },
       {
           name:  'defaultValue',
           help: 'Default Value if not required and not provided.'
       },
       {
           name: 'description',
           type: 'String',
           displayWidth: 70,
           displayHeight: 1,
           defaultValue: '',
           help: 'A brief description of this topic.'
       },
       {
           name: 'help',
           label: 'Help Text',
           type: 'String',
           displayWidth: 70,
           displayHeight: 6,
           defaultValue: '',
           help: 'Help text associated with the entity.'
       }
   ],
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


Method = FOAM({
    model_: 'Model',

   name: 'Method',

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
           help: 'The coding identifier for the entity.'
       },
       {
           name: 'description',
           type: 'String',
           displayWidth: 70,
           displayHeight: 1,
           defaultValue: '',
           help: 'A brief description of this topic.'
       },
       {
           name: 'help',
           label: 'Help Text',
           type: 'String',
           displayWidth: 70,
           displayHeight: 6,
           defaultValue: '',
           help: 'Help text associated with the entity.'
       },
       {
           name: 'code',
           type: 'Function',
           displayWidth: 80,
           displayHeight: 30,
           view: 'FunctionView',
           help: 'Javascript code to implement this method.'
       },
       {
           name:  'returnType',
           defaultValue: '',
           help: 'Interface package.'
       },
       {
           model_: 'ArrayProperty',
           name: 'args',
           type: 'Array[Arg]',
           subType: 'Arg',
           view: 'ArrayView',
           valueFactory: function() { return []; },
           defaultValue: [],
           help: 'Method arguments.'
       }
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


var Interface = FOAM({
   model_: 'Model',

   name: 'Interface',

    tableProperties: [
      'package', 'name', 'description'
    ],

   properties: [
       {
           name:  'package',
           help: 'Interface package.'
       },
       {
           name: 'extends',
           type: 'Array[String]',
           view: 'StringArrayView',
           help: 'Interfaces extended by this interface.'
       },
       {
           name:  'name',
           required: true,
           help: 'Interface name.'
       },
       {
           name:  'description',
           type:  'String',
           required: true,
           displayWidth: 70,
           displayHeight: 1,
           defaultValue: '',
           help: 'The template\'s unique name.'
       },
       {
           name: 'help',
           label: 'Help Text',
           displayWidth: 70,
           displayHeight: 6,
           view: 'TextAreaView',
           help: 'Help text associated with the argument.'
       },
       {
           model_: 'ArrayProperty',
           name: 'methods',
           type: 'Array[Method]',
           subType: 'Method',
           view: 'ArrayView',
           valueFactory: function() { return []; },
           defaultValue: [],
           help: 'Methods associated with the interface.'
       }
   ],
   methods: {
   },
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


var Template = FOAM({
    model_: 'Model',

   name: 'Template',

    tableProperties: [
      'name', 'description'
    ],

    properties: [
       {
           name:  'name',
           type:  'String',
           required: true,
           displayWidth: 30,
           displayHeight: 1,
           defaultValue: '',
           help: 'The template\'s unique name.'
       },
       {
           name:  'description',
           type:  'String',
           required: true,
           displayWidth: 70,
           displayHeight: 1,
           defaultValue: '',
           help: 'The template\'s unique name.'
       },
       {
           name: 'template',
           type: 'String',
           displayWidth: 180,
           displayHeight: 30,
           rows: 30, cols: 80,
           defaultValue: '',
           view: 'TextAreaView',
           help: 'Template text. <%= expr %> or <% out(...); %>'
       },
       {
           name: 'templates',
           type: 'Array[Template]',
           subType: 'Template',
           view: 'ArrayView',
           defaultValue: [],
           help: 'Sub-templates of this template.'
       }
   ]

});
