/*
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

/* DAO Interface
 * put(obj, callback(newObj)) - either create or update (required?)
 *   insert(obj, callback(newObj)) - create a new record
 *   update(obj, callback(newObj)) - update an existing record
 * get(index, callback) - like pipe but only finds one value
 *    could be merged with pipe?
 *    what values for 'index': primary-key, object, query?
 * remove(obj, callback) - remove one object
 * removeAll(query, callback)
 *    Are both remove and removeAll needed?
 * has(callback)
 *    Internal only?
 * pipe(callback[, {map of options, including 'query', 'order', 'limit'}])
 *   bind() = pipe + listen
 *   listen()
 * where(query) -> DAO
 *   synchronous
 * orderBy(map) -> DAO
 *   synchronous
 * limit(count[,start]) -> DAO
 *   synchronous
 *
 * future:
 * drop() (rare enough to be handled by cmd()?)
 * cmd()
 *
 * query: obj or predicate or primary-key
 *   If you allow 'obj' how do you tell the difference
 *   between mLang's stored in a DAO?
 *
 * ???:
 *   how to specify 'limit'
 *   how to specify 'sortOrder'
 *
 * Strange Ideas:
 *   What if DAO only supported cmd() method and other 'methods'
 *   were mlang's?
 *      Good for queueing
 *
 * Usage:
 * dao.where(AND(...)).limit(100).orderBy(User.LAST_NAME).pipe(fn);
 *
 * OR
 *
 * dao.pipe(fn, { query: AND(...), limit: 100, orderBy: User.LAST_NAME });
 * (doesn't read well when pipelined; reverse arg order?)
 * dao.pipe({ query: AND(...), limit: 100, orderBy: User.LAST_NAME }, fn);
 *
 */

/**
 * Set a specified properties value with an auto-increment
 * sequence number on DAO.put() if the properties value
 * is set to the properties default value.
 */
var SeqNoDAO = {

  create: function(prop, startSeqNo, delegate) {
    // TODO: this is async but the constructor is sync
    // TODO: there should be a better way to pipe sinks than this
    delegate.select({ __proto__: MAX(prop), eof: function() { startSeqNo = this.__proto__.max + 1; }});

    return {
      __proto__: delegate,
      prop:      prop,

      put: function(obj, sink) {
        var val = obj[prop.name];

        if ( val == prop.defaultValue )
          obj[prop.name] = startSeqNo;

        return delegate.put(obj, sink);
      }
    };
  }
};


/** A DAO proxy that delays operations until the delegate is set in the future. **/
var FutureDAO = {
  create: function(futureDelegate) {

    // This is kind-of tricky.  We actually return an object whose proto is the future-proxy
    // code.  This is so that once the future-delegate is set, that we can rewrite the proto
    // to be that delegate.  This removes the future related code so that we no longer have
    // pay the overhead once the delegate has been set.

    return {
      __proto__: {
        // TODO: implement other DAO methods

        select: function() {
          var a = arguments;
          var self = this;
	  var f = afuture();
	  futureDelegate(function(delegate) {
	    // This removes this code from the delegate-chain and replaces the real delegate.
	    self.__proto__ = delegate;
	    f.set(delegate.select.apply(delegate, a));
	  });
	  return f.get;
        },
        where: function(query) {
          return filteredDAO(query, this);
        },
        limit: function(count) {
          return limitedDAO(count, this);
        },
        skip: function(skip) {
          return skipDAO(skip, this);
        },
        orderBy: function() {
          return orderedDAO(arguments.length == 1 ? arguments[0] : argsToArray(arguments), this);
        },
        listen: function() {
	  // TODO: something
        },
        unlisten: function() {
	  // TODO: something
        }
    }};
  }
};


var CachingDAOOld = {

  create: function(cache, source) {
    // TODO: this should be moved to something like a "FutureDAO", which blocks until the delegate is set
    
    var future = afuture();

    source.select(cache)(function() { future.set(cache.select); source.listen(cache);} );

    return {
      __proto__: cache,

      put: function(obj, sink) { source.put(obj, sink); },
      remove: function(query, sink) { source.remove(query, sink); },
      select: function() { var self = this; var a = arguments; var f = afuture(); future.get(function(m) { f.set(m.apply(self, a));}); return f.get; }
    };
  }

};


var CachingDAO = {

  create: function(cache, source) {
    var futureDelegate = afuture();

    source.select(cache)(function() { futureDelegate.set(cache); source.listen(cache);} );

    return {
      __proto__: FutureDAO.create(futureDelegate.get),

      put: function(obj, sink) { source.put(obj, sink); },
      remove: function(query, sink) { source.remove(query, sink); }
    };
  }

};


var LoggingDAO = {

  create: function(/*[logger], delegate*/) {
    var logger, delegate;
    if ( arguments.length == 2 ) {
      logger = arguments[0];
      delegate = arguments[1];
    } else {
      logger = console.log.bind(console);
      delegate = arguments[0];
    }

    return {
      __proto__: delegate,

      put: function(obj, sink) {
        logger('put', obj);
        delegate.put(obj, sink);
      },
      remove: function(query, sink) {
        logger('remove', query);
        delegate.remove(query, sink);
      },
      select: function(sink, options) {
        logger('select', options || "");
	return delegate.select(sink, options);
      }
    };
  }

};


