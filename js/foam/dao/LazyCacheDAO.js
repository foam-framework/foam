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


CLASS({
  package: 'foam.dao',
  name: 'LazyCacheDAO',

  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'cache',
      postSet: function(old, nu) {
        if (old) this.unlisten(old);
        if (nu) this.listen(nu);
      }
    },
    {
      type: 'Boolean',
      name: 'refreshOnCacheHit',
      defaultValue: false,
      documentation: 'When true, makes a network call in the background to ' +
          'update the record, even on a cache hit.'
    },
    {
      type: 'Boolean',
      name: 'cacheOnSelect',
      documentation: 'Whether to populate the cache on select().',
      defaultValue: false
    },
    {
      type: 'Int',
      name: 'staleTimeout',
      defaultValue: 500,
      units: 'ms',
      documentation: 'Time in milliseconds before we consider the delegate ' +
          'results to be stale for a particular query and will issue a new ' +
          'select.'
    },
    {
      name: 'finds',
      factory: function() {
        return {};
      }
    },
    {
      name: 'selects',
      factory: function() { return {}; }
    },
    {
      name: 'selectKey',
      defaultValue: function(sink, options) {
        var query = ( options && options.query && options.query.toSQL() ) || "";
        var limit = ( options && options.limit );
        var skip =  ( options && options.skip );
        var order = ( options && options.order && options.order.toSQL() ) || "";
        return [query, limit, skip, order];
      }
    }
  ],

  methods: {
    find: function(id, sink) {
      var self = this;

      // Check the in-flight finds and attach myself if there's one for this id.
      if ( this.finds[id] ) {
        this.finds[id].push(sink);
        return;
      }

      var mysink = {
        put: this.refreshOnCacheHit ?
            function() {
              self.cache.put.apply(self.cache, arguments);
              sink.put.apply(sink, arguments);
            } :
            sink.put.bind(sink),
        error: function() {
          // Another request may have come in the meantime, so check again for
          // an in-flight find for this ID.
          if (self.finds[id]) {
            self.finds[id].push(sink);
            return;
          }
          self.finds[id] = [sink];
          self.delegate.find(id, {
            put: function(obj) {
              var args = arguments;
              self.cache.put(obj, {
                put: function() {
                  var finds = self.finds[id];
                  for (var i = 0; i < finds.length; i++ ) {
                    var s = finds[i];
                    s && s.put && s.put.apply(s, args);
                  }
                  delete self.finds[id];
                }
              });
            },
            error: function() {
              var finds = self.finds[id];
              if ( finds) {
                for (var i = 0; i < finds.length; i++ ) {
                  var s = finds[i];
                  s && s.error && s.error.apply(sink, arguments);
                }
                delete self.finds[id];
              }
            }
          });
        }
      };

      this.cache.find(id, mysink);
    },
    select: function(sink, options) {
      if ( ! this.cacheOnSelect ) {
        return this.SUPER(sink, options);
      }

      sink = sink || [].sink;

      var key = this.selectKey(sink, options);
      var future = afuture();
      var self = this;

      var entry = this.selects[key];

      if ( ! entry ||
           Date.now() - this.selects[key][1] > this.staleTimeout ) {
        this.selects[key] = entry = [afuture(), Date.now()];
        this.delegate.select(this.cache, options)(function(sink) {
          self.notify_('reset', []);
          entry[0].set(sink);
        });
      }

      function readFromCache() {
        self.cache.select(sink, options)(future.set);
      }

      self.cache.select(COUNT(), options)(function(c) {
        if ( c.count > 0 ) {
          readFromCache();
        } else {
          entry[0].get(readFromCache);
        }
      });

      return future.get;
    }
  }
});
