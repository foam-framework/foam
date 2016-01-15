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
  "name": "GMailToEMailDAO",
  "extends": "foam.core.dao.AbstractAdapterDAO",
  "requires": [
    "foam.lib.email.EMail",
    "com.google.mail.FOAMGMailMessage",
    "foam.util.Base64Encoder",
    "foam.util.Base64Decoder",
    "foam.util.encodings.IncrementalUtf8"
  ],
  "properties": [
    {
      type: 'Model',
      "name": "model",
      "defaultValueFn": function () { return this.EMail; },
      "type": "Model"
    }
  ],
  "methods": [
    {
      model_: "Method",
      "name": "adaptSink_",
      "code": function(sink) {
        if ( MaxExpr.isInstance(sink) &&
             sink.arg1 == this.EMail.CLIENT_VERSION ) {
          return MAX(this.FOAMGMailMessage.CLIENT_VERSION, sink.arg2);
        }
        return this.SUPER(sink);
      }
    },
    {
      model_: "Method",
      "name": "init",
      "code": function (args) {
        this.SUPER(args);

        var identityMap = function(x) { return x; };
        var toArrayMap = function(x) {
          return x.split(',').map(function(x) { return x.trim();});
        };
        var fromArrayMap = function(x) {
          return x.join(', ');
        };
        var headersMap = [
          ['Date', 'timestamp', identityMap, identityMap],
          ['From', 'from', identityMap, identityMap],
          ['To', 'to', identityMap, identityMap],
          ['Cc', 'cc', toArrayMap, fromArrayMap],
          ['Bcc', 'bcc', toArrayMap, fromArrayMap],
          ['Reply-To', 'replyTo', toArrayMap, fromArrayMap],
          ['Subject', 'subject', identityMap, identityMap]
        ];

        this.writeHeaders = function(headers, obj) {
          for ( var i = 0, mapping; mapping = headersMap[i]; i++ ) {
            if ( ! obj.hasOwnProperty(mapping[1]) ) continue;
            if ( Array.isArray(obj[mapping[1]]) && obj[mapping[1]].length == 0 ) continue;

            headers.push({
              name: mapping[0],
              value: mapping[3](obj[mapping[1]])
            });
          }
        }
        this.readHeaders = function(headers, obj) {
          var map = {};
          for ( var i = 0; i < headers.length; i++ ) {
            map[headers[i].name] = headers[i].value;
          }

          for ( var i = 0, mapping; mapping = headersMap[i]; i++ ) {
            if ( ! map.hasOwnProperty(mapping[0]) ) continue;
            obj[mapping[1]] = mapping[2](map[mapping[0]]);
          }
        }
      }
    },
    {
      model_: "Method",
      "name": "aToB",
      "code": function (obj) {
        var msg = this.FOAMGMailMessage.create({
          id: obj.gmailId,
          emailId: obj.id,
          labelIds: obj.labels,
          isSent: obj.messageSent,
          clientVersion: obj.clientVersion,
          snippet: obj.snippet,
          deleted: obj.deleted
        });

        var headers = [];
        headers.push({ name: 'MIME-Version', value: '1.0' });
        headers.push({ name: 'Content-Type', value: 'text/html; charset=UTF-8' });
        this.writeHeaders(headers, obj);
        var payload = {
          headers: headers,
          body: {
            size: obj.body.length,
            data: this.Base64Encoder.create({ urlSafe: true }).encode(new Uint8Array(stringtoutf8(obj.body)))
          }
        };

        msg.payload = payload;
        return msg;
      }
    },
    {
      model_: "Method",
      "name": "bToA",
      "code": function (obj) {
        var self= this;
        var decode = function (str) {
          var decoder = self.Base64Decoder.create({ sink: self.IncrementalUtf8.create() });
          decoder.put(str);
          decoder.eof();
          return decoder.sink.string;
        }

        var body = '';

        // Find the html body.
        var plainBody;
        var richBody;

        (function go(part) {
          if ( part.mimeType === 'text/plain' ) plainBody = part;
          else if ( part.mimeType === 'text/html' ) richBody = part;
          else if ( part.parts ) {
            for ( var i = 0; i < part.parts.length; i++ ) go(part.parts[i]);
          }
        })(obj.payload);

        if ( richBody ) body = decode(richBody.body.data);
        else if ( plainBody ) body = '<pre>' + decode(plainBody.body.data) + '</pre>';

        var args = {
          gmailId: obj.id,
          convId: obj.threadId,
          labels: obj.labelIds,
          serverVersion: obj.historyId,
          // attachments: obj.attachments,
          body: body,
          plainBody: decode(plainBody.body.data),
          snippet: obj.snippet,
          deleted: obj.deleted
        };
        if ( obj.emailId ) {
          args.id = obj.emailId;
        }
        this.readHeaders(obj.payload.headers || [], args);

        return this.EMail.create(args);
      }
    },
    {
      model_: "Method",
      "name": "adaptOptions_",
      "code": function (options) {
        var newoptions = {};

        if ( ! options ) return;

        if ( options.limit ) newoptions.limit = options.limit;
        if ( options.skip ) newoptions.skip = options.skip;

        if ( options.query ) {
          var query = options.query;
          if ( EqExpr.isInstance(query) &&
               this.EMail.LABELS === query.arg1 ) {
            newoptions.query = EQ(this.FOAMGMailMessage.LABEL_IDS, query.arg2);
          } else if ( GtExpr.isInstance(query) &&
                      query.arg1 == this.EMail.SERVER_VERSION ) {
            newoptions.query = GT(this.FOAMGMailMessage.getPrototype().HISTORY_ID, query.arg2);
          } else if ( MQLExpr.isInstance(query) ) {
            newoptions.query = query;
          }
        }

        return newoptions;
      }
    }
  ]
});