var TimingDAO = {

  create: function(name, delegate) {
    var id = 1;
    function start(op) {
      var str = name + "-" + op + "-" + id++;
      console.time(str);
      return str;
    }
    function end(str) { id--; console.timeEnd(str); }
    function endSink(str, sink) {
      return {
        put: function() { end(str); sink.put.apply(sink, arguments); },
        remove: function() { end(str); sink.remove.apply(sink, arguments); },
        error: function() { end(str); sink.error.apply(sink, arguments); },
        eof: function() { end(str); sink.eof.apply(sink, arguments); }
      };
    }
    return {
      __proto__: delegate,

      put: function(obj, sink) {
        var str = start('put');
        delegate.put(obj, endSink(str, sink));
      },
      remove: function(query, sink) {
        var str = start('remove');
        delegate.remove(query, endSink(str, sink));
      },
      select: function(sink, options) {
        var str = start('select');
	var fut = afuture();
	delegate.select(sink, options)(function(s) {
	  end(str);
	  fut.set(s);
	}); 
	return fut.get;
      }
    };
  }

};



var ObjectToJSON = {
  __proto__: Visitor.create(),

  visitFunction: function(o) {
     return o.toString();
  },

  visitObject: function(o) {
    this.push({model_: o.model_.name});
    this.__proto__.visitObject.call(this, o);
    return this.pop();
  },
  visitProperty: function(o, prop) { this.top()[prop.name] = this.visit(o[prop.name]); },

  visitMap: function(o) {
    this.push({});
    Visitor.visitMap.call(this, o);
    return this.pop();
  },
  visitMapElement: function(key, value) { this.top()[key] = this.visit(value); },

  visitArray: function(o) {
    this.push([]);
    this.__proto__.visitArray.call(this, o);
    return this.pop();
  },
  visitArrayElement: function (arr, i) { this.top().push(this.visit(arr[i])); }
};


var JSONToObject = {
  __proto__: ObjectToJSON.create(),

  visitString: function(o) {
try {
     return o.substr(0, 8) === 'function' ?
       eval('(' + o + ')') :
       o ;
} catch (x) {
  console.log(x, o);
  return o;
}
  },

  visitObject: function(o) {
    var model   = GLOBAL[o.model_];
    var obj     = model.create();

    o.forEach((function(value, key) {
      if ( key !== 'model_' ) obj[key] = this.visit(value);
    }).bind(this));

    return obj;
  },

  // Substitute in-place
  visitArray: Visitor.visitArray,
  visitArrayElement: function (arr, i) { arr[i] = this.visit(arr[i]); }
};


var AbstractDAO = FOAM.create({
   model_: 'Model',

   name: 'AbstractDAO',
   label: 'Abstract DAO',

   properties: [
   ],

   methods: {
  listen: function(sink, options) {
    sink = this.decorateSink_(sink, options, true);
    if ( ! this.daoListeners_ ) {
      Object.defineProperty(this, 'daoListeners_', {
        enumerable: false,
        value: []
      });
    }
    this.daoListeners_.push(sink);
  },
  pipe: function(sink, options) {
    sink = this.decorateSink_(sink, options, true);
    var fc = this.createFlowControl_();
    var self = this;
    // TODO: switch to use future
    this.select(
      {
        __proto__: sink,
        eof: function() {
          if ( fc.stopped ) {
            sink.eof && sink.eof();
          } else {
            self.listen(sink, options);
          }
        }
      }, options, fc);
  },
  decorateSink_: function(sink, options, isListener, disableLimit) {
    if ( options ) {
      if ( ! disableLimit ) {
        if ( options.limit ) sink = limitedSink(options.limit, sink);
        if ( options.skip )  sink = skipSink(options.skip, sink);
      }
      if ( options.order && ! isListener )
        sink = orderedSink(options.order, sink);
      if ( options.query )
        sink = predicatedSink(
            options.query.partialEval ?
	        options.query.partialEval() :
                options.query,
            sink) ;
    }

    return sink;
  },
  createFlowControl_: function() {
    return {
      stop: function() { this.stopped = true; },
      error: function(e) { this.errorEvt = e; }
    };
  },
  where: function(query) {
    return filteredDAO(query, this);
  },
  limit: function(count) {
    return limitedDAO(count, this);
  },
  skip: function(skip) {
    return skipDAO(skip, this);
  },
  orderBy: function() {
    return orderedDAO(arguments.length == 1 ? arguments[0] : argsToArray(arguments), this);
  },
  unlisten: function(sink) {
    this.daoListeners_ && this.daoListeners_.remove(sink);
  },
  notify_: function(fName, args) {
    if ( ! this.daoListeners_ ) return;

    for ( var i = 0 ; i < this.daoListeners_.length ; i++ ) {
      var l = this.daoListeners_[i];
      var fn = l[fName];
      args[2] = {
        stop: (function(fn, l) { return function() { fn(l); }; })(this.unlisten.bind(this), l),
        error: function(e) { /* Don't care. */ }
      };
      fn && fn.apply(l, args);
    }
  }
   },

   issues: [
    {
      id: 1001,
      severity: 'Major',
      status: 'Open',
      summary: 'Finish DAO Conversaion',
      created: 'Sun Dec 23 2012 18:17:28 GMT-0500 (EST)',
      createdBy: 'kgr',
      assignedTo: 'kgr',
      notes: 'Rename DAO to just DAO and remove DAO(1)\'s.'
    }
   ]

});


