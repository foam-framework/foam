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
  name: 'LRUCachingDAO',
  package: 'foam.core.dao',

  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      type: 'Int',
      name: 'maxSize',
      defaultValue: 100
    },
    {
      name: 'cacheFactory',
      defaultValueFn: function() { return MDAO; }
    },
    {
      name: 'cache',
      hidden: true
    },
  ],

  models: [
    {
      model_: 'Model',
      name: 'LRUCacheItem',
      ids: ['id'],
      properties: [
        {
          name: 'id',
        },
        {
          name: 'obj',
        },
        {
          type: 'DateTime',
          name: 'timestamp'
        }
      ]
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER();
      this.cache = this.cacheFactory.create({
        model: this.LRUCacheItem
      });
      var self = this;
      this.delegate.listen({
        remove: function(obj) {
          self.cache.remove(obj);
        }
      });
    },
    find: function(id, sink) {
      var self = this;
      this.cache.find(id, {
        put: function(obj) {
          obj.timestamp = new Date();
          self.cache.put(obj, {
            put: function() {
              sink && sink.put && sink.put(obj.obj);
            }
          });
        },
        error: function() {
          self.delegate.find(id, {
            put: function(obj) {
              self.cache.put(self.LRUCacheItem.create({
                id: id,
                timestamp: new Date(),
                obj: obj
              }), {
                put: function(obj) {
                  sink && sink.put && sink.put(obj.obj);
                  self.cleanup_();
                },
                error: function() {
                  sink && sink.error && sink.error.apply(sink, arguments);
                }
              });
            },
            error: function() {
              sink && sink.error && sink.error.apply(sink, arguments);
            }
          });
        }
      });
    },
    put: function(obj, sink) {
      var self = this;
      this.cache.find(obj.id, {
        put: function(obj) {
          obj.timestamp = new Date();
          self.cache.put(obj, {
            put: function(obj) {
              self.delegate.put(obj.obj, sink);
            },
            error: function() {
              sink && sink.error && sink.error.apply(this, arguments);
            }
          });
        },
        error: function() {
          self.cache.put(self.LRUCacheItem.create({
            timestamp: new Date(),
            id: obj.id,
            obj: obj
          }), {
            put: function() {
              self.delegate.put(obj, sink);
              self.cleanup_();
            },
            error: function() {
              sink && sink.error && sink.error.apply(this, arguments);
            }
          });
        }
      });
    },
    remove: function(obj, sink) {
      if ( obj.id ) var id = obj.id;
      else id = obj;

      var self = this;
      this.cache.remove(obj.id, {
        remove: function() {
          self.delegate.remove(obj, sink);
        },
        error: function() {
          sink && sink.error && sink.error('remove', obj);
        }
      });
    },
    removeAll: function(sink, options) {
      var self = this;
      this.delegate.removeAll({
        remove: function(obj) {
          self.cache.remove(obj.id, {
            remove: function() {
              sink && sink.remove && sink.remove(obj);
            },
            error: function() {
              // TODO: what's the right course of action here?
            }
          });
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      }, options);
    },
    cleanup_: function() {
      // TODO: Use removeAll instead of select when
      // all DAOs respect skip in removeAll.
      var self = this;
      this.cache
        .orderBy(DESC(this.LRUCacheItem.TIMESTAMP))
        .skip(this.maxSize).select({
          put: function(obj) {
            self.cache.remove(obj);
          }
        });
    }
  }
});
