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
	   displayWidth: 40,
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
	   defaultValueFn: function(p) { return p.displayHeight ? 'TextAreaView' : 'TextFieldView'; },
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
