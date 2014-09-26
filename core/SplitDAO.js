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

   extendsModel: 'AbstractDAO',

   properties: [
      {
         model_: 'StringProperty',
         name: 'activeQuery'
      },
      {
         name:  'model',
         label: 'Model',
         type:  'Model',
         hidden: true,
         required: true
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
      }
   ],

   methods: {
      init: function() {
        this.SUPER();
      },

      put: function(value, sink) {
         this.local.put(value, sink);
      },

      remove: function(query, sink) {
         this.local.remove(query, sink);
      },

      find: function(key, sink) {
         // Assumes 'local' has all of the data
         this.local.find(key, sink);
      },

      select: function(sink, options) {
         var query = ( options.query && options.query.toSQL() ) || "";

         if ( query !== this.activeQuery ) {
            this.activeQuery = query;
            console.log('new Query');

            var buf = this.buf = MDAO.create({model: this.model});

            // Add an index for the specified sort order if one is provided
            if ( options && options.order ) this.buf.addIndex(options.order);

            this.local.select(buf, options.query ? {query: options.query} : {})((function() {
               buf.select(sink, options);
               this.remote.select(buf, options)(function() {
                 // Notify listeners that the DAO's data has changed
                 if ( buf === this.buf ) this.notify_('put');
               });
            }).bind(this));
         } else {
            this.buf.select(sink, options);
         }
      }
   }
});



/*
var dao = ProxyDAO.create({delegate: []});
dao.listen(console.log);

dao.put("foo");
dao.put("bar")

*/
