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

/*
 * Asynchronous DAO Support
 * Once all Synchronous DAO's are converted and we have an DAO2Controller,
 * then remove the old DAO code and rename DAO2 to just DAO.
 */

/*
var futureValue = future(function(setter) {
  setTimeout(function() { setter(42); }, 1000);
});

futureValue(function(value) { console.log(value); });
futureValue(function(value) { console.log(value); });
futureValue(function(value) { console.log(value); });
futureValue(function(value) { console.log(value); });

 *
 */
// TODO: move somewhere better
function future(factory) {
  var value;
  var waiters;

  return function(callback) {
    if ( value ) { callback(value); return; }

    var first = ! waiters;

    if ( first ) waiters = [];

    waiters.push(callback);

    if ( first ) {
      factory(function(v) {
	value = v;
	for (var i = 0 ; i < waiters.length; i++) {
	  waiters[i](value);
	}
        waiters = [];
      });
    }
  };
}


// TODO: move somewhere better
var Visitor = {
  create: function() {
    return { __proto__: this, stack: [] };
  },

  push: function(o) { this.stack.push(o); },

  pop: function() { return this.stack.pop(); },

  top: function() {
    return this.stack.length && this.stack[this.stack.length-1];
  },

  visit: function(o) {
var oldLog = console.log;
console.log = console.log.bind(console, '   ');
console.log('visit: ', o);
try {
    return ( o instanceof Array )     ? this.visitArray(o)    :
           ( typeof o === 'string' )  ? this.visitString(o)   :
           ( typeof o === 'number' )  ? this.visitNumber(o)   :
           ( o instanceof Function )  ? this.visitFunction(o) :
           ( o instanceof Date )      ? this.visitDate(o)     :
           ( o === true )             ? this.visitTrue()      :
           ( o === false )            ? this.visitFalse()     :
           ( o === null )             ? this.visitNull()      :
           ( o instanceof Object )    ? ( o.model_            ?
             this.visitObject(o)      :
             this.visitMap(o)
           )                          : this.visitUndefined() ;
} finally {
   console.log = oldLog;
}
  },

  visitArray: function(o) {
    var len = o.length;
    for ( var i = 0 ; i < len ; i++ ) this.visitArrayElement(o, i);
  },
  visitArrayElement: function (arr, i) { this.visit(arr[i]); },

  visitString: function(o) { return o; },

  visitFunction: function(o) { return o; },

  visitNumber: function(o) { return o; },

  visitDate: function(o) { return o; },

  visitObject: function(o) {
    for ( var key in o.model_.properties ) {
      var prop = o.model_.properties[key];

      if ( prop.name in o.instance_ ) {
        this.visitProperty(o, prop);
      }
    }
  },
  visitProperty: function(o, prop) { this.visit(o[prop.name]); },

  visitMap: function(o) {
    o.forEach((function(value, key) { this.visitMapElement(key, value); }).bind(this));
  },
  visitMapElement: function(key, value) { },

  visitTrue: function() { return true; },

  visitFalse: function() { return false; },

  visitNull: function() { return null; },

  visitUndefined: function() { return undefined; }

};


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
  visitArray: function(o) {
    var len = o.length;
    for ( var i = 0 ; i < len ; i++ ) this.visitArrayElement(o, i);
    return o;
  },
  visitArrayElement: function (arr, i) { arr[i] = this.visit(arr[i]); },

};


// FIXME: Error handling
/* Usage:
 * var dao = IndexedDBDAO2.create({model: Issue});
 * var dao = IndexedDBDAO2.create({model: Issue, name: 'ImportantIssues'});
 */
var IndexedDBDAO2 = FOAM.create({
   model_: 'Model',

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
        console.log('*****************upgradeneeded', this.name);
	e.target.result.createObjectStore(this.name, {keyPath: 'name'});
      }).bind(this);

      request.onsuccess = (function(e) {
        cc(e.target.result);
        console.log('************** CREATED DB success', e);
      }).bind(this);

      request.onerror = function (e) {
        console.log('************** failure', e);
      };
    },

    withStore: function(mode, fn) {
console.log('withStore: ', mode);
      this.withDB((function (db) {
        var tx = db.transaction([this.name], mode);
        fn.bind(this)(tx.objectStore(this.name));
      }).bind(this));
    },

    put: function(value) {
console.log('put: ', value.instance_, value.id);
      this.withStore("readwrite", function(store) {
        var request = store.put(ObjectToIndexedDB.visitObject(value));
	request.onsuccess = console.log.bind(console, 'put success: '); //this.updated;
	request.onerror = console.log.bind(console, 'put error: ');
      });
    },

    get: function(callback, key) {
      this.withStore("readonly", function(store) {
console.log('getting: ', key);
        var request = store.get(key);
        request.onsuccess = function() {
	  IndexedDBToObject.visitObject(request.result);
	  callback(request.result);
	};
        request.onerror = console.log.bind(console, 'get error: ');
      });
    },

    // TODO: Model queries and handle them at the db layer
    // where we can, rather than doing all the processing in
    // javascript.
    forEach2: function(fn, opt_predicate) {
      this.withStore("readonly", function(store) {
        var request = store.openCursor();
console.log('forEach open cursor: ', cursor);
        request.onerror = console.log.bind(console, 'forEach failure: ');
        request.onsuccess = opt_predicate ? function(e) {
	      var cursor = e.target.result;
console.log('forEach cursor P: ', cursor);
	      if (cursor) {
		if (opt_predicate(cursor.value)) {
		  fn(cursor.value);
		}
		cursor.continue();
	      }
	    } : function(e) {
console.log('forEach onSuccess: ', e);
	      var cursor = e.target.result;
console.log('forEach cursor: ', cursor);
	      if (cursor) {
		fn(cursor/*.value*/);
		cursor.continue();
	      }
	    };
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

/*
var d = IndexedDBDAO2.create({model: Model});
d.put(Issue);
d.get(function(i) { console.log('got: ', i); }, "Issue");

ModelDAO.forEach(d.put.bind(d));
d.forEach(console.log.bind(console, 'forEach: '));
*/
