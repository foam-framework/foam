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

var FilteredDAO = {

    create: function(predicate, delegate) {
	return {
	    __proto__: delegate,
            predicate: predicate,
            select: function(predicate) {
              return delegate.select(AND(predicate, this.predicate));
            },

            forEach: function(action, predicate) {
              return delegate.forEach(action, AND(predicate, this.predicate));
            }
	};
    }
};


/**
 * Set a specified properties value with an auto-increment
 * sequence number on DAO.put() if the properties value
 * is set to the properties default value.
 */
var SeqNoDAO = {

  create: function(prop, startSeqNo, delegate) {
    delegate.forEach(function(obj) {
      var val = obj[prop.name];

      startSeqNo = Math.max(val, startSeqNo);
    });

    return {
      __proto__: delegate,
      prop:      prop,

      put: function(obj) {
        var val = obj[prop.name];

        if ( val == prop.defaultValue )
          obj[prop.name] = startSeqNo++;

        return delegate.put(obj);
      }
    };
  }
};


var ArrayDAO = {
    __proto__: EventService,

    create: function(arr) {
	return {
	    __proto__: this,
	    arr: arr
	};
    },

    put: function(obj) {
	var added = false;
	for (var idx in this.arr) {
	    if (this.arr[idx].id === obj.id) {
		this.arr[idx] = obj;
		added = true;
		break;
	    }
	}
	if (! added)
	    this.arr.push(obj);
	this.sync_();
    },

    has: function(obj) {
	for (var idx in this.arr)
	    if (this.arr[idx].id === obj.id)
		return true;
	return false;
    },

    get: function(predicate) {
	var param = predicate;
	if (typeof predicate !== 'function')
	    predicate = function(obj) { return obj.id === param; };

	for (var idx in this.arr) {
	    var obj = this.arr[idx];
	    if (predicate.f(obj) === true)
		return obj;
	}
	return undefined;
    },

    select: function(predicate) {
	var res = [ ];
	var func = res.push.bind(res);
	this.forEach(func, predicate);
	return res;
    },

    forEach: function(action, predicate) {
	if (predicate) {
	    for (var idx in this.arr)
		if (predicate.f(this.arr[idx]))
		    action(this.arr[idx]);
	} else {
	    for (var idx in this.arr)
		action(this.arr[idx]);
	}
    },

    remove: function(predicate) {
	var param = predicate;
	if (typeof predicate !== 'function')
	    predicate = function(obj) { return obj.id === param.id; };

	for (var i = 0; i < this.arr.length; i++) {
	  var obj = this.arr[i];
	  if (predicate.f(obj)) {
            this.arr.splice(i,1);
            i--;
	  }
	}
	this.sync_();
    },

    sync_: function() {
	this.publish('updated');
    },

    del: function() {
	;
    },

    asValue: function() {
      var dao = this;

      return {
        //////////////////////////// Implement Value

        addListener: function(listener) {
          dao.subscribe('updated');
        },

        removeListener: function(listener) {
          dao.unsubscribe('updated', listener);
        },

        get: function() {
          return dao.select();
        }
      };
    }

};

/*
// Defers all calls to the decorated DAO until it receives
// a 'dao-ready' event.
// This is useful for decorating DAOs that don't have a synchronous
// initialization path (ex. IndexedDBDAO).
var DeferredDAO = {
    create: function(dao) {
	var obj = {
	    __proto__: this,
	    dao: dao,
	    queue: []
	};

	dao.subscribe('dao-ready', obj.onready.bind(obj));

	return obj;
    },

    get: function(key, callback) {
	if (this.ready) {
	    this.dao.get(key, callback);
	    return;
	}

	this.queue.push(this.dao.get.bind(this.dao, key, callback));
    },

    put: function(value) {
	if (this.ready) {
	    this.dao.put(value);
	    return;
	}
	this.queue.push(this.dao.bind(this.dao, value));
    },

    forEach: function(query, iterator) {
	if (this.ready) {
	    this.dao.forEach(query, iterator);
	    return;
	}
	this.queue.push(this.dao.bind(this.dao, query, iterator));
    },

    onready: function() {
	this.ready = true;
	// Execute all queued actions.
	for (var i  = 0; i < this.queue.length; i++) {
	    this.queue[i]();
	}
    }
};
*/

