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
   "package": "com.google.mail",
   "name": "FOAMGMailMessage",
   "extends": "com.google.mail.GMailMessage",
   "plural": "messages",
   "requires": [
      "foam.util.Base64Decoder",
      "foam.util.Base64Encoder",
      "foam.util.encodings.IncrementalUtf8"
   ],
   "imports": [],
   "exports": [],
  "properties": [
    {
      name: 'emailId'
    },
      {
         type: 'String',
         "name": "historyId",
         "help": "The ID of the last history record that modified this message."
      },
      {
         type: 'String',
         "name": "id",
         "help": "The immutable ID of the message."
      },
      {
         type: 'StringArray',
         "name": "labelIds",
         "help": "List of IDs of labels applied to this message."
      },
      {
         model_: "Property",
         "name": "payload",
         "subType": "MessagePart",
         "help": "The parsed email structure in the message parts."
      },
      {
         type: 'String',
         "name": "raw",
         "help": "The entire email message in an RFC 2822 formatted string. Returned in messages.get and drafts.get responses when the format=RAW parameter is supplied."
      },
      {
         type: 'Int',
         "name": "sizeEstimate",
         "help": "Estimated size in bytes of the message."
      },
      {
         type: 'String',
         "name": "snippet",
         "help": "A short part of the message text."
      },
      {
         type: 'String',
         "name": "threadId",
         "help": "The ID of the thread the message belongs to. To add a message or draft to a thread, the following criteria must be met: \u000a- The requested threadId must be specified on the Message or Draft.Message you supply with your request. \u000a- The References and In-Reply-To headers must be set in compliance with the <a href=\"https://tools.ietf.org/html/rfc2822\"RFC 2822 standard. \u000a- The Subject headers must match."
      },
      {
         type: 'Boolean',
         "name": "deleted"
      },
      {
         type: 'Boolean',
         "name": "isSent",
         "defaultValue": false
      },
      {
         type: 'Int',
         "name": "clientVersion"
      },
      {
         type: 'String',
         "name": "draftId"
      },
      {
         type: 'String',
         "name": "messageId"
      }
   ],
   "actions": [],
   "constants": [
      {
         model_: "Constant",
         "name": "FOAM_MESSAGEID_HEADER",
         "value": "X-FOAM-Message-ID"
      }
   ],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "getHeader",
         "code": function (name) {
      if ( ! this.payload ) return null;
      for ( var i = 0; i < this.payload.headers.length; i++ ) {
        if ( this.payload.headers[i].name === name )
          return this.payload.headers[i].value;
      }
      return null;
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "setHeader",
         "code": function (name, value) {
      if ( ! this.payload ) return;

      for ( var i = 0; i < this.payload.headers.length; i++ ) {
        if ( this.payload.headers[i].name === name ) {
          this.payload.headers[i].value = value;
          return;
        }
      }
      this.payload.headers.push({
        name: name,
        value: value
      });
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "toRaw",
         "code": function () {
      var buffer = "";

      var self = this;
      function doPart(p) {
        for ( var i = 0, header; header = p.headers[i]; i++ ) {
          buffer += header.name + ": " + header.value + "\r\n";
          if ( header.name === "Content-Type" && header.value.startsWith("multipart") )
            var boundary = header.value.match(/boundary=([\S]+)/)[1];
        }
        buffer += "\r\n";

        if ( p.body && p.body.size > 0 ) {
          var decoder = self.Base64Decoder.create({ sink: this.IncrementalUtf8.create(), bufsize: p.body.size });
          decoder.put(p.body.data);
          decoder.eof();

          buffer += decoder.sink.string;
        }

        if ( p.parts && p.parts.length > 0 ) {
          for ( var i = 0, part; part = p.parts[i]; i++ ) {
            buffer += "--" + boundary + "\r\n";
            doPart(part);
            buffer += "\r\n";
          }
          buffer += "--" + boundary + "--\r\n";
        }
      }

      var obj = this.clone();
      obj.clearProperty('payload');
      if ( ! obj.raw )  {
        doPart(this.payload);
        obj.raw = this.Base64Encoder.create({ urlSafe: true }).encode(new Uint8Array(stringtoutf8(buffer)));
      }
      return obj;
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
