CLASS({
   "model_": "Model",
   "id": "foam.lib.email.EMailLabelProperty",
   "package": "foam.lib.email",
   "name": "EMailLabelProperty",
   "extendsModel": "BooleanProperty",
   "requires": [],
   "imports": [],
   "exports": [],
   "properties": [
      {
         "model_": "Property",
         "name": "name",
         "type": "String",
         "required": true,
         "displayWidth": 30,
         "displayHeight": 1,
         "defaultValue": "",
         "help": "The coding identifier for the property."
      },
      {
         "model_": "Property",
         "name": "label",
         "type": "String",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 1,
         "defaultValueFn": function () { return this.name.labelize(); },
         "help": "The display label for the property."
      },
      {
         "model_": "Property",
         "name": "speechLabel",
         "type": "String",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 1,
         "defaultValueFn": function () { return this.label; },
         "help": "The speech label for the property."
      },
      {
         "model_": "Property",
         "name": "tableLabel",
         "type": "String",
         "displayWidth": 70,
         "displayHeight": 1,
         "defaultValueFn": function () { return this.name.labelize(); },
         "help": "The table display label for the entity."
      },
      {
         "model_": "Property",
         "name": "protobufType",
         "type": "String",
         "required": false,
         "defaultValueFn": function () { return this.type.toLowerCase(); },
         "help": "The protobuf type that represents the type of this property."
      },
      {
         "model_": "Property",
         "name": "javascriptType",
         "type": "String",
         "required": false,
         "defaultValueFn": function () { return this.type; },
         "help": "The javascript type that represents the type of this property."
      },
      {
         "model_": "Property",
         "name": "shortName",
         "type": "String",
         "required": true,
         "displayWidth": 10,
         "displayHeight": 1,
         "defaultValue": "",
         "help": "A short alternate name to be used for compact encoding."
      },
      {
         "model_": "Property",
         "name": "aliases",
         "type": "Array[String]",
         "view": "StringArrayView",
         "defaultValue": [],
         "help": "Alternate names for this property."
      },
      {
         "model_": "Property",
         "name": "mode",
         "type": "String",
         "view":          {
                        "factory_": "ChoiceView",
            "choices": [
               "read-only",
               "read-write",
               "final"
            ]
         },
         "defaultValue": "read-write"
      },
      {
         "model_": "Property",
         "name": "subType",
         "label": "Sub-Type",
         "type": "String",
         "displayWidth": 30,
         "help": "The type of the property."
      },
      {
         "model_": "Property",
         "name": "units",
         "type": "String",
         "required": true,
         "displayWidth": 70,
         "displayHeight": 1,
         "defaultValue": "",
         "help": "The units of the property."
      },
      {
         "model_": "Property",
         "name": "required",
         "type": "Boolean",
         "view": "BooleanView",
         "defaultValue": true,
         "help": "Indicates if the property is a required field."
      },
      {
         "model_": "Property",
         "name": "hidden",
         "type": "Boolean",
         "view": "BooleanView",
         "defaultValue": false,
         "help": "Indicates if the property is hidden."
      },
      {
         "model_": "Property",
         "name": "transient",
         "type": "Boolean",
         "view": "BooleanView",
         "defaultValue": false,
         "help": "Indicates if the property is transient."
      },
      {
         "model_": "Property",
         "name": "displayWidth",
         "type": "int",
         "displayWidth": 8,
         "displayHeight": 1,
         "defaultValue": "30",
         "help": "The display width of the property."
      },
      {
         "model_": "Property",
         "name": "displayHeight",
         "type": "int",
         "displayWidth": 8,
         "displayHeight": 1,
         "defaultValue": 1,
         "help": "The display height of the property."
      },
      {
         "model_": "Property",
         "name": "detailView",
         "type": "view",
         "defaultValueFn": function () { return this.view; },
         "help": "View component for the property when rendering within a DetailView."
      },
      {
         "model_": "Property",
         "name": "citationView",
         "type": "view",
         "defaultValueFn": function () { return this.view; },
         "help": "View component for the property when rendering within a CitationView."
      },
      {
         "model_": "Property",
         "name": "detailViewPreRow",
         "defaultValue": function () { return ""; },
         "help": "Inject HTML before row in DetailView."
      },
      {
         "model_": "Property",
         "name": "detailViewPostRow",
         "defaultValue": function () { return ""; },
         "help": "Inject HTML before row in DetailView."
      },
      {
         "model_": "Property",
         "name": "defaultValueFn",
         "label": "Default Value Function",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": "",
         "postSet": function (old, nu) {
        if ( nu && this.defaultValue ) this.defaultValue = undefined;
      },
         "help": "The property's default value function."
      },
      {
         "model_": "Property",
         "name": "dynamicValue",
         "label": "Value's Dynamic Function",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": "",
         "help": "A dynamic function which computes the property's value."
      },
      {
         "model_": "Property",
         "name": "factory",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": "",
         "help": "Factory for creating initial value when new object instantiated."
      },
      {
         "model_": "Property",
         "name": "lazyFactory",
         "type": "Function",
         "required": false,
         "view": "FunctionView",
         "help": "Factory for creating the initial value. Only called when the property is accessed for the first time."
      },
      {
         "model_": "Property",
         "name": "postSet",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": "",
         "help": "A function called after normal setter logic, but before property change event fired."
      },
      {
         "model_": "Property",
         "name": "tableFormatter",
         "label": "Table Cell Formatter",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": "",
         "help": "Function to format value for display in TableView."
      },
      {
         "model_": "Property",
         "name": "summaryFormatter",
         "label": "Summary Formatter",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": "",
         "help": "Function to format value for display in SummaryView."
      },
      {
         "model_": "Property",
         "name": "tableWidth",
         "type": "String",
         "required": false,
         "defaultValue": "",
         "help": "Table View Column Width."
      },
      {
         "model_": "Property",
         "name": "help",
         "label": "Help Text",
         "type": "String",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 6,
         "view": "TextAreaView",
         "defaultValue": "",
         "help": "Help text associated with the property."
      },
      {
         "model_": "Property",
         "name": "documentation",
         "type": "Documentation",
         "view": function () { return DetailView.create({model: Documentation}); },
         "getter": function () {
    if ( ! DEBUG ) return '';
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
  },
         "setter": function (nu) {
    if ( ! DEBUG ) return;
    this.instance_.documentation = nu;
  },
         "help": "Documentation associated with this entity."
      },
      {
         "model_": "Property",
         "name": "actionFactory",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": "",
         "help": "Factory to create the action objects for taking this property from value A to value B"
      },
      {
         "model_": "Property",
         "name": "compareProperty",
         "type": "Function",
         "displayWidth": 70,
         "displayHeight": 5,
         "view": "FunctionView",
         "defaultValue": function (o1, o2) {
        return (o1.localeCompare || o1.compareTo).call(o1, o2);
      },
         "help": "Comparator function."
      },
      {
         "model_": "Property",
         "name": "fromElement",
         "defaultValue": function (e, p) { p.fromString.call(this, e.innerHTML, p); },
         "help": "Function to extract from a DOM Element."
      },
      {
         "model_": "Property",
         "name": "toJSON",
         "defaultValue": function (visitor, output, o) {
        if ( ! this.transient ) output[this.name] = visitor.visit(o[this.name]);
      },
         "help": "Function to extract from a DOM Element."
      },
      {
         "model_": "Property",
         "name": "autocompleter",
         "subType": "Autocompleter",
         "help": "Name or model for the autocompleter for this property."
      },
      {
         "model_": "Property",
         "name": "install",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": "",
         "help": "A function which installs additional features into the Model's prototype."
      },
      {
         "model_": "Property",
         "name": "exclusive",
         "type": "Boolean",
         "view": "BooleanView",
         "defaultValue": true,
         "help": "Indicates if the property can only have a single value."
      },
      {
         "model_": "Property",
         "name": "type",
         "type": "String",
         "required": true,
         "displayWidth": 20,
         "view":          {
                        "factory_": "ChoiceView",
            "choices": [
               "Array",
               "Boolean",
               "Color",
               "Date",
               "DateTime",
               "Email",
               "Enum",
               "Float",
               "Function",
               "Image",
               "Int",
               "Object",
               "Password",
               "String",
               "String[]",
               "URL"
            ]
         },
         "defaultValue": "Boolean",
         "help": "The FOAM type of this property."
      },
      {
         "model_": "Property",
         "name": "javaType",
         "type": "String",
         "required": false,
         "displayWidth": 70,
         "defaultValue": "bool",
         "defaultValueFn": "",
         "help": "The Java type of this property."
      },
      {
         "model_": "Property",
         "name": "view",
         "type": "view",
         "defaultValue": "BooleanView",
         "help": "View component for the property."
      },
      {
         "model_": "Property",
         "name": "defaultValue",
         "type": "String",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 1,
         "defaultValue": false,
         "postSet": function (old, nu) {
        if ( nu && this.defaultValueFn ) this.defaultValueFn = undefined;
      },
         "help": "The property's default value."
      },
      {
         "model_": "Property",
         "name": "preSet",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": function (_, v) { return !!v; },
         "help": "An adapter function called before normal setter logic."
      },
      {
         "model_": "Property",
         "name": "prototag",
         "label": "Protobuf tag",
         "type": "Int",
         "required": false,
         "help": "The protobuf tag number for this field."
      },
      {
         "model_": "Property",
         "name": "fromString",
         "defaultValue": function (s, p) {
        var txt = s.trim();
        this[p.name] =
          txt.equalsIC('y')    ||
          txt.equalsIC('yes')  ||
          txt.equalsIC('true') ||
          txt.equalsIC('t');
      },
         "help": "Function to extract value from a String."
      },
      {
         "model_": "Property",
         "name": "labelName",
         "required": true
      },
      {
         "model_": "Property",
         "name": "setter",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": function (v, name) {
        var old = this.v;
        var label = this.model_[constantize(name)].labelName;
        if ( v ) this.addLabel(label); else this.removeLabel(label);
        this.propertyChange_(this.propertyTopic(name), old, v);
      },
         "help": "The property's default value function."
      },
      {
         "model_": "Property",
         "name": "getter",
         "type": "Function",
         "required": false,
         "displayWidth": 70,
         "displayHeight": 3,
         "view": "FunctionView",
         "defaultValue": function (name) {
        var label = this.model_[constantize(name)].labelName;
        return this.hasLabel(label);
      },
         "help": "The property's default value function."
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
