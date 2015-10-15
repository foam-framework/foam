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
  name: 'QIssuesSplitDAO',
  package: 'foam.apps.quickbug.dao',
  extends: 'AbstractDAO',

  requires: [
    'MDAO',
    'foam.dao.FutureDAO'
  ],

  properties: [
    {
      name: 'queryCache',
      help: 'An array of [query, order, MDAO<data>] entries, oldest first, and a maximum of queryCount.',
      factory: function() { return []; }
    },
    {
      name: 'queryCount',
      help: 'The maximum number of queries to cache.',
      defaultValue: 5
    },
    {
      name: 'local',
      type: 'DAO',
      mode: "read-only",
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
      name: 'model'
    },
    {
      name: 'maxLimit',
      defaultValue: 500
    }
  ],

  listeners: [
    {
      model_: 'Method',
      name: 'mergedResetNotify',
      isMerged: 1000,
      code: function() { this.notify_('reset', []); }
    }
  ],

   methods: {
     init: function() {
       this.SUPER();
       var reset = function() { this.invalidate(); this.mergedResetNotify(); }.bind(this);
       this.relay_ = {
         put: reset,
         remove: reset,
         reset: reset
       };

       this.remoteListener_ = {
         put:    function() { this.onRemotePut.apply(this, arguments);    }.bind(this),
         remove: function() { this.onRemoteRemove.apply(this, arguments); }.bind(this)
       };

       this.local.listen(this.relay_);
       this.remote.listen(this.remoteListener_);
     },

     onRemotePut:    function(obj) { this.local.put(obj); },
     onRemoteRemove: function(obj) { this.local.remove(obj);},

     invalidate: function() { this.queryCache = []; },

     put: function(value, sink) {
       var self = this;
       this.remote.put(value, {
         put: function(value) {
           self.local.put(value, sink);
         },
         error: ( sink && sink.error ) ? sink.error.bind(sink) : function() {}
       });
     },

     remove: function(obj, sink) {
       var self = this;
       this.remote.remove(value, {
         remove: function(obj) {
           self.local.remove(obj, sink);
         },
         error: ( sink && sink.error ) ? sink.error.bind(sink) : function() {}
       });
     },

     putIfMissing: function(issue) {
       var local = this.local;

       local.find(issue.id, {
         put:   function(o) { if ( o.modified.compareTo(issue.modified) ) local.put(issue); },
         error: function() { local.put(issue); }
       });
     },

     // If we don't find the data locally, then look in the remote DAO (and cache locally)
     find: function(key, sink) {
       var local  = this.local;
       var remote = this.remote;

       local.find(key, {
         put: function(obj) {
           sink && sink.put && sink.put(obj);
         },
         error: function() {
           remote.find(key, {
             put: function(issue) {
               sink && sink.put && sink.put(issue);
               local.put(issue);
             },
             error: function() {
               sink && sink.error && sink.error.apply(sink, arguments);
             }
           });
         }
       });
     },

     newQuery: function(sink, options, query, order, bufOptions, future) {
       var daoFuture = afuture();
       var buf = this.MDAO.create({ model: this.model, autoIndex: true });
       // Set an initial index for the current sort order.
       if ( options && options.order ) {
         var prop = options.order
         if ( DescExpr.isInstance(prop) ) prop = prop.arg1;

         if ( Property.isInstance(prop) )
           buf.addIndex(prop);
       }

       var cacheEntry = [query, order, this.FutureDAO.create({future: daoFuture.get})];
       if ( this.queryCache.length >= this.queryCount ) this.queryCache.shift();
       this.queryCache.push(cacheEntry);

       this.local.select({ put: function(x) { console.assert(x !== undefined, 'SplitDAO.local put: undefined'); buf.put(x); } }, options && options.query ? { query: options.query } : {})(
         (function() {
           buf.select(sink, bufOptions)(function(s) {
             daoFuture.set(buf);
             future.set(s);
           });

           var remoteOptions = {};
           if ( options && options.query ) remoteOptions.query = options.query;
           if ( options && options.order ) remoteOptions.order = options.order;

           this.remote.limit(this.maxLimit).select({
             put: (function(obj) {
               // Put the object in the buffer, but also cache it in the local DAO
               console.assert(obj !== undefined, 'SplitDAO.remote put: undefined');
               buf.put(obj);
               this.putIfMissing(obj);

               // Sometimes the item might not be missing, but the local
               // query processing didn't match it, so force a notification
               // regardless.  These are merged to 1s, so no harm done.
               this.mergedResetNotify();
             }).bind(this)
           }, remoteOptions);
         }).bind(this));
     },

     select: function(sink, options) {
       // Don't pass QUERY to buf, it always contains only the items
       // which match the query.  This allows us offload full text searches
       // to a server, where we can't necessarily do keyword matches locally
       // with the available data.
       var bufOptions = {};
       if ( options ) {
         if ( options.order ) bufOptions.order = options.order;
         if ( options.skip  ) bufOptions.skip  = options.skip;
         if ( options.limit ) bufOptions.limit = options.limit;
       }

       var query = ( options && options.query && options.query.toMQL() ) || "";
       var order = ( options && options.order && options.order.toMQL() ) || "";

       var future = afuture();

       // Search the cache of buffers for a matching query and order.
       var matchingQueries = this.queryCache.filter(function(e) { return e[0] === query; });

       if ( matchingQueries.length ) {
         var matchingOrder = matchingQueries.filter(function(e) { return e[1] === order; });

         if ( matchingOrder.length > 0 ) {
           return matchingOrder[0][2].select(sink, bufOptions);
         }

         // We did NOT find a matching order.
         // But we do have at least one match for this query with a different order.
         // Check the size of the first match's buffer. If it's < maxLimit we've
         // got all the data and can simply compute the order ourselves.
         // If it's >= maxLimit, we have only a subset and need to query the server.
         var match = matchingQueries[0];
         match[2].select(COUNT())((function(c) {
           if ( c.count < this.maxLimit ) {
             match[2].select(sink, bufOptions)(function(s) {
               future.set(s);
             });
           } else {
             // console.log('Creating new query: ' + query + '   ' + order);
             this.newQuery(sink, options, query, order, bufOptions, future);
           }
         }).bind(this));

       } else {
//         if ( CountExpr.isInstance(sink) ) return this.local.select(sink, options);

         // console.log('Creating new query: ' + query + '   ' + order);
         this.newQuery(sink, options, query, order, bufOptions, future);
       }

       return future.get;
     }
   }
});