function filteredDAO(query, dao) {
  return {
    __proto__: dao,
    select: function(sink, options) {
      if ( options ) {
        if ( options.query ) {
          options = { __proto__: options, query: AND(query, options.query) };
        } else {
          options = { __proto__: options, query: query };
        }
      }
      else {
        options = {query: query};
      }

      return dao.select(sink, options);
    }
  };
}


function orderedDAO(comparator, dao) {
//  comparator = toCompare(comparator);
//  if ( comparator.compare ) comparator = comparator.compare.bind(comparator);

  return {
    __proto__: dao,
    select: function(sink, options) {
      if ( options ) {
        options = { __proto__: options, order: comparator };
      } else {
        options = {order: comparator};
      }

      return dao.select(sink, options);
    }
  };
}


function limitedDAO(count, dao) {
  return {
    __proto__: dao,
    select: function(sink, options) {
      if ( options ) {
        if ( 'limit' in options ) {
          options = {
            __proto__: options,
            limit: Math.min(count, options.limit)
          };
        } else {
          options = { __proto__: options, limit: count };
        }
      }
      else {
        options = { limit: count };
      }

      return dao.select(sink, options);
    }
  };
}


function skipDAO(skip, dao) {
  return {
    __proto__: dao,
    select: function(sink, options) {
      if ( options ) {
        options = {
          __proto__: options,
          skip: skip
        };
      } else {
        options = { __proto__: options, skip: skip };
      }

      return dao.select(sink, options);
    }
  };
}


var pmap = {};
for ( var key in AbstractDAO.methods ) {
  pmap[AbstractDAO.methods[key].name] = AbstractDAO.methods[key].code;
}


defineProperties(Array.prototype, pmap);

defineProperties(Array.prototype, {
  clone: function() { return this.slice(0); },
  put: function(obj, sink) {
    for (var idx in this) {
      if (this[idx].id === obj.id) {
        this[idx] = obj;
	sink && sink.put && sink.put(obj);
    	this.notify_('put', arguments);
	//        sink && sink.error && sink.error('put', obj, duplicate);
        return;
      }
    }
    this.push(obj);
    sink && sink.put && sink.put(obj);
    this.notify_('put', arguments);
  },
  find: function(query, sink) {
    if ( query.f ) {
      for (var idx in this) {
        if ( query.f(this[idx]) ) {
          sink && sink.put && sink.put(this[idx]);
          return;
        }
      }
    } else {
      for (var idx in this) {
        if ( this[idx].id === query ) {
          sink && sink.put && sink.put(this[idx]);
          return;
        }
      }
    }
    sink && sink.error && sink.error('find', query);
  },
  // TODO: distinguish between remove() and removeAll()?
  remove: function(query, callback) {
    var param = query;
    if (! EXPR.isInstance(query))
      query = {f:function(obj) { return obj.id ? obj.id === param : obj === param; }};

    for (var i = 0; i < this.length; i++) {
      var obj = this[i];
      if (query.f(obj)) {
        this.notify_('remove', this.splice(i,1)[0]);
        i--;
      }
    }
  },
  select: function(sink, options) {
    var hasQuery = options && ( options.query || options.order );
    sink = this.decorateSink_(sink, options, false, ! hasQuery);

    // Short-circuit COUNT.
    if ( sink.model_ === CountExpr ) {
      sink.count = this.length;
      return aconstant(sink);
    }

    var fc = this.createFlowControl_();
    var start = hasQuery ? 0 : options && options.skip || 0;
    var end = hasQuery ? this.length : Math.min(this.length, start + (options && options.limit || this.length));
    for ( var i = start ; i < end ; i++ ) {
      sink.put(this[i], null, fc);
      if ( fc.stopped ) break;
      if ( fc.errorEvt ) {
        sink.error && sink.error(fc.errorEvt);
        return aconstant(sink, fc.errorEvt);
      }
    }

    sink.eof && sink.eof();

    return aconstant(sink);
  }
});



/* Usage:
 * var dao = IndexedDBDAO.create({model: Issue});
 * var dao = IndexedDBDAO.create({model: Issue, name: 'ImportantIssues'});
 *
 * TODO:
 * We notify the sinks as soon as each request returns onsuccess, this is
 * wrong, we need to wait until the transaction object fires oncomplete
 * as the transaction could still be rolled back if an error happens
 * later.
 *
 * Optimization.  This DAO doesn't use an indexes in indexeddb yet, which
 * means for any query other than a single find/remove we iterate the entire
 * data store.  Obviously this will get slow if you store large amounts
 * of data in the database.
 */
