/*
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


/*
function getObjectSize(myObject) {
  var count=0
  for (var key in myObject)
    count++
  return count
}
*/


var Model = {
    __proto__: ModelProto,

    name:  'Model',
    plural:'Models',
    help:  "Describes the attributes and properties of an entity.",

    tableProperties: [
      'name',
      'label',
      'plural'
    ],

    ids: [ 'name' ],

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
	   name: 'label',
	   type: 'String',
	   displayWidth: 70,
           displayHeight: 1,
	   defaultValueFn: function() { return this.name.labelize(); },
	   help: 'The display label for the entity.'
       },
       {
	   name: 'extendsModel',
	   type: 'String',
	   displayWidth: 70,
           displayHeight: 1,
	   defaultValue: '',
	   help: 'The parent model of this model.'
       },
       {
	   name: 'extendsPrototype',
	   type: 'String',
	   displayWidth: 70,
           displayHeight: 1,
	   defaultValue: '',
	   help: 'The parent prototype of this model\'s prototype.'
       },
       {
	   name: 'plural',
	   type: 'String',
	   displayWidth: 70,
           displayHeight: 1,
	   defaultValueFn: function() { return this.name + 's'; },
	   help: 'The plural form of this model\'s name.'
       },
       {
	   name: 'version',
	   type: 'int',
           defaultValue: 1,
	   help: 'Version number of model.'
       },
       {
	   name: 'ids',
	   label: 'Key Properties',
	   type: 'Array[String]',
	   view: 'StringArrayView',
	   defaultValueFn: function() {
             return this.properties.length ? [this.properties[0].name] : [];
           },
	   help: 'Properties which make up unique id.'
       },
       {
	   name: 'tableProperties',
	   type: 'Array[String]',
	   view: 'StringArrayView',
	   defaultValue: [],
	   help: 'Properties to be displayed in table view.'
       },
       {
	   name: 'properties',
	   type: 'Array[Property]',
           subType: 'Property',
	   view: 'ArrayView',
	   valueFactory: function() { return []; },
	   defaultValue: [],
	   help: 'Properties associated with the entity.',
	   preSet: function(newValue) {
	      if ( ! Property ) return;

	      // Convert Maps to Properties if required
	      for ( var i = 0 ; i < newValue.length ; i++ ) {
	      	 var p = newValue[i];

		 if ( ! p.model_ ) {
		    if ( this.extendsModel && this.name == 'CIssue'/* && this.getProperty(p.name) */) {
//		      debugger;
                    }
		    newValue[i] = Property.create(p);
		 }

                 // create property constant
                 this[p.name.constantize()] = newValue[i];
	      }

              return newValue;
           }
       },
       {
	   name: 'actions',
	   type: 'Array[Action]',
           subType: 'Action',
	   view: 'ArrayView',
	   valueFactory: function() { return []; },
	   defaultValue: [],
	   help: 'Actions associated with the entity.',
	   preSet: function(newValue) {
	      if ( ! Action ) return newValue;
	      return JSONUtil.mapToObj(newValue);
	   }
       },
       {
	   name: 'methods',
	   type: 'Array[Method]',
           subType: 'Method',
	   view: 'ArrayView',
	   valueFactory: function() { return []; },
	   defaultValue: [],
	   help: 'Methods associated with the entity.',
	   preSet: function(newValue) {
	      if ( ! Method ) return;

	      if ( newValue instanceof Array ) return newValue;

	      // convert a map of functions to an array of Method instances
	      var methods = [];

	      for ( var key in newValue )
	      {
                 var oldValue = newValue[key];
		 var method   = Method.create({name: key, code: oldValue});

		 methods.push(method);
	      }

	      return methods;
	   }
       },
       {
	   name: 'listeners',
	   type: 'Array[Method]',
           subType: 'Method',
	   view: 'ArrayView',
	   valueFactory: function() { return []; },
	   defaultValue: [],
	   help: 'Event listeners associated with the entity.'
       },
       /*
       {
	   name: 'topics',
	   type: 'Array[topic]',
           subType: 'Topic',
	   view: 'ArrayView',
	   valueFactory: function() { return []; },
	   defaultValue: [],
	   help: 'Event topics associated with the entity.'
       },
       */
       {
	   name: 'templates',
	   type: 'Array[Template]',
           subType: 'Template',
	   view: 'ArrayView',
	   valueFactory: function() { return []; },
	   defaultValue: [],
//	   defaultValueFn: function() { return []; },
	   help: 'Templates associated with this entity.'
       },
       {
	   name: 'models',
	   type: 'Array[Model]',
           subType: 'Model',
	   view: 'ArrayView',
	   valueFactory: function() { return []; },
	   defaultValue: [],
	   help: 'Sub-models embedded within this model.'
       },
       {
	   name: 'tests',
	   label: 'Unit Tests',
	   type: 'Array[Unit Test]',
           subType: 'UnitTest',
	   view: 'ArrayView',
	   valueFactory: function() { return []; },
	   defaultValue: [],
	   help: 'Unit tests associated with this model.'
       },
       {
	   name: 'issues',
	   type: 'Array[Issue]',
           subType: 'Issue',
	   view: 'ArrayView',
	   valueFactory: function() { return []; },
	   defaultValue: [],
	   help: 'Issues associated with this model.'
       },
       {
	   name: 'help',
	   label: 'Help Text',
	   type: 'String',
	   displayWidth: 70,
           displayHeight: 6,
	   view: 'TextAreaView',
	   defaultValue: '',
	   help: 'Help text associated with the entity.'
       },
       {
	   name: 'notes',
	   type: 'String',
	   displayWidth: 70,
           displayHeight: 6,
	   view: 'TextAreaView',
	   defaultValue: '',
	   help: 'Internal documentation associated with this entity.'
       },
       {
           name: 'protoparser',
           label: 'ProtoParser',
           type: 'Grammar',
	   hidden: true,
           defaultValueFn: function() {
             var parser = {
               __proto__: BinaryProtoGrammar,

               START: sym('model'),

               model: [],
             };
             for (var i = 0, prop; prop = this.properties[i]; i++) {
               if (!prop.prototag) continue;
               var p;
               switch(prop.type) {
                 case 'uint32':
                 case 'uint64':
                 case 'int32':
                 case 'int64':
                 p = protouint32(prop.prototag);
                 break;
                 case 'boolean':
                 p = protobool(prop.prototag);
                 break;
                 case 'string':
                 p = protostring(prop.prototag);
                 break;
                 default:
                 var model = GLOBAL[prop.type];
                 if (!model) throw "Could not find model for " + prop.type;
                 p = protomessage(prop.prototag, model.protoparser.export('START'));
               }

               parser[prop.name] = p;
               (function(prop) {
                 parser.addAction(prop.name, function(a) {
                   return [prop, a[1]];
                 });
               })(prop);
               parser.model.push(sym(prop.name));
             }
             parser.model.push(sym('unknown field'));
             parser.model = repeat(alt.apply(undefined, parser.model));
             var self = this;
             parser.addAction('model', function(a) {
               var createArgs = {};
               for (var i = 0, field; field = a[i]; i++) {
                 if (!field[0] || field[0].TYPE != 'Property') continue;
                 createArgs[field[0].name] = field[1];
               }
               return self.create(createArgs);
             });
             return parser;
           },
       },
    ],

   templates:[
     {
        model_: 'Template',

        name: 'javaSource',
        description: 'Java Source',
        template: 'public class <% out(this.name); %>\n   extends AbstractBean\n{\n   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\n   private <%= prop.type %> <%= prop.name %>;\n   <% } %>\n\n   public <%= this.name %>()\n   {\n\n   }\n\n   public <%= this.name %>(<% for ( var key in this.properties ) { var prop = this.properties[key]; %><%= prop.type, \' \', prop.name, key < this.properties.length-1 ? \',\': \'\' %><% } %>)\n   {\n   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\n      this.<%= prop.name %> = <%= prop.name %>;\n   <% } %>\n   }\n\n   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\n   public <%= prop.type %> get<%= prop.name.capitalize() %>() {\n       return <%= prop.name %>;\n   };\n   public void set<%= prop.name.capitalize() %>(<%= prop.type, \' \',prop.name %>) {\n       this.<%= prop.name %> = <%= prop.name %>;\n   };\n   <% } %>\n\n   public int hashCode() { \n      int hash = 1;\n   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\n      hash = hash * 31 + hash(<%= prop.name %>);   <% } %>\n\n      return hash;\n   }\n\n   public boolean equals(Object obj) {\n      if ( obj == this ) return true;\n      if ( obj == null ) return false;\n\n      <%= this.name %> other = (<%= this.name %>) obj;\n \n      return\n   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\n         equals(get<%= prop.name.capitalize() %>(), other.get<%= prop.name.capitalize() %>()) <%= key < this.properties.length-1 ? \'&&\' : \'\' %>   <% } %>;\n   }\n\n   public int compareTo(Object obj) {\n      if ( obj == this ) return 0;\n      if ( obj == null ) return -1;\n\n      <%= this.name %> other = (<%= this.name %>) obj;\n \n      int cmp;\n   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\n      if ( ( cmp = compare(get<%= prop.name.capitalize() %>(), other.get<%= prop.name.capitalize() %>()) ) != 0 ) return cmp;\n   <% } %>\n      return 0;\n   }\n\n   public StringBuilder append(StringBuilder b) {\n      return b\n   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\\\n      .append("<%= prop.name %>=").append(get<%= prop.name.capitalize() %>())<%= key < this.properties.length-1 ? \'.append(", ")\' : \'\' %> \n   <% } %>      ;\n   }\n\n}'
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


var Property = {
    __proto__: ModelProto,

    name:  'Property',
    plural:'Properties',
    help:  "Describes a properties of a modelled entity.",

    ids: [
      'name'
    ],

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
           required: true,
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
	   label: 'Table View Cell Formatter',
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
	   label: 'Summary View Cell Formatter',
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
       }
    ],

    methods: {
      f: function(obj) {
         return obj[this.name] || obj;
      },
      compare: function(o1, o2) {
        o1 = this.f(o1);
        o2 = this.f(o2);

        return o1.localeCompare ?
          o1.localeCompare(o2) :
          o1 - o2 ;
      },
      outSQL: function(out) {
        out.push(this.toSQL());
      },
      toSQL: function() {
        return this.name;
      }
    },

    getProperty: function(name) {
        for ( var i = 0 ; i < this.properties.length ; i++ ) {
	    var p = this.properties[i];

	    if ( p.name === name ) return p;
	}

	document.writeln("couldn't find: " + name);
        return null;
    },

    toString: function() { return "Property"; }
};


