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

/* DAO2 Interface
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
 * where(query) -> DAO2
 *   synchronous
 * orderBy(map) -> DAO2
 *   synchronous
 * limit(count[,start]) -> DAO2
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


var ObjectToIndexedDB = {
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
  visitArrayElement: function (arr, i) { this.top().push(this.visit(arr[i])); },

};


var IndexedDBToObject = {
  __proto__: ObjectToIndexedDB.create(),

  visitString: function(o) {
     return o.substr(0, 8) === 'function' ?
       eval('(' + o + ')') :
       o ;
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
  visitArrayElement: function (arr, i) { arr[i] = this.visit(arr[i]); },

};


var AbstractDAO2 = FOAM.create({
   model_: 'Model',

   name: 'AbstractDAO2',
   label: 'Abstract DAO2',

   properties: [
   ],

   methods: {
  listen: function(sink, options) {
    sink = this.decorateSink_(sink, options, true);
    if ( ! this.daoListeners_ ) this.daoListeners_ = [];
    this.daoListeners_.push(sink);
  },
  // TODO: rename to pipe
  pipe: function(sink, options) {
    sink = this.decorateSink_(sink, options, true);
    var fc = this.createFlowControl_();

    this.select(
      {
        __proto__: sink,
        eof: function() {
          if ( fc.stopped ) {
            sink.eof && sink.eof();
          } else {
            this.listen(sink, options);
          }
        }
      }, options, fc);
  },
  decorateSink_: function(sink, options, isListener) {
    if ( options ) {
      if ( options.order && ! isListener )
        sink = orderedSink(options.order, sink);
      if ( options.limit )
        sink = limitedSink(options.limit, sink);
      if ( options.query )
        sink = predicatedSink(options.query.partialEval(), sink);
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
  limit: function(count, opt_start) {
    return limitedDAO(count, opt_start || 0, this);
  },
  orderBy: function(comparator) {
    return orderedDAO(comparator, this);
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
   }
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
      dao.select(sink, options);
    }
  };
}

function orderedDAO(comparator, dao) {
  if ( comparator.compare ) comparator = comparator.compare.bind(comparator);

  return {
    __proto__: dao,
    select: function(sink, options) {
      if ( options ) {
        options = { __proto__: options, order: comparator };
      } else {
        options = {order: comparator};
      }
      dao.select(sink, options);
    }
  };
}

function limitedDAO(count, start, dao) {
  return {
    __proto__: dao,
    select: function(sink, options) {
      if ( options ) {
        if ( options.limit ) {
          options = {
            __proto__: options,
            limit: {
              count: Math.min(count, options.limit.count),
              start: start
            }
          };
        } else {
          options = { __proto__: options, limit: {count: count, start: start} };
        }
      }
      else {
        options = {limit: {count: count, start: start}};
      }
      dao.select(sink, options);
    }
  };
}



var pmap = {};
for ( var key in AbstractDAO2.methods ) {
  pmap[AbstractDAO2.methods[key].name] = AbstractDAO2.methods[key].code;
}

defineProperties(Object.prototype, pmap);

defineProperties(Object.prototype, {
  clone: function() { return this; /* TODO */ },
  put: function(obj, sink) {
    /*
    if ( this.hasOwnProperty('id') ) {
      sink && sink.error && sink.error('put', obj, duplicate);
      return;
    }
    */
    this[obj.id] = obj;
    sink && sink.put && sink.put(obj);
    this.notify_('put', arguments);
  },
  find: function(id, sink) {
    if ( this.hasOwnProperty(id) ) {
      sink && sink.put && sink.put(this[id]);
      return;
    }
    sink && sink.error && sink.error('find', id);
  },
  select: function(sink, options) {
    sink = this.decorateSink_(sink, options, false);

    var fc = this.createFlowControl_();

    for (var key in this) {
      sink.put(this[key], null, fc);
      if ( fc.stopped ) break;
      if ( fc.errorEvt ) {
        sink.error && sink.error(fc.errorEvt);
        break;
      }
    }

    sink.eof && sink.eof();
  },
  // TODO: distinguish between remove() and removeAll()?
  remove: function(query, sink) {
    var id = query.id || query;

    if ( this.hasOwnProperty(id) ) {
      sink && sink.remove && sink.remove(this[id]);
      delete this[id];
      this.notify_('remove', arguments);
      return;
    }
    sink && sink.error && sink.error('remove', id);
  }
});


defineProperties(Array.prototype, pmap);