var IndexedDBDAO = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractDAO',

   name: 'IndexedDBDAO',
   label: 'IndexedDB DAO',

   properties: [
      {
         name:  'model',
         label: 'Model',
         type:  'Model',
         required: true
      },
      {
         name:  'name',
         label: 'Store Name',
         type:  'String',
         defaultValueFn: function() {
           return this.model.plural;
         }
      }
   ],

   methods: {

   init: function() {
     AbstractPrototype.init.call(this);

     this.withDB = amemo(this.openDB.bind(this));
    },

    openDB: function(cc) {
      var indexedDB = window.indexedDB ||
        window.webkitIndexedDB         ||
        window.mozIndexedDB;

      var request = indexedDB.open("FOAM:" + this.name, 1);

      request.onupgradeneeded = (function(e) {
        e.target.result.createObjectStore(this.name);
      }).bind(this);

      request.onsuccess = (function(e) {
        cc(e.target.result);
      }).bind(this);

      request.onerror = function (e) {
        console.log('************** failure', e);
      };
    },

    withStore: function(mode, fn) {
      this.withDB((function (db) {
        var tx = db.transaction([this.name], mode);
        fn.bind(this)(tx.objectStore(this.name));
      }).bind(this));
    },

    put: function(value, sink) {
      var self = this;
      this.withStore("readwrite", function(store) {
        var request =
            store.put(ObjectToJSON.visitObject(value), value.id);

        request.onsuccess = function(e) {
          sink && sink.put && sink.put(value);
          self.notify_('put', [value]);
        };
        request.onerror = function(e) {
          // TODO: Parse a better error mesage out of e
          sink && sink.error && sink.error('put', value);
        };
      });
    },

    find: function(key, sink) {
      this.withStore("readonly", function(store) {
        var request = store.get(key);
        request.onsuccess = function() {
          if (!request.result) {
            sink && sink.error && sink.error('find', key);
            return;
          }
          var result = JSONToObject.visitObject(request.result);
          sink && sink.put && sink.put(result);
        };
        request.onerror = function(e) {
          // TODO: Parse a better error out of e
          sink && sink.error && sink.error('find', key);
        };
      });
    },

    remove: function(query, sink) {
      this.withStore("readwrite", function(store) {
        var self = this;

        if (! EXPR.isInstance(query)) {
          var key = query.id;
          var getRequest = store.get(key);
          getRequest.onsuccess = function(e) {
            if (!getRequest.result) {
              sink && sink.error && sink.error('remove', query);
              return;
            }
            var result = JSONToObject.visitObject(getRequest.result);
            var delRequest = store.delete(key);
            delRequest.onsuccess = function(e) {
              sink && sink.remove && sink.remove(result);
              self.notify_('remove', [result]);
            };
            delRequest.onerror = function(e) {
              sink && sink.error && sink.error('remove', e);
            };
          };
          getRequest.onerror = function(e) {
            sink && sink.error && sink.error('remove', e);
          };
          return;
        }

        query = query.partialEval();

        var request = store.openCursor();
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            var value = JSONToObject.visitObject(cursor.value);
            if (query.f(value)) {
              var deleteReq = cursor.delete();
              deleteReq.onsuccess = function() {
                sink && sink.remove && sink.remove(value);
                self.notify_('remove', [value]);
              };
              deleteReq.onerror = function(e) {
                sink && sink.error && sink.error('remove', e);
              };
            }
            cursor.continue();
          }
        };
        request.onerror = function(e) {
          sink && sink.error && sink.error('remove', e);
        };
      });
    },

    select: function(sink, options) {
      sink = this.decorateSink_(sink, options, false);

      var fc = this.createFlowControl_();
      var future = afuture();

      this.withStore("readonly", function(store) {
        var request = store.openCursor();
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if ( fc.stopped ) return;
          if ( fc.errorEvt ) {
            sink.error && sink.error(fc.errorEvt);
	    future.set(sink, fc.errorEvt);
            return;
          }

          if (!cursor) {
            sink.eof && sink.eof();
	    future.set(sink);
            return;
          }

          var value = JSONToObject.visitObject(cursor.value);
          sink.put(value);
          cursor.continue();
        };
        request.onerror = function(e) {
          sink.error && sink.error(e);
        };
      });

      return future.get;
    },

    removeAll: function(callback) {
       this.withStore("readwrite", function(store) {
         var request = store.clear();
         request.onsuccess = callback;
       });
    }
   },

   listeners:
   [
      {
         model_: 'MethodModel',

         name: 'updated',
         code: function(evt) {
           console.log('updated: ', evt);
           this.publish('updated');
         }
      }
   ]

});


