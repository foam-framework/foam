CLASS({
   "model_": "Model",
   "id": "com.google.mail.GMailToEMailDAO",
   "package": "com.google.mail",
   "name": "GMailToEMailDAO",
   "extendsModel": "AbstractAdapterDAO",
   "requires": [
      "foam.lib.email.EMail",
      "com.google.mail.FOAMGMailMessage",
      "foam.util.Base64Encoder",
      "foam.util.Base64Decoder"
   ],
   "imports": [],
   "exports": [],
   "properties": [
      {
         "model_": "Property",
         "name": "daoListeners_",
         "hidden": true,
         "transient": true,
         "factory": function () { return []; }
      },
      {
         "model_": "Property",
         "name": "delegate",
         "type": "DAO",
         "mode": "read-only",
         "required": true,
         "hidden": true,
         "transient": true,
         "factory": function () { return NullDAO.create(); },
         "postSet": function (oldDAO, newDAO) {
        if ( this.daoListeners_.length ) {
          if ( oldDAO ) oldDAO.unlisten(this.relay());
          newDAO.listen(this.relay());
          // FutureDAOs will put via the future. In that case, don't put here.
          if ( ! FutureDAO.isInstance(oldDAO) ) this.notify_('put', []);
        }
      }
      },
      {
         "model_": "ModelProperty",
         "name": "model",
         "defaultValueFn": function () { return this.EMail; },
         "type": "Model"
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
        "model_": "Method",
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
         "model_": "Method",
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
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "aToB",
         "code": function (obj) {
      var msg = this.FOAMGMailMessage.create({
        id: obj.id,
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
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "bToA",
         "code": function (obj) {
      var self= this;
      var decode = function (str) {
        var decoder = self.Base64Decoder.create({ sink: this.X.IncrementalUtf8.create() });
        decoder.put(str);
        decoder.eof();
        return decoder.sink.string;
      }

      var body = '';
      if (obj.payload && obj.payload.body && obj.payload.body.data) {
        body = decode(obj.payload.body.data);
      } else {
        var parts = obj.payload.parts || [];
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].body.data && parts[i].mimeType == 'text/html') {
            body = decode(obj.payload.parts[i].body.data);
            break;
          }
        }
      }

      var args = {
        id: obj.id,
        convId: obj.threadId,
        labels: obj.labelIds,
        serverVersion: obj.historyId,
        // attachments: obj.attachments,
        body: body,
        snippet: obj.snippet,
        deleted: obj.deleted
      };
      this.readHeaders(obj.payload.headers || [], args);

      return this.EMail.create(args);
    },
         "args": []
      },
      {
         "model_": "Method",
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
               newoptions.query = GT(this.FOAMGMailMessage.HISTORY_ID, query.arg2);
             } else if ( MqlExpr.isInstance(query) ) {
               newoptions.query = query;
             }
           }

           return newoptions;
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
