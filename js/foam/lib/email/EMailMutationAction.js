/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

CLASS({
   "package": "foam.lib.email",
   "name": "EMailMutationAction",
   "extends": "Action",
   "requires": [],
   "imports": [],
   "exports": [],
   "properties": [
      {
         model_: "Property",
         "name": "name",
         "type": "String",
         "required": true,
         "displayWidth": 30,
         "displayHeight": 1,
         "defaultValue": "",
         "help": "The coding identifier for the action."
      },
      {
         model_: "Property",
         "name": "label",
         "type": "String",
         "displayWidth": 70,
         "displayHeight": 1,
         "defaultValueFn": function () { return this.name.labelize(); },
         "help": "The display label for the action."
      },
      {
         model_: "Property",
         "name": "speechLabel",
         "type": "String",
         "displayWidth": 70,
         "displayHeight": 1,
         "defaultValueFn": function () { return this.label; },
         "help": "The speech label for the action."
      },
      {
         model_: "Property",
         "name": "help",
         "label": "Help Text",
         "type": "String",
         "displayWidth": 70,
         "displayHeight": 6,
         "defaultValue": "",
         "help": "Help text associated with the action."
      },
      {
         model_: "DocumentationProperty",
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
         model_: "Property",
         "name": "default",
         "type": "Boolean",
         "view": "BooleanView",
         "defaultValue": false,
         "help": "Indicates if this is the default action."
      },
      {
         type: 'Function',
         "name": "isAvailable",
         "label": "Available",
         "displayHeight": 3,
         "help": "Function to determine if action is available.",
         "displayWidth": 70,
         "defaultValue": function () { return true; }
      },
      {
         type: 'Function',
         "name": "isEnabled",
         "label": "Enabled",
         "displayHeight": 3,
         "help": "Function to determine if action is enabled.",
         "displayWidth": 70,
         "defaultValue": function () { return true; }
      },
      {
         type: 'Function',
         "name": "labelFn",
         "label": "Label Function",
         "help": "Function to determine label. Defaults to 'this.label'.",
         "defaultValue": function (action) { return action.label; }
      },
      {
         model_: "Property",
         "name": "iconUrl",
         "type": "String",
         "defaultValue": "",
         "help": "Provides a url for an icon to render for this action"
      },
      {
         model_: "Property",
         "name": "showLabel",
         "type": "String",
         "defaultValue": true,
         "help": "Property indicating whether the label should be rendered alongside the icon"
      },
      {
         model_: "Property",
         "name": "children",
         "type": "Array",
         "subType": "Action",
         "view": "ArrayView",
         "factory": function () { return []; },
         "help": "Child actions of this action."
      },
      {
         model_: "Property",
         "name": "parent",
         "type": "String",
         "help": "The parent action of this action"
      },
      {
         type: 'StringArray',
         "name": "keyboardShortcuts"
      },
      {
         model_: "Property",
         "name": "translationHint",
         "label": "Description for Translation",
         "type": "String",
         "defaultValue": ""
      },
      {
         type: 'Boolean',
         "name": "backOnComplete",
         "defaultValue": false
      },
      {
         type: 'Function',
         "name": "action",
         "displayHeight": 20,
         "help": "Function to implement action.",
         "displayWidth": 80,
         "defaultValue": "",
         "preSet": function (_, a) {
           var f = function(X, action) {
             var obj = this;
             a.apply(obj, arguments);
             var self = this;
             var sink = action.backOnComplete ?
               { put: function() { X.stack.popView(); },
                 error: function() { X.stack.popView(); } } : undefined;
             X.EMailDAO && X.EMailDAO.put(obj, sink);
           };
           f.toString = function() { return a.toString(); };
           return f
         }
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