var StorageDAO = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractDAO',

   name: 'StorageDAO',
   label: 'Storage DAO',

   properties: [
      {
         name:  'model',
         label: 'Model',
         type:  'Model',
         required: true
      },
      {
         name:  'name',
         label: 'Store Name',
         type:  'String',
         defaultValueFn: function() {
           return this.model.plural;
         }
      }
   ],

   methods: {

   init: function() {
     AbstractPrototype.init.call(this);

     this.storage = JSONUtil.parse(localStorage.getItem(this.name)) || [];
    },

    put: function(obj, sink) {
      this.storage.put(obj, sink);
      this.flush_();
    },

    find: function(key, sink) {
      this.storage.find(key, sink);
    },

    remove: function(query, sink) {
      this.storage.remove(query, sink);
      this.flush_();
    },

    select: function(sink, options) {
      this.storage.select(sink, options);
      return aconstant(sink);
    },

    flush_: function() {
      localStorage.setItem(this.name, JSONUtil.stringify(this.storage));
      this.publish('updated');
    }

   },

   listeners:
   [
      {
         model_: 'MethodModel',

         name: 'updated',
         code: function(evt) {
           console.log('updated: ', evt);
           this.publish('updated');
         }
      }
   ]

});


var AbstractFileDAO = FOAM.create({
  model_: 'Model',
  extendsModel: 'AbstractDAO',

  name: 'AbstractFileDAO',
  label: 'Abstract File DAO',

  properties: [
    {
      name:  'model',
      label: 'Model',
      type:  'Model',
      requred: true
    },
    {
      name:  'filename',
      label: 'Storage file name',
      type:  'String',
      defaultValueFn: function() {
        return this.model.plural;
      }
    },
    {
      name:  'type',
      label: 'Filesystem Type',
      type:  'String',
      view: {
        create: function() { return ChoiceView.create({choices: [
          'Persistent',
          'Temporary'
        ]});}
      },
      defaultValue: 'Persistent'
    }
  ],

  methods: {
    init: function() {
      AbstractPrototype.init.call(this);

      var self = this;

      var withEntry = amemo(aseq(
	function(ret) {
          window.webkitStorageInfo.requestQuota(
            self.type === 'Persistent' ? 1 : 0,
            1024 * 1024 * 200, // 200 MB should be fine.
            function() { ret(1024 * 1024 * 200); },
            console.error.bind(console));
	},
        function(ret, quota) {
          window.requestFileSystem(
            self.type === 'Persistent' ? 1 : 0,
            quota, /* expected size*/
            ret,
            console.error.bind(console));
        },
        function(ret, filesystem) {
          filesystem.root.getFile(
            self.filename,
            { create: true },
            ret,
            console.error.bind(console));
        }));


      this.withWriter = amemo(aseq(
        withEntry,
        function(ret, entry) {
          entry.createWriter(ret, console.error.bind(console));
        })),


      this.withStorage = amemo(aseq(
        withEntry,
        function(ret, entry) {
          entry.file(ret, console.error.bind(console));
        },
        function(ret, file) {
          var reader = new FileReader();
          var storage = {};

          reader.onerror = console.error.bind(console);
          reader.onloadend = function() {
	    self.parseContents_(ret, reader.result, storage);
	  };

          this.readFile_(reader, file);
        }));
    },

    put: function(obj, sink) {
      var self = this;
      this.withStorage(function(s) {
        s.put(obj, {
          __proto__: sink,
          put: function() {
            sink && sink.put && sink.put(obj);
            self.notify_('put', [obj]);
            self.update_('put', obj);
          }
        });
      });
    },

    find: function(key, sink) {
      this.withStorage(function(s) {
        s.find(key, sink);
      });
    },

    remove: function(query, sink) {
      var self = this;
      this.withStorage(function(s) {
        s.remove(query, {
          __proto__: sink,
          remove: function(obj) {
            self.__proto__.remove && self.__proto__.remove(obj);
            self.notify_('remove', [obj]);
            self.update_('remove', obj);
          }
        });
      });
    },

    select: function(sink, options) {
      this.withStorage(function(s) {
        s.select(sink, options);
      });
    }
  }
});


var JSONFileDAO = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractFileDAO',

   name: 'JSONFileDAO',
   label: 'JSON File DAO',

   properties: [
     {
       name:  'writeQueue',
       label: 'Write Queue',
       type:  'Array[String]',
       defaultValueFn: function() {
         return [];
       }
     }
   ],

   methods: {
     init: function() {
       AbstractFileDAO.getPrototype().init.call(this);

       this.withWriter((function(writer) {
         writer.addEventListener(
             'writeend',
             (function(e) {
               this.writeOne_(e.target);
             }).bind(this));
       }).bind(this));
     },

     readFile_: function(reader, file) {
       reader.readAsText(file);
     },

     parseContents_: function(ret, contents, storage) {
       with (storage) { eval(contents); }
       ret(storage);
     },

     writeOne_: function(writer) {
       if ( writer.readyState == 1 ) return;
       if ( this.writeQueue.length == 0 ) return;

       writer.seek(writer.length);
       var queue = this.writeQueue;
       var blob = queue.shift();
       this.writeQueue = queue;
       writer.write(blob);
     },

     update_: function(mutation, obj) {
       var parts = [];

       if (mutation === 'put') {
         parts.push("put(" + JSONUtil.compact.stringify(obj) + ");\n");
       } else if (mutation === 'remove') {
         parts.push("remove(" + JSONUtil.compact.stringify(obj.id) + ");\n");
       }

       this.writeQueue = this.writeQueue.concat(new Blob(parts));

       this.withWriter((function(writer) {
         this.writeOne_(writer);
       }).bind(this));
     }
   }
});


