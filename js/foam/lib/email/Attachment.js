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
   "name": "Attachment",
   "plural": "Attachments",
   "requires": [
      "foam.util.Base64Encoder"
   ],
   "tableProperties": [
      "type",
      "filename",
      "position",
      "size"
   ],
   "properties": [
      {
         type: 'String',
         "name": "id",
         "label": "Identifier",
         "displayWidth": 50,
         "factory": function () {
           return this.$UID;
         }
      },
      {
         model_: "Property",
         "name": "filename",
         "label": "File Name",
         "type": "String",
         "displayWidth": 50,
         "view": "foam.ui.TextFieldView"
      },
      {
         model_: "Property",
         "name": "type",
         "type": "String",
         "displayWidth": 30,
         "view": "foam.ui.TextFieldView"
      },
      {
         model_: "Property",
         "name": "size",
         "type": "int",
         "displayWidth": 10,
         "view": "foam.ui.TextFieldView"
      },
      {
         model_: "Property",
         "name": "position",
         "type": "int",
         "displayWidth": 10,
         "view": "foam.ui.TextFieldView"
      },
      {
         model_: "Property",
         "name": "file",
         "type": "File",
         "hidden": true
      },
      {
         type: 'Boolean',
         "name": "inline",
         "defaultValue": false
      }
   ],
   "actions": [
      {
         model_: "Action",
         "name": "view",
         "help": "View an attachment.",
         "children": [],
         "action": function () {
         },
         "keyboardShortcuts": []
      }
   ],
   "constants": [],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "atoMime",
         "code": function (ret) {
       if ( !this.file ) {
         ret();
         return;
       }

       var self = this;

       var reader = new FileReader();
       reader.onloadend = function() {
         var data = this.Base64Encoder.create().encode(new Uint8Array(reader.result), 78);

         if ( data[data.length-1] !== '\n' ) data += '\r\n';

         var sanitizedName = self.filename
           .replace(/[\x00-\x1f]/g, '')
           .replace(/"/g, '');

         // TODO: Content disposition
         ret(
           "Content-Type: " + self.type + "; name=\"" + sanitizedName + '"\r\n' +
             (self.inline ? '' : 'Content-Disposition: attachment; filename=\"' + sanitizedName + '\"\r\n') +
             "Content-Transfer-Encoding: base64\r\n" +
             "Content-ID: <" + self.id + ">\r\n" +
             "X-Attachment-Id: " + self.id + "\r\n\r\n" +
             data);
       };
       reader.readAsArrayBuffer(this.file);
     },
         "args": []
      }
   ],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
