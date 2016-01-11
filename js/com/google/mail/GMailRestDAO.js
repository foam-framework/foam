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
   "name": "GMailRestDAO",
   "extends": "foam.core.dao.RestDAO",
   "requires": [
      "com.google.mail.GMailHistory"
   ],
   "imports": [
      "ajsonp"
   ],
   "exports": [],
   "properties": [
      {
         model_: "Property",
         "name": "daoListeners_",
         "hidden": true,
         "transient": true,
         "factory": function () { return []; }
      },
      {
         model_: "Property",
         "name": "model",
         "label": "Type of data stored in this DAO."
      },
      {
         type: 'Array',
         "name": "paramProperties",
         "help": "Properties that are handled as separate parameters rather than in the query.",
         "subType": "Property"
      },
      {
         type: 'Int',
         "name": "batchSize",
         "defaultValue": 200
      },
      {
         type: 'Int',
         "name": "skipThreshold",
         "defaultValue": 1000
      },
      {
         model_: "Property",
         "name": "url",
         "label": "REST API URL.",
         "defaultValue": "https://www.googleapis.com/gmail/v1/users"
      },
      {
         model_: "Property",
         "name": "modelName",
         "defaultValueFn": function () { return this.model.plural; }
      },
      {
         model_: "Property",
         "name": "xhr",
         "transient": true,
         "factory": function () { return this.X.XHR.create({ responseType: 'json' }, this.Y); }
      },
      {
         model_: "Property",
         "name": "ajsonp",
         "hidden": true,
         "transient": true
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "buildURL",
         "code": function () {
      return this.url + '/me/' + this.modelName;
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "buildSelectParams",
         "code": function (sink, query) {
      var params = [];
      if ( CountExpr.isInstance(sink) ) params.push('maxResults=1');
      if ( this.GMailHistory.isSubModel(this.model) &&
           GtExpr.isInstance(query) &&
           query.arg1 === this.GMailHistory.ID ) {
        params.push('startHistoryId=' + query.arg2.f());
      }
      if ( this.model.LABEL_IDS && EqExpr.isInstance(query) &&
           this.model.LABEL_IDS == query.arg1 ) {
        params.push('labelIds=' + encodeURIComponent(query.arg2));
      }
      // TODO: Split MQLable queries apart from non MQLable queries.
      // if ( query ) params.push('q=' + encodeURIComponent(query.toMQL()));
      return params;
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "select",
         "code": function (sink, options) {
      sink = sink || [];

      if ( options && ! CountExpr.isInstance(sink) ) sink = this.decorateSink_(sink, options);

      options = options || {};
      var params = this.buildSelectParams(sink, options.query);
      if ( options.limit && ! options.query ) params.push('maxResults=' + options.limit);
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
            if ( ! data || ! data[self.modelName] ) {
              fc.error("No data");
              ret();
              return;
            }

            if ( CountExpr.isInstance(sink) ) {
              sink.count = data.resultSizeEstimate;
              fc.stop();
            }

            var items = data[self.modelName];
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
         "args": []
      },
      {
         model_: "Method",
         "name": "onSelectData",
         "code": function (ret, data, sink, fc) {
      sink.put && sink.put(this.jsonToObj(data), null, fc);
      ret();
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "find",
         "code": function (key, sink, options) {
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
         "args": []
      },
      {
         model_: "Method",
         "name": "buildFindURL",
         "code": function (key) {
      return this.url + '/me/' + this.modelName + '/' + key;
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "buildFindParams",
         "code": function (urlParams) {
      var params = urlParams || [];
      return params;
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