var KeyCollector = FOAM.create({
  model_: 'Model',
  name: 'KeyCollector',
  label: 'KeyCollector',
  help: "A sink that collects the keys of the objects it's given.",

  properties: [
    {
      name: 'keys',
      type: 'Array',
      label: 'Keys',
      valueFactory: function() { return []; }
    }
  ],

  methods: {
    put: function(value) {
      this.keys.push(value.id);
    },
    remove: function(value) {
      this.keys.remove(value.id);
    }
  }
});


var WorkerDAO = FOAM.create({
  model_: 'Model',
  name: 'WorkerDAO',
  label: 'Worker DAO',
  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'model',
      type: 'Model',
      label: 'Model',
      required: true
    },
    {
      name: 'delegate',
      type: 'Worker',
      label:'Delegate',
      help: 'The web-worker to delegate all actions to.',
      valueFactory: function() {
        var url = window.location.protocol + window.location.host + window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1);
        var workerscript = [
          "var url = '" + url + "';\n",
          "var a = importScripts;",
          "importScripts = function(scripts) { \nfor (var i = 0; i < arguments.length; i++) \na(url + arguments[i]); \n};\n",
          "try { importScripts('bootFOAMWorker.js'); } catch(e) { \n debugger; }\n",
          "WorkerDelegate.create({ dao: [] });\n",
        ];
        return new Worker(window.URL.createObjectURL(
            new Blob(workerscript, { type: "text/javascript" })));
      },
      postSet: function(val, oldVal) {
        if ( oldVal ) {
          oldVal.terminate();
        }
        val.addEventListener("message", this.onMessage);
      }
    },
    {
      name:  'requests_',
      type:  'Object',
      label: 'Requests',
      help:  'Map of pending requests to delegate.',
      valueFactory: function() { return {}; }
    },
    {
      name:  'nextRequest_',
      type:  'Integer',
      label: 'NextRequest',
      help:  'Id of the next request to the delegate.',
      valueFactory: function() { return 1; }
    },
    { // Consider making this a DAO.  Challenge is keeping in sync if this throws errors after delegate has completed something.
      name:  'storage_',
      type:  'Object',
      label: 'Storage',
      help:  'Local cache of the data in the delegate.',
      valueFactory: function() { return {}; }
    }
  ],

  methods: {
    init: function() {
      AbstractDAO.getPrototype().init.call(this);
      this.delegate.postMessage("");
    },
    destroy: function() {
      // Send a message to the delegate?
      this.delegate.terminate();
    },
    makeRequest_: function(method, params, callback, error) {
      var reqid = this.nextRequest_++;
      params = params ?
          ObjectToJSON.visit(params) :
          {};
      var message = {
        method: method,
        params: params,
        request: reqid
      };
      this.requests_[reqid] = {
        method: method,
        callback: callback,
        error: error
      };
      this.delegate.postMessage(message);
    },
    put: function(obj, sink) {
      this.makeRequest_(
        "put", obj,
        (function(response) {
          this.storage_[obj.id] = obj;
          sink && sink.put && sink.put(obj);
          this.notify_("put", [obj]);
        }).bind(this),
        sink && sink.error && sink.error.bind(sink));
    },
    remove: function(query, sink) {
      this.makeRequest_(
        "remove", query,
        (function(response) {
          for ( var i = 0, key = response.keys[i]; key; i++) {
            var obj = this.storage_[key];
            delete this.storage_[key];
            sink && sink.remove && sink.remove(obj);
          }
        }).bind(this),
        sink && sink.error && sink.error.bind(sink));
    },
    find: function(id, sink) {
      // No need to go to worker.
      this.storage_.find(id, sink);
    },
    select: function(sink, options) {
      // Cases:
      // 1) Cloneable reducable sink. -- Clone sync, get response, reduceI
      // 2) Non-cloneable reducable sink -- treat same as case 2.
      // 3) Non-cloneable non-reducable sink -- Use key-creator, just put into sink

      var fc = this.createFlowControl_();

      if (sink.model_ && sink.reduceI) {
        var request = {
          sink: sink,
          options: options
        };

        this.makeRequest_(
            "select", request,
            (function(response) {
              var responsesink = JSONToObject.visit(response.sink);
              sink.reduceI(responsesink);
              sink.eof && sink.eof();
            }).bind(this),
            sink && sink.error && sink.error.bind(sink));
      } else {
        var mysink = KeyCollector.create();
        request = {
          sink: mysink,
          options: options
        };

        this.makeRequest_(
            "select", request,
            (function(response) {
              var responsesink = JSONToObject.visit(response.sink);
              for (var i = 0; i < responsesink.keys.length; i++) {
                var key = responsesink.keys[i];
                if ( fc.stopped ) break;
                if ( fc.errorEvt ) {
                  sink.error && sink.error(fc.errorEvt);
                  break;
                }
                var obj = this.storage_[key];
                sink.put(obj);
              }
              sink.eof && sink.eof();
            }).bind(this),
            sink && sink.error && sink.error.bind(sink));
      }
    },
    handleNotification_: function(message) {
      if (message.method == "put") {
        var obj = JSONToObject.visitObject(message.obj);
        this.storage_[obj.id] = obj;
        this.notify_("put", [obj]);
      } else if (message.method == "remove") {
        var obj = this.stroage_[message.key];
        delete this.storage_[message.key];
        this.notify_("remove", [obj]);
      }
    }
  },

  listeners: [
    {
      model_: 'MethodModel',
      name: 'onMessage',
      help: 'Callback for message events from the delegate.',
      code: function(e) {
        // FIXME: Validate origin.
        var message = e.data;
        if (message.request) {
          var request = this.requests_[message.request];
          delete this.requests_[message.request];
          if (message.error) {
            request.error(message.error);
            return;
          }
          request.callback(message);
          return;
        } // If no request was specified this is a notification.
        this.handleNotification_(message);
      }
    }
  ]
});


