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
           return this.model.plural + "17";
         }
      }
   ],

   methods: {

    openDB: function(cc) {
      var indexedDB = window.indexedDB ||
        window.webkitIndexedDB         ||
         window.mozIndexedDB;

      var request = indexedDB.open("FOAM:" + this.name, Date.now());

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

    execute: function(mode, fn) {
      if ( ! this.db ) this.db = future(this.openDB.bind(this));

      this.db((function (db) {
        var tx = db.transaction([this.name], mode);
        fn.bind(this)(tx.objectStore(this.name));
      }).bind(this));
    },

    put: function(value) {
console.log('put: ', value.instance_, value.id);
      this.execute("readwrite", function(store) {
        var request = store.put(value.instance_);
	request.onsuccess = console.log.bind(console, 'put success: '); //this.updated;
	request.onerror = console.log.bind(console, 'put error: ');
      });
    },

    get: function(callback, key) {
      this.execute("readonly", function(store) {
console.log('getting: ', key);
        var request = store.get(key);
        request.onsuccess = callback;
        request.onerror = console.log.bind(console, 'get error: ');
      });
    },

    // TODO: Model queries and handle them at the db layer
    // where we can, rather than doing all the processing in
    // javascript.
    forEach2: function(fn, opt_predicate) {
      this.execute("readonly", function(store) {
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
var d2 = IndexedDBDAO2.create({model: Model});
d2.put(Issue);
d2.get(console.log.bind(console), "Issue");

ModelDAO.forEach(d2.put.bind(d2));
d2.forEach(console.log.bind(console, 'forEach: '));
*/