Model.methods = {
    hashCode:       ModelProto.hashCode,
    buildPrototype: ModelProto.buildPrototype,
    getPrototype:   ModelProto.getPrototype,
    isSubModel:     ModelProto.isSubModel,
    isInstance:     ModelProto.isInstance
};

console.log("Model:");
//console.log(Model);

// This is the coolest line of code that I've ever written
// or ever will write. Oct. 4, 2011 -- KGR
Model = Model.create(Model);
Model.model_ = Model;
GLOBAL['Model'] = Model;

Property = Model.create(Property);
GLOBAL['Property'] = Property;

// Now remove ModelProto so nobody tries to use it
// TODO: do this once no views use it directly
// delete ModelProto;

var Action = FOAM.create({
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
	   defaultValue: function() { return true; },
	   help: 'Function to determine if action is enabled.'
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
var Topic = FOAM.create({
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

var Method = FOAM.create({
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
       }
   ]
});


var Template = FOAM.create({
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


/*
GLOBAL['Template'] = Template;
GLOBAL['Property'] = Property;
GLOBAL['Method'] = Method;
GLOBAL['Action'] = Action;
// GLOBAL['Topic'] = Topic;
*/

var UnitTest = FOAM.create({
     model_: 'Model',
     name: 'UnitTest',
     plural: 'Unit Tests',
     tableProperties:
     [
	'description', 'passed', 'failed'
     ],
     properties:
     [
        {
           model_: 'Property',
           name: 'description',
           type: 'String',
           required: true,
           displayWidth: 70,
           displayHeight: 1,
           help: 'A one line description of the unit test.'
        },
        {
           model_: 'Property',
           name: 'passed',
           type: 'Integer',
           required: true,
           displayWidth: 8,
           displayHeight: 1,
           view: 'IntFieldView',
           help: 'Number of sub-tests to pass.'
        },
        {
           model_: 'Property',
           name: 'failed',
           type: 'Integer',
           required: true,
           displayWidth: 8,
           displayHeight: 1,
           help: 'Number of sub-tests to fail.'
        },
        {
           model_: 'Property',
           name: 'results',
           type: 'String',
	   mode: 'read-only',
           required: true,
           view: {
	      create: function() { return TextFieldView.create({mode:'read-only'}); } },
           displayWidth: 80,
           displayHeight: 20
        },
        {
           model_: 'Property',
           name: 'code',
           label: 'Test Code',
           type: 'Function',
           required: true,
           displayWidth: 80,
           displayHeight: 30,
	   defaultValue: function() {},
           view: 'FunctionView2'
        }
     ],

     actions: [
      {
         model_: 'Action',
	 name:  'test',
	 help:  'Run the unit tests.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function(obj) {
	    console.log("testing", this);
	    this.results = "<table border=1>";

	    this.passed = 0;
	    this.failed = 0;
	    this.code();

	    this.append("</table>");
	 }
      }
     ],

    methods:{

       append: function(str) {
	  this.results = this.results + str;
       },
       addHeader: function(name) {
	  this.append('<tr><th colspan=2 class="resultHeader">' + name + '</th></tr>');
       },
       addRow: function(comment, condition) {
	   this.append('<tr>' +
	     '<td>' + comment + '</td>' +
	     '<td>' + (condition ? "<font color=green>OK</font>" : "<font color=red>ERROR</font>") + '</td>' +
	     '</tr>');
       },
       assert: function(condition, comment) {
          if ( condition ) this.passed++; else this.failed++;
	  this.addRow(comment, condition);
       },
       fail: function(comment) {
	  this.assert(false, comment);
       },
       ok: function(comment) {
	  this.assert(true, comment);
       }
    }
 });


var Issue = FOAM.create(
{
     model_: 'Model',
     name: 'Issue',
     plural: 'Issues',
     help: 'An issue describes a question, feature request, or defect.',
     ids: [
       'id'
     ],
     tableProperties:
     [
	'id', 'severity', 'status', 'summary', 'assignedTo'
     ],
     properties:
     [
        {
           model_: 'Property',
           name: 'id',
           label: 'Issue ID',
           type: 'String',
           required: true,
           displayWidth: 12,
           displayHeight: 1,
           defaultValue: 0,
           view: 'IntFieldView',
           help: 'Issue\'s unique sequence number.'
        },
        {
	   name: 'severity',
	   view: {
	      create: function() { return ChoiceView.create({choices: [
                 'Feature',
                 'Minor',
		 'Major',
		 'Question'
	      ]});}
	   },
	   defaultValue: 'String',
	   help: 'The severity of the issue.'
       },
       {
	   name: 'status',
	   type: 'String',
           required: true,
	   view: {
	      create: function() { return ChoiceView.create({choices: [
                 'Open',
                 'Accepted',
		 'Complete',
		 'Closed'
	      ]});}
	   },
	   defaultValue: 'String',
	   help: 'The status of the issue.'
       },
       {
           model_: 'Property',
           name: 'summary',
           type: 'String',
           required: true,
           displayWidth: 70,
           displayHeight: 1,
           help: 'A one line summary of the issue.'
       },
       {
           model_: 'Property',
           name: 'created',
           type: 'DateTime',
           required: true,
           displayWidth: 50,
           displayHeight: 1,
           valueFactory: function() { return new Date(); },
           help: 'When this issue was created.'
       },
       {
           model_: 'Property',
           name: 'createdBy',
           type: 'String',
	   defaultValue: 'kgr',
           required: true,
           displayWidth: 30,
           displayHeight: 1,
           help: 'Who created the issue.'
       },
       {
           model_: 'Property',
           name: 'assignedTo',
           type: 'String',
	   defaultValue: 'kgr',
           displayWidth: 30,
           displayHeight: 1,
           help: 'Who the issue is currently assigned to.'
       },
       {
           model_: 'Property',
           name: 'notes',
           displayWidth: 75,
           displayHeight: 20,
	   view: 'TextAreaView',
           help: 'Notes describing issue.'
       }
     ],
     tests: [
        {
           model_: 'UnitTest',
           description: 'test1',
           code: function() {this.addHeader("header");this.ok("pass");this.fail("fail");}
        }
     ]
  }
);


Model.templates[0] = JSONUtil.mapToObj(Model.templates[0]);
Model.templates[1] = JSONUtil.mapToObj(Model.templates[1]);

(function() {
    var a = Model.properties;
    for ( var i = 0 ; i < a.length ; i++ ) {
        if ( ! Property.isInstance(a[i]) ) {
            a[i] = Property.getPrototype().create(a[i]);
        }
    }
})();
