/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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


(function() {
  // Copy AbstractDAO methods in Array prototype

  var pmap = {};
  for ( var key in AbstractDAO.methods ) {
    pmap[AbstractDAO.methods[key].name] = AbstractDAO.methods[key].code;
  }

  defineProperties(Array.prototype, pmap);
})();

defineLazyProperty(Array.prototype, 'daoListeners_', function() {
  return {
    value: [],
    configurable: true
  };
});


var ArraySink = {
  __proto__: Array.prototype,
  put: function(obj, sink) {
    this.push(obj);
    this.notify_('put', arguments);
    sink && sink.put && sink.put(obj);
  },
  clone: function() {
    return this.slice(0).sink;
  },
  deepClone: function() {
    var a = this.slice(0);
    for ( var i = 0 ; i < a.length ; i++ ) {
      a[i] = a[i].deepClone();
    }
    return a.sink;
  }
};


Object.defineProperty(Array.prototype, 'dao', {
  get: function() { this.__proto__ = Array.prototype; return this; },
  writeable: true
});

Object.defineProperty(Array.prototype, 'sink', {
  get: function() { this.__proto__ = ArraySink; return this; },
  writeable: true
});

defineProperties(Array.prototype, {
  listen:   AbstractDAO.getPrototype().listen,
  unlisten: AbstractDAO.getPrototype().unlisten,
  notify_:  AbstractDAO.getPrototype().notify_,
/*
  listen:   function() { },
  unlisten: function() { },
  notify_:  function() { },
*/
  // Clone this Array and remove 'v' (only 1 instance)
  // TODO: make faster by copying in one pass, without splicing
  deleteF: function(v) {
    var a = this.clone();
    for (var i = 0; i < a.length; i++) {
      if ( a[i] === v ) { a.splice(i, 1); break; }
    }
    return a;
  },
  // Remove 'v' from this array (only 1 instance removed)
  // return true iff the value was removed
  deleteI: function(v) {
    for (var i = 0; i < this.length; i++) {
      if ( this[i] === v ) { this.splice(i, 1); return true; }
    }
    return false;
  },
  // Clone this Array and remove first object where predicate 'p' returns true
  // TODO: make faster by copying in one pass, without splicing
  removeF: function(p) {
    var a = this.clone();
    for (var i = 0; i < a.length; i++) {
      if ( p.f(a[i]) ) { a.splice(i, 1); break; }
    }
    return a;
  },
  // Remove first object in this array where predicate 'p' returns true
  removeI: function(p) {
    for (var i = 0; i < this.length; i++) {
      if (p.f(this[i])) { this.splice(i, 1); breeak; }
    }
    return this;
  },
  pushF: function(obj) {
    var a = this.clone();
    a.push(obj);
    return a;
  },
  clone: function() {
    return this.slice(0);
  },
  deepClone: function() {
    var a = this.slice(0);
    for ( var i = 0 ; i < a.length ; i++ ) {
      a[i] = a[i].deepClone();
    }
    return a;
  },
  id: function(obj) {
    return obj.id || obj.$UID;
  },
  put: function(obj, sink) {
    for ( var idx in this ) {
      if ( this[idx].id === obj.id ) {
        this[idx] = obj;
        sink && sink.put && sink.put(obj);
        this.notify_('put', arguments);
        //        sink && sink.error && sink.error('put', obj, duplicate);
        return;
      }
    }

    this.push(obj);
    this.notify_('put', arguments);
    sink && sink.put && sink.put(obj);
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
  // TODO: make this faster, should stop after finding first item.
  remove: function(obj, sink) {
    if ( ! obj ) {
      sink && sink.error && sink.error('missing key');
      return;
    }
    var objId = obj.id;
    var id = (objId !== undefined && objId !== '') ? objId : obj;
    for ( var idx in this ) {
      if ( this[idx].id === id ) {
        var rem = this.splice(idx,1)[0];
//        this.notify_('remove', rem);
        sink && sink.remove && sink.remove(rem[0]);
        return;
      }
    }
    sink && sink.error && sink.error('remove', obj);
  },
  removeAll: function(sink, options) {
    if (!options) options = {};
    if (!options.query) options.query = { f: function() { return true; } };

    for (var i = 0; i < this.length; i++) {
      var obj = this[i];
      if (options.query.f(obj)) {
        var rem = this.splice(i,1)[0];
//        this.notify_('remove', [rem]);
        sink && sink.remove && sink.remove(rem);
        i--;
      }
    }
    sink && sink.eof && sink.eof();
    return anop();
  },
  select: function(sink, options) {
    sink = sink || [];
    var hasQuery = options && ( options.query || options.order );
    var originalsink = sink;
    sink = this.decorateSink_(sink, options, false, ! hasQuery);

    // Short-circuit COUNT.
    if ( ! hasQuery && sink.model_ === CountExpr ) {
      sink.count = this.length;
      return aconstant(originalsink);
    }

    var fc = this.createFlowControl_();
    var start = Math.max(0, hasQuery ? 0 : ( options && options.skip ) || 0);
    var end = hasQuery ?
      this.length :
      Math.min(this.length, start + ( ( options && options.limit ) || this.length));
    for ( var i = start ; i < end ; i++ ) {
      sink.put(this[i], null, fc);
      if ( fc.stopped ) break;
      if ( fc.errorEvt ) {
        sink.error && sink.error(fc.errorEvt);
        return aconstant(originalsink, fc.errorEvt);
      }
    }

    sink.eof && sink.eof();

    return aconstant(originalsink);
  }
});
