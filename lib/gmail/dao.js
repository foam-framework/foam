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

FOAModel({
  name: 'GMailRestDAO',
  extendsModel: 'RestDAO',

  properties: [
    {
      name: 'url',
      defaultValue: 'https://www.googleapis.com/gmail/v1/users'
    }
  ],

  methods: {
    buildURL: function() {
      return this.url + '/me/' + this.model.plural;
    },
    buildSelectParams: function(sink, query) {
      var params = [];
      if ( CountExpr.isInstance(sink) ) params.push('maxResults=1');
      if ( query ) return ['q=' + encodeURIComponent(query.toMQL())];
      return [];
    },
    select: function(sink, options) {
      sink = sink || [];

      if ( options ) sink = this.decorateSink_(sink, options);

      var params = this.buildSelectParams(sink, options ? options.query : null)
      var url = this.buildURL();

      var fc = this.createFlowControl_();
      var self = this;
      var future = afuture();
      var pageToken;

      awhile(
        function() { return ! fc.stopped && ! fc.errorEvt; },
        aseq(
          function(ret) {
            var p = pageToken ? params.concat(pageToken) : params;
            self.X.ajsonp(url, params)(ret);
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

            pageToken = data.nextPageToken;

            for ( var i = 0; i < data[self.model.plural].length; i++ ) {
              if ( fc.stopped ) break;
              if ( fc.errorEvt ) {
                sink.error && sink.error(fc.errorEvt);
                break;
              }

              sink.put && sink.put(self.jsonToObj(data[self.model.plural][i]), null, fc);
            }
            ret();
          }))(function() {
            sink.eof && sink.eof();
            future.set(sink);
          });

      return future.get;
    },
    buildFindURL: function(key) {
      return this.url + '/me/' + this.model.plural + '/' + key;
    },
    buildFindParams: function(key) {
      return ['format=full'];
    }
  }
});