var WorkerDelegate = FOAM.create({
  model_: 'Model',
  name: 'WorkerDelegate',
  label: 'Worker Delegate',
  help:  'The client side of a web-worker DAO',

  properties: [
    {
      name:  'dao',
      label: 'dao',
      type:  'DAO',
      required: 'true',
      postSet: function(val, oldVal) {
        if (oldVal) oldVal.unlisten(this);
        val.listen(this);
      }
    }
  ],

  methods: {
    init: function() {
      AbstractPrototype.init.call(this);

      self.addEventListener('message', this.onMessage);
    },
    put: function(obj) {
      self.postMessage({
        method: "put",
        obj: ObjectToJSON.visitObject(obj)
      });
    },
    remove: function(obj) {
      self.postMessage({
        method: "remove",
        key: obj.id
      });
    }
  },

  listeners: [
    {
      model_: 'MethodModel',
      name: 'onMessage',
      code: function(e) {
        // This is a nightmare of a function, clean it up.
        var message = e.data;
        if ( !message.method ) return;
        var me = this;
        var params = message.params.model_ ?
              JSONToObject.visitObject(message.params) :
              message.params;
        if (message.method == "put") {
          this.dao.put(params, {
            put: function() {
              self.postMessage({
                request: message.request
              });
            },
            error: function() {
              self.postMessage({
                request: message.request,
                error: true
              });
            }
          });
        } else if(message.method == "remove") {
          this.dao.remove(params, {
            remove: function() {
              self.postMessage({
                request: message.request
              });
            },
            error: function() {
              self.postMessage({
                request: message.request,
                error: true
              });
            }
          });
        } else if(message.method == "select") {
          var request = JSONToObject.visit(message.params);
          var mysink = {
            __proto__: request.sink,
            eof: function() {
              request.sink.eof && request.sink.eof();
              self.postMessage({
                request: message.request,
                sink: ObjectToJSON.visit(this.__proto__)
              });
            },
            error: function() {
              request.sink.error && request.sink.error();
              self.postMessage({
                request: message.request,
                error: true
              });
            }
          };
          this.dao.select(mysink, request.options);
        }
      }
    }
  ]
});


var ModelDAO = {
    create: function(namespace, dao) {
	var res = {
	    __proto__: dao,
	    namespace: namespace,
	    dao:       dao,
	    created:   { },

	    init_: function() {
              var self = this;
              this.pipe({
                put: self.add_.bind(this),
                remove: self.del_.bind(this)
              });
	    },

	    add_: function(obj) {
	       if ( obj.name == 'Model' ) return;

	       var dao = this;

               this.namespace[obj.name] = obj;

	       FOAM.putFactory(this.namespace, obj.name + "Proto", function() {
                  return this.namespace[obj.name].getPrototype();
               });

	       FOAM.putFactory(this.namespace, obj.name + 'DAO', function() {
		  console.log("Creating '" + obj.name + "DAO'");
                  return StorageDAO.create({ model: obj });
               });
	    },

	    del_: function() {
		for (var objID in this.created) {
		    delete this.namespace[objID];
		}
	    }

	    //TODO: remove models from namespace on remove()
	};
	res.init_();
	return res;
    }
};


var OrderedCollectorSink = FOAM.create({
  model_: 'Model',

  name: 'OrderedCollectorSink',
  label: 'OrderedCollectorSink',

  properties: [
    {
      name: 'storage',
      type: 'Array',
      valueFactory: function() { return []; }
    },
    {
      name: 'comparator',
      type: 'Value',
      required: true
    }
  ],

  methods: {
    reduceI: function(other) {
      this.storage = this.storage.reduce(this.comparator, other.storage);
    },
    put: function(obj) {
      this.storage.push(obj);
    }
  }
});


