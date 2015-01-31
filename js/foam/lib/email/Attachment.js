CLASS({
   "model_": "Model",
   "id": "foam.lib.email.Attachment",
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
         "model_": "StringProperty",
         "name": "id",
         "label": "Identifier",
         "displayWidth": 50,
         "factory": function () {
           return this.$UID;
         }
      },
      {
         "model_": "Property",
         "name": "filename",
         "label": "File Name",
         "type": "String",
         "displayWidth": 50,
         "view": "TextFieldView"
      },
      {
         "model_": "Property",
         "name": "type",
         "type": "String",
         "displayWidth": 30,
         "view": "TextFieldView"
      },
      {
         "model_": "Property",
         "name": "size",
         "type": "int",
         "displayWidth": 10,
         "view": "TextFieldView"
      },
      {
         "model_": "Property",
         "name": "position",
         "type": "int",
         "displayWidth": 10,
         "view": "TextFieldView"
      },
      {
         "model_": "Property",
         "name": "file",
         "type": "File",
         "hidden": true
      },
      {
         "model_": "BooleanProperty",
         "name": "inline",
         "defaultValue": false
      }
   ],
   "actions": [
      {
         "model_": "Action",
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
         "model_": "Method",
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