//FIXME: handle exceptions
var StorageDAO = {

    __proto__: EventService,

    create: function(storageKey) {
	return {
	    __proto__:  this,
	    storageKey: storageKey,
	    storage:    JSONUtil.parse(localStorage.getItem(storageKey)) || {}
	};
    },

    // Special constructor for use when loading Model containing DAO's
    createModels: function(storageKey) {
       var models = eval('(' + localStorage.getItem(storageKey) + ')') || {};

       var modelLoader = function(key) {
//	  console.log("loading: " + key);
	  var model = JSONUtil.chaosify(models[key], modelLoader);
	  if ( model.name == 'Model' ) model.model_ = model;
	  return model;
       };

       //modelLoader("Model");
       //Model.create = ModelProto.create;

       for ( var key in models )
	  models[key] = modelLoader(key);

       return {
	  __proto__:  this,
	  storageKey: storageKey,
	  storage:    models
       };
    },

    load: function(storageKey, storageValue) {
	var res = this.create(storageKey);
	res.parse_(storageValue);
	return res;
    },

    parse_: function(serialized) {
	var stObj = JSONUtil.parse(serialized);
	for (var objID in stObj)
	    this.storage[objID] = JSONUtil.parse(stObj[objID]);
    },

    sync_: function() {
	localStorage.setItem(this.storageKey, JSONUtil.stringify(this.storage));
	this.publish('updated');
    },

    put: function(obj) {
	if (this.has(obj))
	    this.update_(obj);
	else
	    this.insert_(obj);
	this.sync_();
    },

    insert_: function(obj) {
	this.storage[obj.id] = obj;
    },

    update_: function(obj) {
	this.storage[obj.id] = obj;
    },

    has: function(obj) {
	return this.storage.hasOwnProperty(obj.id);
    },

    get: function(predicate) {
	var param = predicate;
	if (! EXPR.isInstance(predicate)) {
	    return this.storage[predicate];
	} else {
	    for (var objID in this.storage) {
		var obj = this.storage[objID];
		if (predicate.f(obj) === true)
		    return obj;
	    }
	}
	return undefined;
    },

    select: function(predicate) {
	var res = [ ];
	var func = res.push.bind(res);
	this.forEach(func, predicate);
	return res;
    },

    forEach: function(action, predicate) {
	if (predicate) {
	    for (var objID in this.storage) {
		var obj = this.storage[objID];
		if (predicate.f(obj))
		    action(obj);
	    }
	} else {
	    for (var objID in this.storage)
		action(this.storage[objID]);
	}
	return action;
    },

    remove: function(predicate) {
	if (EXPR.isInstance(predicate)) {
	    for (var objID in this.storage) {
		var obj = this.storage[objID];
		if (predicate.f(obj))
		    delete this.storage[objID];
	    }
	} else {
	    delete this.storage[predicate.id];
	}
	//TODO: do not sync_ if no object was removed
	this.sync_();
    },

    del: function() {
	localStorage.removeItem(this.storageKey);
    },


    asValue: function() {
      var dao = this;

      return {
        //////////////////////////// Implement Value

        addListener: function(listener) {
          dao.subscribe('updated');
        },

        removeListener: function(listener) {
          dao.unsubscribe('updated', listener);
        },

        get: function() {
          return dao.select();
        }
      };
    }
/*
    //////////////////////////// Implement Model

    addListener: function(listener) {
       this.subscribe('updated');
    },

    removeListener: function(listener) {
       this.unsubscribe('updated', listener);
    },

    get: function() {
       return this.select();
    }
*/

};