var CollectorSink = FOAM.create({
  model_: 'Model',

  name: 'CollectorSink',
  label: 'CollectorSink',

  properties: [
    {
      name: 'storage',
      type: 'Array',
      valueFactory: function() { return []; }
    }
  ],

  methods: {
    reduceI: function(other) {
      this.storage = this.storage.concat(other.storage);
    },
    put: function(obj) {
      this.storage.push(obj);
    }
  }
});


var PartitionDAO = FOAM.create({
  model_: 'Model',
  extendsModel: 'AbstractDAO',

  name: 'ParitionDAO',
  label: 'PartitionDAO',

  properties: [
    {
      name: 'partitions',
      label: 'Partitions',
      type: 'Array[DAO]',
      mode: "read-only",
      required: true
    }
  ],

  methods: {
    init: function() {
      AbstractPrototype.init.call(this);

      for ( var i = 0; i < this.partitions.length; i++) {
        var part = this.partitions[i];
        var self = this;
        part.listen({
          put: function(value) {
            self.notify_("put", [value]);
          },
          remove: function(value) {
            self.notify_("remove", [value]);
          }
        });
      }
    },
    getPartition_: function(value) {
      return this.partitions[Math.abs(value.hashCode()) % this.partitions.length];
    },
    put: function(value, sink) {
      this.getPartition_(value).put(value, sink);
    },
    remove: function(query, sink) {
      this.getPartition_(value).remove(value, sink);
    },
    find: function(key, sink) {
      // Assumes no data redundancy
      for (var i = 0; i < this.partitions.length; i++) {
        this.partitions[i].find(key, sink);
      }
    },
    select: function(sink, options) {
      var myoptions = {};
      var originalsink = sink;
      options = options || {};
      if ( 'limit' in options ) {
        myoptions.limit = options.limit + (options.skip || 0),
        myoptions.skip = 0;
      }

      myoptions.order = options.order;
      myoptions.query = options.query;

      var pending = this.partitions.length;

      var fc = this.createFlowControl_();
      var future = afuture();

      if (sink.model_ && sink.reduceI) {
        var mysink = sink;
      } else {
        if (options.order) {
          mysink = OrderedCollectorSink.create({ comparator: options.order });
        } else {
          mysink = CollectorSink.create({});
        }
        if ( 'limit' in options ) sink = limitedSink(options.limit, sink);
        if ( options.skip ) sink = skipSink(options.skip, sink);

        mysink.eof = function() {
          for (var i = 0; i < this.storage.length; i++) {
            if ( fc.stopped ) break;
            if ( fc.errorEvt ) {
              sink.error && sink.error(fc.errorEvt);
              future.set(sink, fc.errorEvt);
              break;
            }
            sink.put(this.storage[i], null, fc);
          }
        }
      }

      var sinks = new Array(this.partitions.length);
      for ( var i = 0; i < this.partitions.length; i++ ) {
        sinks[i] = mysink.deepClone();
        sinks[i].eof = function() {
          mysink.reduceI(this);
          pending--;
          if (pending <= 0) {
            mysink.eof && mysink.eof();
            future.set(originalsink);
          }
        };
      }

      for ( var i = 0; i < this.partitions.length; i++ ) {
        this.partitions[i].select(sinks[i], myoptions);
      }

      return future.get;
    }
  }
});


// TODO Why is this even a DAO, it literally only does find.
var BlobReaderDAO = FOAM.create({
    model_: 'Model',
    label: 'BlobReaderDAO',
    name: 'BlobReaderDAO',

    properties: [
        {
            name: 'blob',
            label: 'Blob',
            type: 'Blob',
            required: true
        }
    ],
    methods: {
        put: function(value, sink) {
           sink && sink.error && sink.error("Unsupported");
        },

        remove: function(query, sink) {
           sink && sink.error && sink.error("Unsupported");
        },

        select: function(query, sink) {
           sink && sink.error && sink.error("Unsupported");
        },

        find: function(key, sink) {
            var slice = this.blob.slice(key[0], key[0] + key[1]);
            var reader = new FileReader();
            reader.readAsText(slice);
            reader.onload = function(e) {
                sink && sink.put && sink.put(reader.result);
            };
            reader.onerror = function(e) {
                sink && sink.error && sink.error("find", e);
            };
        }
    }
});

var GDriveDAO = FOAM.create({
  model_: 'Model',
  name: 'GDriveDAO',
  properties: [
    {
      name: 'authtoken',
      label: 'Authentication Token'
    }
  ],

  methods: {
    put: function(value, sink) {
    },
    remove: function(query, sink) {
    },
    select: function(sink, options) {
      var xhr = new XMLHttpRequest();
      var params = [
        'maxResults=10'
      ];
      xhr.open('GET', "https://www.googleapis.com/drive/v2/files?" + params.join('&'));
      xhr.setRequestHeader('Authorization', 'Bearer ' + this.authtoken);

      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;

        var response = JSON.parse(xhr.responseText);
        if (!response || !response.items) {
          sink && sink.error && sink.error(xhr.responseText);
          return;
        }

        for (var i = 0; i < response.items.length; i++) {
          sink && sink.put && sink.put(response.items[i]);
        }
      }
      xhr.send();
    },
    find: function(key, sink) {
    }
  }
});
