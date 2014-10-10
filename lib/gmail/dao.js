/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

MODEL({
  name: 'GMailRestDAO',
  extendsModel: 'RestDAO',

  properties: [
    {
      name: 'url',
      defaultValue: 'https://www.googleapis.com/gmail/v1/users'
    },
    {
      name: 'xhr',
      factory: function() { return this.__ctx__.XHR.create({ responseType: 'json' }); }
    }
  ],

  methods: {
    buildURL: function() {
      return this.url + '/me/' + this.model.plural;
    },
    buildSelectParams: function(sink, query) {
      var params = [];
      if ( CountExpr.isInstance(sink) ) params.push('maxResults=1');
      if ( GMailHistory.isSubModel(this.model) &&
           GtExpr.isInstance(query) &&
           query.arg1 === GMailHistory.ID ) {
        params.push('startHistoryId=' + query.arg2.f());
      }
      // TODO: Split MQLable queries apart from non MQLable queries.
      // if ( query ) params.push('q=' + encodeURIComponent(query.toMQL()));
      return params;
    },
    select: function(sink, options) {
      sink = sink || [];

      if ( options && ! CountExpr.isInstance(sink) ) sink = this.decorateSink_(sink, options);

      options = options || {};
      var params = this.buildSelectParams(sink, options.query);
      options.limit && params.push('maxResults=' + options.limit);
      var url = this.buildURL();

      var fc = this.createFlowControl_();
      var self = this;
      var future = afuture();
      var pageToken;

      awhile(
        function() { return ! fc.stopped && ! fc.errorEvt; },
        aseq(
          function(ret) {
            var p = pageToken ? params.concat('pageToken=' + pageToken) : params;
            self.xhr.asend(ret, url + "?" + p.join('&'));
          },
          function(ret, data) {
            if ( ! data || ! data[self.model.plural] ) {
              fc.error("No data");
              ret();
              return;
            }

            if ( CountExpr.isInstance(sink) ) {
              sink.count = data.resultSizeEstimate;
              fc.stop();
            }

            var items = data[self.model.plural];
            var i = 0;

            pageToken = data.nextPageToken;

            awhile(function() { return i < items.length; },
                   function(ret) {
                     if ( fc.stopped ) {
                       i = items.length;
                       ret();
                       return;
                     }
                     if ( fc.errorEvt ) {
                       sink.error && sink.error(fc.errorEvt);
                       i = items.length;
                       ret();
                       return;
                     }
                     self.onSelectData(ret, items[i++], sink, fc);
                   })(ret);
          },
          function(ret) {
            if (!pageToken) {
              fc.stop();
            }
            ret();
          }))(function() {
            sink.eof && sink.eof();
            future.set(sink);
          });

      return future.get;
    },
    onSelectData: function(ret, data, sink, fc) {
      sink.put && sink.put(this.jsonToObj(data), null, fc);
      ret();
    },
    find: function(key, sink, options) {
      options = options || {};
      var self = this;
      var obj;
      aseq(
        function(ret) {
          self.xhr.asend(
            ret,
            self.buildFindURL(key) +
              "?" + self.buildFindParams(options.urlParams).join('&'));
        },
        function(ret, response, xhr) {
          if ( xhr.status < 200 || xhr.status >= 300 || ! response  ) {
            sink && sink.error & sink.error(['Failed to find message.', xhr.status]);
            return;
          }
          obj = self.jsonToObj(response);
          sink && sink.put && sink.put(obj);
          ret();
        })(function(){});
    },
    buildFindURL: function(key) {
      return this.url + '/me/' + this.model.plural + '/' + key;
    },
    buildFindParams: function(urlParams) {
      var params = urlParams || [];
      return params;
    },
  }
});