var ModelDAO = {
    create: function(namespace, dao) {
	var res = {
	    __proto__: dao,
	    namespace: namespace,
	    dao:       dao,
	    created:   { },

	    init_: function() {
		this.forEach(this.add_.bind(this));
	    },

	    add_: function(obj) {
//	       this.namespace[obj.name]           = obj;
//	       this.namespace[obj.name + "Proto"] = obj.getPrototype();

	       if ( obj.name == 'Model' ) return;

	       var dao = this;
	       if ( ! this.namespace[obj.name] )
	       FOAM.putFactory(this.namespace, obj.name, function() {
                 console.log("Loading Model '" + obj.name + "'");
		 return dao.get(obj.name);
               });

	       FOAM.putFactory(this.namespace, obj.name + "Proto", function() {
                  return this[obj.name].getPrototype();
               });

	       FOAM.putFactory(this.namespace, obj.name + 'DAO', function() {
		  console.log("Creating '" + obj.name + "DAO'");
                  return StorageDAO.create(obj.plural);
               });

	       // this.namespace[obj.plural] = StorageDAO.create(obj.plural)
	    },

	    del: function() {
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



var UnitTests = FOAM.create(
{
     model_: 'Model',
     name: 'UnitTests',
     label: 'Unit Tests',
     plural: 'UnitTests',
     tests:[
{
     model_: 'UnitTest',
     description: 'DAO Tests',
     passed: 24,
     code: function () {
 var propagateBookmarks = function(bookmarks) {
    bookmarks.put(BookmarkModel.getPrototype().create({index: 1, title: 'Google Blog', url: 'http://googleblog.blogspot.com/2011/09/happy-third-birthday-chrome.html'}));
};
    // TODO: sample bookmarks removed for privacy issues, add new bookarms and fix tests

var firstBookmarksTest = function(bookmarks) {
    this.assert(bookmarks.select(function(bmrk) { return bmrk.title[0] == "M"; }).
	length == 2,
	'# of titles beginning with M == 2');
    this.assert(bookmarks.get(function(bmrk) { return bmrk.title[0] == "M"; }).
	title[0] == "M", "first obj with title beginning with M");
    this.assert(bookmarks.select(function(bmrk) { return bmrk.index % 3 == 2; }).
	length == 2,
	'# (index mod 3 == 2) == 2');
    this.assert(bookmarks.select(function(bmrk) { return bmrk.title[0] == "A"; }).
	length == 0,
	'# of titles beginning with A == 0');
    var chosenBookmarks = bookmarks.get(1);
    this.assert(chosenBookmarks.title === 'Google Blog',
	    'chosenBookmarks title');

    var counter = 0;
    var incrCounter = function() { ++counter; };
    bookmarks.forEach(incrCounter);
    this.assert(counter == 6, 'forEach pass');

    counter = 0;
    bookmarks.forEach(incrCounter,
			    function(bmrk) { return bmrk.title[0] == "M"; });
    this.assert(counter == 2, 'forEach pass (first letter = "M")');

    counter = 0;
    bookmarks.forEach(incrCounter,
			    function(bmrk) { return bmrk.title[0] == "A"; });
    this.assert(counter == 0, 'forEach pass (first letter = "A")');

    var obj2 = bookmarks.get(2);
    bookmarks.remove(obj2);
    bookmarks.remove(obj2);
    this.assert(bookmarks.select().length == 5, 'collection size after removal');
    this.assert(bookmarks.select(function(bmrk) { return bmrk.title[0] == "M"; }).
	length == 1,
	'# of titles beginning with M == 1');
    bookmarks.put(BookmarkModel.getPrototype().create({index: 2, title: 'XXX', url: 'https://XXX'}));
    this.assert(bookmarks.select().length == 6, 'collection size after re-insertion');

    bookmarks.remove(function(bmrk) { return bmrk.title[0] == "M"; });
    this.assert(bookmarks.select().length == 4, 'collection size after another removal');
    bookmarks.put(BookmarkModel.getPrototype().create({index: 2, title: 'XXX', url: 'https://XXX'}));
    bookmarks.put(BookmarkModel.getPrototype().create({index: 4, title: 'YYY', url: 'https://YYY'}));
};


  this.addHeader('ArrayDAO');
  var bookmarksDao = ArrayDAO.create([]);
  propagateBookmarks.call(this, bookmarksDao);
  firstBookmarksTest.call(this,bookmarksDao);

  this.addHeader('StorageDAO');
  bookmarksDao = StorageDAO.create("test2");
  propagateBookmarks.call(this, bookmarksDao);
  firstBookmarksTest.call(this,bookmarksDao);


}
  }

]});