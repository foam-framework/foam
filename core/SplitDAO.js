/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  name: 'SplitDAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name:  'model',
      label: 'Model',
      type:  'Model',
      hidden: true,
      required: true
    },
    {
      name: 'remote',
      type: 'DAO',
      mode: "read-only",
      hidden: true,
      required: true
    },
    {
      name: 'syncManager',
      factory: function() {
        return this.X.SyncManager.create({
          srcDAO: this.remove,
          dstDAO: this.delegate,
        });
      },
      hidden: true
    },
    {
      name: 'remoteFlags',
      factory: function() {
        return {};
      },
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
    },

    put: function(obj, sink) {
      var self = this;
      this.remote.put(obj, {
        put: function(obj) {
          self.delegate.put(obj, sink);
          self.notify_('put', [obj]);
        },
        error: ( sink && sink.error ) ? sink.error.bind(sink) : function(){}
      });
    },

    remove: function(obj, sink) {
      var self = this;
      this.remove.remove(obj, {
        remove: function(obj) {
          self.delegate.remove(obj, sink);
          self.notify_('remove', [obj]);
        },
        error: ( sink && sink.error ) ? sink.error.bind(sink) : function(){}
      });
    },

    find: function(key, sink) {
      var delegate = this.delegate;
      var remove = this.remove;

      this.delegate.find(key, {
        put: function(obj) {
          sink && sink.put && sink.put(obj);
        },
        error: function() {
          remote.find(key, {
            put: function(obj) {
              sink && sink.put && sink.put(obj);
              delegate.put(obj);
              self.notify_('put', [obj]);
            },
            error: (sink && sink.error) ? sink.error.bind(sink) : function(){}
          });
        }
      });
    },

    select: function(sink, options) {
      var key = [
        'limit=' + options.limit,
        'skip=' + options.skip,
        'query=' + (options.query ? options.query.toSQL() : ''),
        'order=' + (options.order ? options.order.toSQL() : '')
      ];

      if ( CountExpr.isInstance(sink) ) {
        return this.remote.select(sink, options);
      }

      if ( ! this.remoteFlags[key] ) {
        this.remoteFlags[key] = true;

        this.remote.select({
          put: (function(obj) {
            this.delegate.find(obj.id, {
              put: (function(existing) {
                var modified = this.syncManager.modifiedProperty.name;
                if ( obj[modified].compareTo(existing[modified]) > 0 )
                  this.delegate.put(obj);
              }).bind(this),
              error: (function() {
                this.delegate.put(obj);
              }).bind(this)
            });
          }).bind(this),
          eof: (function() {
            delete this.remoteFlags[key];
          }).bind(this),
          error: (function() {
            delete this.remoteFlags[key];
          }).bind(this)
        }, options);
      }
      return this.delegate.select(sink, options);
    }
  }
});
