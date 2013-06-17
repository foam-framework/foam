var StringProperty = Model.create({
    extendsModel: 'Property',

    name:  'StringProperty',
    help:  "Describes a properties of type String.",

    properties: [
       {
	   name: 'displayHeight',
	   label: 'Display Height',
	   type: 'int',
	   displayWidth: 8,
	   defaultValue: 1,
	   help: 'The display height of the property.'
       },
       {
	   name: 'type',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: 'String',
	   help: 'The FOAM type of this property.'
       },
       {
	   name: 'javaType',
	   label: 'Java Type',
	   type: 'String',
	   displayWidth: 70,
	   defaultValue: 'String',
	   help: 'The Java type of this property.'
       },
       {
	   name: 'view',
	   defaultValueFn: function() { return this.displayHeight > 1 ? 'TextAreaView' : 'TextFieldView'; },
       },
       {
           name: 'prototag',
           label: 'Protobuf tag',
           type: 'Integer',
           required: false,
           help: 'The protobuf tag number for this field.'
       }
    ]
});


var BooleanProperty = Model.create({
    extendsModel: 'Property',

    name:  'BooleanProperty',
    help:  "Describes a properties of type String.",

    properties: [
      {
	   name: 'type',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: 'Boolean',
	   help: 'The FOAM type of this property.'
       },
       {
	   name: 'javaType',
	   label: 'Java Type',
	   type: 'String',
	   displayWidth: 70,
	   defaultValue: 'bool',
	   help: 'The Java type of this property.'
       },
       {
	   name: 'view',
	   defaultValue: 'BooleanView'
       },
       {
           name: 'prototag',
           label: 'Protobuf tag',
           type: 'Integer',
           required: false,
           help: 'The protobuf tag number for this field.'
       }
    ]
});


/*
         preSet: function (d) {
           return typeof d === 'string' ? new Date(d) : d;
	 },
         tableFormatter: function(d) {
           return d.toDateString();
         },
         valueFactory: function() { return new Date(); }

*/
var DateProperty = Model.create({
    extendsModel: 'Property',

    name:  'DateProperty',
    help:  "Describes a properties of type String.",

    properties: [
       {
	   name: 'type',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: 'Date',
	   help: 'The FOAM type of this property.'
       },
       {
	   name: 'javaType',
	   label: 'Java Type',
	   type: 'String',
	   defaultValue: 'Date',
	   help: 'The Java type of this property.'
       },
       {
	   name: 'view',
	   // TODO: create custom DateView
	   defaultValue: 'TextFieldView'
       },
       {
           name: 'prototag',
           label: 'Protobuf tag',
           type: 'Integer',
           required: false,
           help: 'The protobuf tag number for this field.'
       },
       {
           name: 'preSet',
	   defaultValue: function (d) {
             return typeof d === 'string' ? new Date(d) : d;
	   }
       },
       {
           name: 'tableFormatter',
	   defaultValue: function(d) {
             return d.toDateString();
           }
       } 
    ]
});

var DateTimeProperty = DateProperty;

var IntegerProperty = Model.create({
    extendsModel: 'Property',

    name:  'IntegerProperty',
    help:  "Describes a properties of type Integer.",

    properties: [
       {
	   name: 'type',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: 'Integer',
	   help: 'The FOAM type of this property.'
       },
       {
	   name: 'displayWidth',
	   defaultValue: 10
       },
       {
	   name: 'javaType',
	   label: 'Java Type',
	   type: 'String',
	   displayWidth: 10,
	   defaultValue: 'int',
	   help: 'The Java type of this property.'
       },
       {
	   name: 'view',
	   defaultValue: 'IntFieldView'
       },
       {
	   name: 'defaultValue',
	   defaultValue: 0
       },
       {
           name: 'prototag',
           label: 'Protobuf tag',
           type: 'Integer',
           required: false,
           help: 'The protobuf tag number for this field.'
       }
    ]
});


var FloatProperty = Model.create({
    extendsModel: 'Property',

    name:  'FloatProperty',
    help:  "Describes a properties of type Float.",

    properties: [
       {
	   name: 'type',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: 'Float',
	   help: 'The FOAM type of this property.'
       },
       {
	   name: 'javaType',
	   label: 'Java Type',
	   type: 'String',
	   displayWidth: 10,
	   defaultValue: 'double',
	   help: 'The Java type of this property.'
       },
       {
	   name: 'displayWidth',
	   defaultValue: 15
       },
       {
	   name: 'view',
	   defaultValue: 'FloatFieldView'
       },
       {
           name: 'prototag',
           label: 'Protobuf tag',
           type: 'Integer',
           required: false,
           help: 'The protobuf tag number for this field.'
       }
    ]
});


var ArrayProperty = Model.create({
    extendsModel: 'Property',

    name:  'ArrayProperty',
    help:  "Describes a properties of type Array.",

    properties: [
       {
	   name: 'type',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: 'Array',
	   help: 'The FOAM type of this property.'
       },
       {
	   name: 'subType',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: '',
	   help: 'The FOAM sub-type of this property.'
       },
       {
	   name: 'javaType',
	   label: 'Java Type',
	   type: 'String',
	   displayWidth: 10,
	   defaultValueFn: function(p) { return p.subType + '[]'; },
	   help: 'The Java type of this property.'
       },
       {
	   name: 'view',
	   defaultValue: 'ArrayView'
       },
       {
           name: 'valueFactory',
           defaultValue: function() { return []; }
       },
       {
           name: 'prototag',
           label: 'Protobuf tag',
           type: 'Integer',
           required: false,
           help: 'The protobuf tag number for this field.'
       }
    ]
});


var ReferenceProperty = Model.create({
    extendsModel: 'Property',

    name:  'ReferenceProperty',
    help:  "A foreign key reference to another Entity.",

    properties: [
       {
	   name: 'type',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: 'Reference',
	   help: 'The FOAM type of this property.'
       },
       {
	   name: 'subType',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: '',
	   help: 'The FOAM sub-type of this property.'
       },
       {
	   name: 'javaType',
	   label: 'Java Type',
	   type: 'String',
	   displayWidth: 10,
	   // TODO: should obtain primary-key type from subType
	   defaultValueFn: function(p) { return 'Object'; },
	   help: 'The Java type of this property.'
       },
       {
	   name: 'view',
	   // TODO: should be 'KeyView'
	   defaultValue: 'TextFieldView'
       },
       {
           name: 'prototag',
           label: 'Protobuf tag',
           type: 'Integer',
           required: false,
           help: 'The protobuf tag number for this field.'
       }
    ]
});


var StringArrayProperty = Model.create({
    extendsModel: 'Property',

    name:  'StringArrayProperty',
    help:  "An array of String values.",

    properties: [
       {
	   name: 'type',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: 'Array[]',
	   help: 'The FOAM type of this property.'
       },
       {
	   name: 'subType',
	   type: 'String',
	   displayWidth: 20,
	   defaultValue: 'String',
	   help: 'The FOAM sub-type of this property.'
       },
       {
	   name: 'displayWidth',
	   defaultValue: 50
       },
       {
	   name: 'javaType',
	   label: 'Java Type',
	   type: 'String',
	   displayWidth: 10,
	   defaultValue: 'String[]',
	   help: 'The Java type of this property.'
       },
       {
	   name: 'view',
	   defaultValue: 'StringArrayView'
       },
       {
           name: 'prototag',
           label: 'Protobuf tag',
           type: 'Integer',
           required: false,
           help: 'The protobuf tag number for this field.'
       }
    ]
});

var ReferenceArrayProperty = StringArrayProperty;
