var SplitDAO = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractDAO',

   name: 'SplitDAO',

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
         AbstractPrototype.init.call(this);
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

	    var buf = this.buf = IDAO.create({model: this.model});

            // Add an index for the specified sort order if one is provided
            if ( options && options.order ) this.buf.addIndex(options.order);

	    this.local.select(sink, options.query ? {query: options.query} : {})((function() {
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


var ProxyDAO = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractDAO',

   name: 'ProxyDAO',

   properties: [
      {
         name: 'delegate',
         type: 'DAO',
         mode: "read-only",
         hidden: true,
         required: true,
         postSet: function(newDAO, oldDAO) {
            if ( ! this.relay_ ) return;
            if ( oldDAO ) oldDAO.unlisten(this.relay_);
            newDAO.listen(this.relay_);
         }
      }
   ],

   methods: {
      init: function() {
         AbstractPrototype.init.call(this);

         this.relay_ =  {
            put:    function() { this.notify_('put', arguments);   }.bind(this),
            remove: function() {this.notify_('remove', arguments); }.bind(this)
         };

         this.delegate.listen(this.relay_);
      },

      put: function(value, sink) {
         this.delegate.put(value, sink);
      },

      remove: function(query, sink) {
         this.delegate.remove(query, sink);
      },

      find: function(key, sink) {
         this.delegate.find(key, sink);
      },

      select: function(sink, options) {
         this.delegate.select(sink, options);
      }
   }
});

/*
var dao = ProxyDAO.create({delegate: []});
dao.listen(console.log);

dao.put("foo");
dao.put("bar")

*/


var DelayedDAO = FOAM.create({
   model_: 'Model',
   extendsModel: 'ProxyDAO',

   name: 'DelayedDAO',

   properties: [
      {
         model_: 'IntegerProperty',
         name: 'initialDelay'
      },
      {
         model_: 'IntegerProperty',
         name: 'rowDelay'
      }
   ],

   methods: {
      select: function(sink, options) {
         var i = 0;
         var delayedSink = {
            __proto__: sink,
            put: function() {
               var args = arguments;
               setTimeout(function() {
                  sink.put.apply(sink, args);
               }, this.rowDelay * ++i);
            }.bind(this)
         };
         setTimeout(function() {
            this.delegate.select(delayedSink, options);
         }.bind(this), this.initialDelay);
      }
   }
});

/*
var dao = DelayedDAO.create({delegate: [1,2,3], initialDelay: 5000, rowDelay: 2000});
dao.select(console.log);
*/