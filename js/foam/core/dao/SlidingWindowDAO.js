/*
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
  package: 'foam.core.dao',
  name: 'SlidingWindowDAO',
  extends: 'foam.dao.ProxyDAO',

  help: 'A DAO decorator which reduces network calls by caching a chunk of data around a given query for a period of time.',

  properties: [
    {
      name: 'queryCache',
      factory: function() { return {}; }
    },
    {
      name: 'queryTTL',
      help: 'Time to keep each query alive in ms',
      defaultValue: 10000
    },
    {
      name: 'windowSize',
      defaultValue: 20
    }
  ],
  methods: {
    select: function(sink, options) {
      if ( ! this.timeout_ ) this.timeout_ = this.X.setTimeout(this.purge, this.queryTTL);

      sink = sink || [].sink;

      var query = options && options.query;
      var order = options && options.order;
      var skip = options.skip;
      var limit = options.limit;

      var key = [
        'query=' + (query ? query.toSQL() : ''),
        'order=' + (order ? order.toSQL() : '')
      ];

      if ( Expr.isInstance(sink) ) {
        var shortcircuit = true;
        var mysink = sink.deepClone();
        key.push(sink.model_.name);
      } else {
        mysink = [].sink;
      }

      var cached = this.queryCache[key];

      // If the cached version
      if ( ! cached ||
           ! ( skip == undefined || cached[1] <= skip ) ||
           ! ( limit == undefined || cached[2] >= skip + limit ) ) {
        delete this.queryCache[key];
        skip = skip || 0;
        cached = [
          afuture(),
          Math.max(0, skip - this.windowSize / 2),
          limit == undefined ? undefined : (skip + limit + this.windowSize / 2),
          Date.now()
        ];
        this.queryCache[key] = cached;

        this.delegate.select(mysink, {
          query: query,
          order: order,
          skip: cached[1],
          limit: ( limit === undefined ) ? undefined : ( cached[2] - cached[1] )
        })(function() {
          cached[0].set(mysink);
        });
      }

      var future = afuture();

      if ( shortcircuit ) {
        cached[0].get(function(mysink) {
          sink.copyFrom(mysink);
          future.set(sink);
        });
      } else {
        cached[0].get(function(mysink) {
          mysink.select(sink, {
            skip: ( skip == undefined ) ? undefined : ( skip - cached[1] ),
            limit: ( limit == undefined ) ? undefined : limit
          })(function() {
            future.set(sink);
          });
        });
      }
      return future.get;
    }
  },
  listeners: [
    function purge() {
      this.timeout_ = undefined
      var keys = Object.keys(this.queryCache);
      var threshold = Date.now()  - this.queryTTL;
      for ( var i = 0, key; key = keys[i]; i++ )
        if ( this.queryCache[key][3] < threshold ) delete this.queryCache[key];
    }
  ]
});