MODEL({
  name: 'FOAMGMailMessage',
  extendsModel: 'GMailMessage',
  plural: 'messages',

  properties: [
    { model_: 'StringProperty', name: 'messageId' },
    { model_: 'BooleanProperty', name: 'isSent', defaultValue: false }
  ],

  methods: {
    toRaw: function() {
      var buffer = "";

      function doPart(p) {
        for ( var i = 0, header; header = p.headers[i]; i++ ) {
          buffer += header.name + ": " + header.value + "\r\n";
          if ( header.name === "Content-Type" && header.value.startsWith("multipart") )
            var boundary = header.value.match(/boundary=([\S]+)/)[1];
        }
        buffer += "\r\n";

        if ( p.body && p.body.size > 0 ) {
          var decoder = this.__ctx__.Base64Decoder.create(this.__ctx__.IncrementalUtf8.create(), p.body.size);
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
        obj.raw = this.__ctx__.Base64Encoder.create({ urlSafe: true }).encode(new Uint8Array(stringtoutf8(buffer)));
      }
      return obj;
    }
  }
});

MODEL({
  name: 'GMailMessageDAO',
  extendsModel: 'GMailRestDAO',

  properties: [
    { name: 'model', defaultValueFn: function() { return this.__ctx__.FOAMGMailMessage; }, hidden: true },
    { name: 'messageUrl', defaultValueFn: function() { return this.url + '/me/messages'; } },
    { name: 'draftUrl', defaultValueFn: function() { return this.url + '/me/drafts'; } },
    { name: 'draftDao', factory: function() { return this.__ctx__.GMailRestDAO.create({ model: GMailDraft }); }, hidden: true },
    { name: 'localDao', factory: function() { return this.__ctx__.NullDAO.create({ model: GMailMessage }); }, hidden: true },

    { name: 'historyDao', factory: function() { return this.__ctx__.GMailRestDAO.create({ model: GMailHistory }); }, hidden: true },
    { name: 'lastHistoryId' },
    { model_: 'IntProperty', name: 'pollingPeriod', units: 'ms', defaultValue: 10000 },
    { model_: 'BooleanProperty', name: 'syncing', defaultValue: false }
  ],

  methods: {
    listen: function(l, options) {
      this.SUPER(l, options);
      if ( this.daoListeners_.length === 1 ) {
        this.startSync();
      }
    },
    unlisten: function(l) {
      this.SUPER(l);
      if ( this.daoListeners_.length === 0 ) {
        this.stopSync();
      }
    },
    doSync: function(ret) {
      var self = this;
      this.historyDao
        .where(GT(GMailHistory.ID, self.lastHistoryId))
        .select({
          put: function(item) {
            self.lastHistoryId = item.id;
            for ( var i = 0, msg; msg = item.messages[i]; i++ ) {
              self.find(msg.id, {
                put: function(obj) {
                  self.notify_('put', [obj]);
                },
                error: function(_, status) {
                  if ( status === 404 ) {
                    // TODO: Don't be so specific, distinguish between network error versus object not found error?
                    var obj = self.jsonToObj(msg);
                    self.notify_('remove', [obj]);
                    return;
                  }
                  // TODO: Handle failing to fetch a message that should be there.
                }
              });
            }
          },
          error: function() {
            ret();
          },
          eof: function() {
            ret();
          }
        });
    },
    startSync: function() {
      var self = this;
      if ( this.syncing ) return;
      aseq(
        function(ret) {
          self.syncing = true;
          if ( ! self.lastHistoryId ) {
            self.limit(1).select()(function(msgs) {
              if ( ! msgs || msgs.length === 0 ) {
                // Auto restart sync every 60 seconds.
                self.__ctx__.setTimeout(self.startSync.bind(self), 60000);
                return;
              }
              self.lastHistoryId = msgs[0].historyId;
              ret();
            });
            return;
          }
          ret();
        },
        awhile(
          function() { return self.syncing; },
          aseq(
            function(ret) {
              self.doSync(ret);
            },
            function(ret) {
              self.__ctx__.setTimeout(ret, self.pollingPeriod);
            })))(function(){});
    },
    stopSync: function() {
      this.syncing = false;
    },
    onSelectData: function(ret, data, sink, fc) {
      if ( ! sink || ! sink.put ) { ret(); return; }

      var self = this;
      var obj;
      aseq(
        function(ret) {
          self.find(data.id, {
            put: function(o) { obj = o; ret(); },
            error: function() {
              fc.error('Failed to find');
              return;
            }
          });
        },
        aif(function() { return obj.labelIds.indexOf('DRAFT') != -1; },
            aseq(
              function(ret) {
                self.setDraftId_(ret, obj);
              },
              function(ret, success) {
                if ( ! success ) {
                  fc.error('Could not find matching draft for ' + obj.id);
                }
                ret();
              })),
        function(ret) {
          if ( ! fc.errorEvt ) sink.put(obj, null, fc);
          ret();
        })(ret);
    },
    setDraftId_: function(ret, obj) {
      var self = this;
      self.draftDao.where(EQ({partialEval: function() { return this }, f: function(o) { return o.message.id; }}, obj.id)).limit(1).select()(function(drafts) {
        if ( drafts.length === 0 ) {
          ret(false);
          return;
        }

        obj.messageId = obj.id;
        obj.id = 'draft_' + drafts[0].id;
        ret(true);
      });
    },
    sendDraft_: function(ret, obj, sink) {
      var self = this;
      aseq(
        function(ret) {
          self.xhr.asend(ret, self.draftUrl + '/send',
                         JSON.stringify({ id: obj.id.substring(6) }),
                         "POST");
        },
        function(ret, response, xhr) {
          if ( xhr.status < 200 || xhr.status >= 300 ) {
            sink && sink.error && sink.error(['Could not send']);
            ret();
            return;
          }
          sink && sink.put && sink.put(obj);
          if ( self.daoListeners_ && self.daoListeners_.length > 0 ) {
            self.notify_('remove', [obj]);
            self.find(response.id, {
              put: ret,
              error: function() {
                console.warn('Error reading back sent message.');
              }
            });
          }
        },
        function(ret, msg) {
          if ( msg ) {
            self.notify_('put', [msg]);
          }
          ret();
        })(ret);
    },
    saveDraft_: function(ret, obj, url, method, sink) {
      var self = this;
      aseq(
        function(ret) {
          // TODO: Updating a draft requires the RAW payload.
          var raw = obj.toRaw();
          var payload = {
            id: obj.id.substring(6),
            message: {
              raw: raw.raw,
              labelIds: raw.labelIds
            }
          };
          var formatter = {
            __proto__: JSONUtil.pretty,
            outputModel_: function(){}
          }.where(NOT(IN(Property.NAME, ['messageId', 'isDraft'])));
          

          self.xhr.asend(ret, self.draftUrl + url, formatter.stringify(payload), method);
        },
        function(ret, response, xhr) {
          if ( xhr.status < 200 || xhr.status >= 300 ) {
            sink && sink.error && sink.error(['Error updating/creating draft.', url, method]);
            return;
          }
          self.find('draft_' + response.id, {
            put: function(obj) {
              ret(obj);
            },
            error: function() {
              sink && sink.error && sink.error(['Error fetching created message.']);
            }
          });
        })(ret);
    },
    put: function(obj, sink) {
      var self = this;
      var jsonToObj;
      var dstUrl;
      var dstMethod;
      aif(
        function() { return obj.labelIds.indexOf('DRAFT') != -1; },
        aseq(
          function(ret) {
            if ( ! obj.id || obj.id.length <= 6 ) {
              // TODO: hack.
              ret(null, { status: 404 });
              return;
            }
            self.xhr.asend(ret, self.draftUrl + '/' + obj.id.substring(6) + '?format=minimal');
          },
          function(ret, response, xhr) {
            dstUrl = '/' + obj.id.substring(6);
            dstMethod = "PUT";
            if ( xhr.status === 404 ) {
              dstUrl = "";
              dstMethod = "POST";
            }
            else if ( xhr.status !== 200 ) {
              sink && sink.error && sink.error(["Can't fetch draft."]);
              return;
            }
            self.saveDraft_(ret, obj, dstUrl, dstMethod, sink);
          },
          aif(obj.isSent,
              function(ret, draft) { self.sendDraft_(ret, draft, sink); },
              function(ret, draft) { sink && sink.put && sink.put(obj); }
             )),
        aseq(
          function(ret) {
            self.xhr.asend(ret, self.messageUrl + '/' + obj.id + '?format=minimal');
          },
          function(ret, response, xhr) {
            if ( xhr.status < 200 || xhr.status >= 300 ) {
              sink && sink.error && sink.error(['Error fetching message for comparison.']);
              return;
            }
            var msg = self.jsonToObj(response);
            var diff = msg.labelIds.diff(obj.labelIds);
            var payload = {
              addLabelIds: diff.added,
              removeLabelIds: diff.removed
            };
            self.xhr.asend(ret, self.messageUrl + '/' + obj.id + '/modify', JSON.stringify(payload), "POST");
          },
          function(ret, response, xhr) {
            if ( xhr.status < 200 || xhr.status >= 300 ) {
              sink && sink.error && sink.error(['Error modifying message.']);
              return;
            }
            obj = obj.clone();
            obj.labelIds = response.labelIds;
            sink && sink.put && sink.put(obj);
          }
        ))(function(){});
    },
    remove: function(obj, sink) {
      sink && sink.error && sink.error('Unimplemented.');
    },
    find: function(key, sink) {
      if ( key.startsWith('draft_') ) {
        this.findDraft_(key, sink);
        return;
      }
      this.SUPER(key, {
        put: function(o) {
          if ( o.labelIds.indexOf('DRAFT') !== -1 ) {
            sink && sink.error && sink.error([key, 'is a draft, find by draft id instead.']);
            return;
          }
          sink && sink.put && sink.put(o);
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      });
    },
    findDraft_: function(key, sink) {
      var self = this;
      aseq(
        function(ret) {
          self.xhr.asend(ret, self.draftUrl + '/' + key.substring(6) + '?format=full');
        },
        function(ret, response, xhr) {
          if ( xhr.status < 200 || xhr.status >= 300 || ! response ) {
            sink && sink.error && sink.error(['Error fetching draft', response, xhr]);
            return;
          }
          var msg = self.jsonToObj(response.message);
          msg.messageId = msg.id;
          msg.id = "draft_" + response.id;
          sink && sink.put && sink.put(msg);
          ret();
        })(function(){});
    }
  }
});

MODEL({
  name: 'GMailToEMailDAO',
  extendsModel: 'AbstractAdapterDAO',
  properties: [
    {
      name: 'model',
      defaultValue: EMail
    }
  ],
  methods: {
    init: function(args) {
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

    aToB: function(obj) {
      var msg =  this.__ctx__.FOAMGMailMessage.create({
        id: obj.id,
        labelIds: obj.labels,
        isSent: obj.messageSent
      });

      var headers = [];
      this.writeHeaders(headers, obj);
      headers.push({ name: 'MIME-Version', value: '1.0' });
      headers.push({ name: 'Date', value: obj.timestamp.toString() });
      headers.push({ name: 'From', value: obj.from });
      headers.push({ name: 'To', value: obj.to });
      obj.cc.length > 0 && headers.push({ name: 'Cc', value: obj.cc });
      obj.bcc.length > 0 && headers.push({ name: 'Bcc', value: obj.bcc });
      obj.replyTo.length > 0 && headers.push({ name: 'Reply-To', value: obj.replyTo });
      headers.push({ name: 'Subject', value: obj.subject });
      headers.push({ name: 'Content-Type', value: 'text/html; charset=UTF-8' });
      var payload = {
        headers: headers,
        body: {
          size: obj.body.length,
          data: this.__ctx__.Base64Encoder.create({ urlSafe: true }).encode(new Uint8Array(stringtoutf8(obj.body)))
        }
      };

      msg.payload = payload;
      return msg;
    },
    bToA: function(obj) {
      var decode = function (str) {
        var decoder = this.__ctx__.Base64Decoder.create(this.__ctx__.IncrementalUtf8.create());
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
        historyId: obj.historyId,
        // attachments: obj.attachments,
        body: body,
        snippet: obj.snippet
      };
      this.readHeaders(obj.payload.headers || [], args);

      return this.__ctx__.EMail.create(args);
    },
    adaptOptions_: function(options) {
      return {};
    }
  }
});