defineProperties(Array.prototype, {
  clone: function() { return new Array(this); },
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
  find: function(id, sink) {
    for (var idx in this) {
      if (this[idx].id === id) {
        sink && sink.put && sink.put(this[idx]);
        return;
      }
    }
    sink && sink.error && sink.error('find', id);
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
    sink = this.decorateSink_(sink, options, false);

    var fc = this.createFlowControl_();

    for (var i in this) {
      sink.put(this[i], null, fc);
      if ( fc.stopped ) break;
      if ( fc.errorEvt ) {
        sink.error && sink.error(fc.errorEvt);
        break;
      }
    }

    sink.eof && sink.eof();
  }
});



/* Usage:
 * var dao = IndexedDBDAO2.create({model: Issue});
 * var dao = IndexedDBDAO2.create({model: Issue, name: 'ImportantIssues'});
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
var IndexedDBDAO2 = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractDAO2',

   name: 'IndexedDBDAO2',
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

     this.withDB = future(this.openDB.bind(this));
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
            store.put(ObjectToIndexedDB.visitObject(value), value.id);

        request.onsuccess = function(e) {
          sink && sink.put && sink.put(value);
          self.notify_('put', value);
        };
        request.onerror = function(e) {
          // TODO: Pass a better error mesage out of e
          sink && sink.error && sink.error('put', value);
        };
      });
    },

    find: function(key, sink) {
      this.withStore("readonly", function(store) {
        var request = store.find(key);
        request.onsuccess = function() {
          if (!request.result) {
            sink && sink.error && sink.error('find', key);
            return;
          }
          var result = IndexedDBToObject.visitObject(request.result);
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
          var key = query;
          var getRequest = store.find(key);
          getRequest.onsuccess = function(e) {
            if (!getRequest.result) {
              sink && sink.error && sink.error('remove', query);
              return;
            }
            var result = IndexedDBToObject.visitObject(getRequest.result);
            var delRequest = store.delete(key);
            delRequest.onsuccess = function(e) {
              sink && sink.remove && sink.remove(result);
              self.notify_('remove', result);
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
            var value = IndexedDBToObject.visitObject(cursor.value);
            if (query.f(value)) {
              var deleteReq = cursor.delete();
              deleteReq.onsuccess = function() {
                sink && sink.remove && sink.remove(value);
                self.notify_('remove', value);
              }
              deleteReq.onerror = function(e) {
                sink && sink.error && sink.error('remove', e);
              }
            }
            cursor.continue();
          }
        };
        request.onerror = function(e) {
          sink && sink.error && sink.error('remove', e);
        }
      });
    },

    select: function(sink, options) {
      sink = this.decorateSink_(sink, options, false);

      var fc = this.createFlowControl_();

      this.withStore("readonly", function(store) {
        var request = store.openCursor();
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if ( fc.stopped ) return;
          if ( fc.errorEvt ) {
            sink.error && sink.error(fc.errorEvt);
            return;
          }

          if (!cursor) {
            sink.eof && sink.eof();
            return;
          }

          var value = IndexedDBToObject.visitObject(cursor.value);
          sink.put(value);
          cursor.continue();
        };
        request.onerror = function(e) {
          sink.error && sink.error(e);
        };
      });
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


var StorageDAO2 = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractDAO2',

   name: 'StorageDAO2',
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

     this.storage = JSONUtil.parse(localStorage.getItem(this.name)) || {};
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

var JSONFileDAO2 = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractDAO2',

   name: 'JSONFileDAO2',
   label: 'JSON formatted File DAO',

   properties: [
      {
         name:  'model',
         label: 'Model',
         type:  'Model',
         required: true
      },
      {
         name:  'file',
         label: 'Storage File',
         type:  'File',
         required: true
      }
   ],

   methods: {

   init: function() {
     AbstractPrototype.init.call(this);

     this.withStorage = future((function(cb) {
       var reader = new FileReader();

       reader.onloadend = function() {
         var storage = {};

         if ( reader.result ) with (storage) { eval(reader.result); }

         cb(storage);
       };

       reader.readAsText(this.file);
     }).bind(this));
    },

    put: function(obj, sink) {
      sink && sink.error && sink.error('put', 'unsupported');
    },

    find: function(key, sink) {
      this.withStorage(function(storage) {
        storage.find(key, sink);
      });
    },

    remove: function(query, sink) {
      sink && sink.error && sink.error('remove', 'unsupported');
    },

    select: function(sink, options) {
      this.withStorage(function(storage) {
        storage.select(sink, options);
      });
    }
   }
});

/*
var d = IndexedDBDAO2.create({model: Model});
d.put(Issue);
d.find(function(i) { console.log('got: ', i); }, "Issue");

ModelDAO.forEach(d.put.bind(d));
d.forEach(console.log.bind(console, 'forEach: '));
*/
