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

var Model = {
    __proto__: ModelProto,

    name:  'Model',
    plural:'Models',
    help:  "Describes the attributes and properties of an entity.",

    tableProperties: [
      'name', 'label', 'plural'
    ],

    ids: [ 'name' ],

    properties: [
       {
           name:  'package',
           help: 'Java class package.',
           defaultValueFn: function() {
             return this.extendsModel ? GLOBAL[this.extendsModel].package : '';
           }
       },
       {
           name:  'abstract',
           type: 'boolean',
           defaultValue: false,
           help: 'If the java class is abstract.'
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
           name: 'label',
           type: 'String',
           displayWidth: 70,
           displayHeight: 1,
           defaultValueFn: function() { return this.name.labelize(); },
           help: 'The display label for the entity.'
       },
       {
           name: 'javaClassName',
           type: 'String',
           displayWidth: 70,
           displayHeight: 1,
           defaultValueFn: function() { return (this.abstract ? 'Abstract' : '') + this.name; },
           help: 'The Java classname of this Model.'
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
           displayWidth: 70,
           valueFactory: function() {
             return this.properties.map(Property.NAME.f.bind(Property.NAME));
           },
           help: 'Properties to be displayed in table view. Defaults to all properties.'
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
                    newValue[i] = Property.create(p);
                 } else if ( typeof p.model_ === 'string' ) {
                    newValue[i] = FOAM(p);
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
              var ret = JSONUtil.mapToObj(newValue);

              for ( var i = 0 ; i < ret.length ; i++ ) {
                 this[ret[i].name.constantize()] = ret[i];
              }

              return ret;
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
         postSet: function(_, templates) {
             // Load templates from an external file
             // if their 'template' property isn't set
             for ( var i = 0 ; i < templates.length ; i++ ) {
               var t = templates[i];
               if ( ! t.template ) {
                 var future = afuture();
                 t.futureTemplate = future.get;
                 var path = document.currentScript.src;
                 path = path.substring(0, path.lastIndexOf('/')+1);
                 path += this.name + '_' + t.name + '.ft';
                 var xhr = new XMLHttpRequest();
                 xhr.open("GET", path);
                 xhr.asend((function(t, future) { return function(data) {
                   t.template = data;
                   future.set(data);
                   t.futureTemplate = undefined;
                 };})(t, future));
               }
             }
           },
//         defaultValueFn: function() { return []; },
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
           name: 'relationships',
           subType: 'Relationship',
           view: 'ArrayView',
           valueFactory: function() { return []; },
           defaultValue: [],
           help: 'Relationships of this model to other models.',
           preSet: function(newValue) {
              if ( ! Relationship ) return newValue;
              // TODO: avoid need for 'model_'
              var ret = JSONUtil.mapToObj(newValue);

              for ( var i = 0 ; i < ret.length ; i++ ) {
                 this[ret[i].name.constantize()] = ret[i];
              }

              return ret;
           }
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
           name: 'createActionFactory',
           type: 'Function',
           required: false,
           displayWidth: 70,
           displayHeight: 3,
           rows:3,
           view: 'FunctionView',
           defaultValue: '',
           help: 'Factory to create the action object for creating this object'
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
           help: 'Factory to create the action object for deleting this object'
       }
    ],

   templates:[
     {
       model_: 'Template',
       name: 'javaSource',
       description: 'Java Source',
   "template": "// Generated by FOAM, do not modify.\u000a// Version <%= this.version %>\u000a<%\u000a  var className       = this.javaClassName;\u000a  var parentClassName = this.extendsModel ? this.extendsModel : 'AbstractFObject';\u000a\u000a  if ( GLOBAL[parentClassName] && GLOBAL[parentClassName].abstract ) parentClassName = 'Abstract' + parentClassName;\u000a\u000a%>\u000a<% if ( this.package ) { %>\\\u000apackage <%= this.package %>;\u000a\u000a<% } %>\\\u000aimport foam.core.*;\u000a\u000apublic<%= this.abstract ? ' abstract' : '' %> class <%= className %>\u000a   extends <%= parentClassName %>\u000a{\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a   public final static Property <%= prop.name.constantize() %> = new Abstract<%= prop.javaType.capitalize() %>Property() {\u000a     public String getName() { return \"<%= prop.name %>_\"; }\u000a     public String getLabel() { return \"<%= prop.label %>\"; }\u000a     public Object get(Object o) { return ((<%= this.name %>) o).get<%= prop.name.capitalize() %>(); }\u000a     public void set(Object o, Object v) { ((<%= this.name %>) o).set<%= prop.name.capitalize() %>(toNative(v)); }\u000a     public int compare(Object o1, Object o2) { return compareValues(((<%= this.name%>)o1).<%= prop.name %>_, ((<%= this.name%>)o2).<%= prop.name %>_); }\u000a   };\u000a   <% } %>\u000a\u000a   final static Model model__ = new AbstractModel(new Property[] {<% for ( var key in this.properties ) { var prop = this.properties[key]; %> <%= prop.name.constantize() %>,<% } %> }) {\u000a     public String getName() { return \"<%= this.name %>\"; }\u000a     public String getLabel() { return \"<%= this.label %>\"; }\u000a     public Property getID() { return <%= this.ids.length ? this.ids[0].constantize() : 'null' %>; }\u000a   };\u000a\u000a   public Model model() {\u000a     return model__;\u000a   }\u000a   public static Model MODEL() {\u000a     return model__;\u000a   }\u000a\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a   private <%= prop.javaType %> <%= prop.name %>_;   <% } %>\u000a\u000a   public <%= className %>()\u000a   {\u000a   }\u000a<% if ( this.properties.length ) { %> \u000a   public <%= className %>(<% for ( var key in this.properties ) { var prop = this.properties[key]; %><%= prop.javaType, ' ', prop.name, key < this.properties.length-1 ? ', ': '' %><% } %>)\u000a   {   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a      <%= prop.name %>_ = <%= prop.name %>;   <% } %>\u000a   }\u000a<% } %>\u000a\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a   public <%= prop.javaType %> get<%= prop.name.capitalize() %>() {\u000a       return <%= prop.name %>_;\u000a   };\u000a   public void set<%= prop.name.capitalize() %>(<%= prop.javaType, ' ', prop.name %>) {\u000a       <%= prop.name %>_ = <%= prop.name %>;\u000a   };\u000a   <% } %>\u000a\u000a   public int hashCode() { \u000a      int hash = 1;\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a      hash = hash * 31 + hash(<%= prop.name %>_);   <% } %>\u000a\u000a      return hash;\u000a   }\u000a\u000a   public int compareTo(Object obj) {\u000a      if ( obj == this ) return 0;\u000a      if ( obj == null ) return 1;\u000a\u000a      <%= this.name %> other = (<%= this.name %>) obj;\u000a \u000a      int cmp;\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a      if ( ( cmp = compare(get<%= prop.name.capitalize() %>(), other.get<%= prop.name.capitalize() %>()) ) != 0 ) return cmp;   <% } %>\u000a\u000a      return 0;\u000a   }\u000a\u000a   public StringBuilder append(StringBuilder b) {\u000a      return b\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\\\u000a      .append(\"<%= prop.name %>=\").append(get<%= prop.name.capitalize() %>())<%= key < this.properties.length-1 ? '.append(\", \")' : '' %> \u000a   <% } %>      ;\u000a   }\u000a\u000a   public Object fclone() {\u000a      <%= this.name %> c = new <%= this.name %>();\u000a      <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\\\u000ac.set<%= prop.name.capitalize() %>(get<%= prop.name.capitalize() %>());\u000a      <% } %>\\\u000areturn c;\u000a   }\u000a\u000a}"
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
