CLASS({
   "model_": "Model",
   "id": "foam.lib.email.ConversationAction",
   "package": "foam.lib.email",
   "name": "ConversationAction",
   "extendsModel": "Action",
   "requires": [],
   "imports": [],
   "exports": [],
   "properties": [
      {
         "model_": "Property",
         "name": "label",
         "type": "String",
         "displayWidth": 70,
         "displayHeight": 1,
         "defaultValueFn": function () { return this.name.labelize(); },
         "help": "The display label for the action."
      },
      {
         "model_": "Property",
         "name": "speechLabel",
         "type": "String",
         "displayWidth": 70,
         "displayHeight": 1,
         "defaultValueFn": function () { return this.label; },
         "help": "The speech label for the action."
      },
      {
         "model_": "DocumentationProperty",
         "name": "documentation",
         "getter": function () {
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
        return this.instance_.documentation;
      }
      },
      {
         "model_": "Property",
         "name": "default",
         "type": "Boolean",
         "view": "BooleanView",
         "defaultValue": false,
         "help": "Indicates if this is the default action."
      },
      {
         "model_": "FunctionProperty",
         "name": "isAvailable",
         "label": "Available",
         "displayHeight": 3,
         "help": "Function to determine if action is available.",
         "displayWidth": 70,
         "defaultValue": function () { return true; }
      },
      {
         "model_": "FunctionProperty",
         "name": "isEnabled",
         "label": "Enabled",
         "displayHeight": 3,
         "help": "Function to determine if action is enabled.",
         "displayWidth": 70,
         "defaultValue": function () { return true; }
      },
      {
         "model_": "FunctionProperty",
         "name": "labelFn",
         "label": "Label Function",
         "help": "Function to determine label. Defaults to 'this.label'.",
         "defaultValue": function (action) { return action.label; }
      },
      {
         "model_": "Property",
         "name": "showLabel",
         "type": "String",
         "defaultValue": true,
         "help": "Property indicating whether the label should be rendered alongside the icon"
      },
      {
         "model_": "Property",
         "name": "children",
         "type": "Array",
         "subType": "Action",
         "view": "ArrayView",
         "factory": function () { return []; },
         "help": "Child actions of this action."
      },
      {
         "model_": "Property",
         "name": "parent",
         "type": "String",
         "help": "The parent action of this action"
      },
      {
         "model_": "StringArrayProperty",
         "name": "keyboardShortcuts"
      },
      {
         "model_": "Property",
         "name": "translationHint",
         "label": "Description for Translation",
         "type": "String",
         "defaultValue": ""
      },
      {
         "model_": "Property",
         "name": "name",
         "type": "String",
         "required": true,
         "displayWidth": 30,
         "displayHeight": 1,
         "defaultValue": "",
         "defaultValueFn": function () {
        return this.delegate ? this.delegate.name : 'ConversationAction';
      },
         "help": "The coding identifier for the action."
      },
      {
         "model_": "Property",
         "name": "iconUrl",
         "type": "String",
         "defaultValue": "",
         "defaultValueFn": function () { return this.delegate.iconUrl; },
         "help": "Provides a url for an icon to render for this action"
      },
      {
         "model_": "Property",
         "name": "help",
         "label": "Help Text",
         "type": "String",
         "displayWidth": 70,
         "displayHeight": 6,
         "defaultValue": "",
         "defaultValueFn": function () { return this.delegate.help; },
         "help": "Help text associated with the action."
      },
      {
         "model_": "ModelProperty",
         "name": "delegate"
      },
      {
         "model_": "FunctionProperty",
         "name": "action",
         "displayHeight": 20,
         "help": "Function to implement action.",
         "displayWidth": 80,
         "defaultValue": function (action) {
        var emails = this.emails;
        if ( action.applyOnAll ) {
          emails.forEach(function(e) {
            action.delegate.action.call(e);
          });
        } else if ( emails.length ) {
          var e = emails[emails.length - 1];
          action.delegate.action.call(e);
        }
      }
      },
      {
         "model_": "Property",
         "name": "applyOnAll",
         "defaultValue": true
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
