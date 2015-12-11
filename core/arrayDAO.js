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
  // Copy X.AbstractDAO methods in Array prototype

  var pmap = {};
  for ( var key in AbstractDAO.methods ) {
    pmap[AbstractDAO.methods[key].name] = AbstractDAO.methods[key].code;
  }

  for ( var key in pmap ) {
    Object.defineProperty(Array.prototype, key, {
      value: pmap[key],
      configurable: true,
      writable: true
    });
  }
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
    return this.slice().sink;
  },
  deepClone: function() {
    var r = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      r[i] = this[i].deepClone();
    }
    return r.sink;
  },
  exprClone: function() {
    return this.deepClone();
  }
};


MODEL0({
  extendsProto: 'Array',

  properties: [
    {
      name: 'dao',
      getter: function() { this.__proto__ = Array.prototype; return this; }
    },
    {
      name: 'sink',
      getter: function() { this.__proto__ = ArraySink; return this; }
    }
  ],
  methods: {
    listen:   AbstractDAO.getPrototype().listen,
    unlisten: AbstractDAO.getPrototype().unlisten,
    notify_:  AbstractDAO.getPrototype().notify_,

    put: function(obj, sink) {
      // TODO: remove() checks obj.id for falsy, and uses obj instead of obj.id. Inconsistent!
      for ( var idx = 0; idx < this.length; idx++ ) {
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
        for ( var idx = 0 ; idx < this.length; idx++ ) {
          if ( query.f(this[idx]) ) {
            sink && sink.put && sink.put(this[idx]);
            return;
          }
        }
      } else {
        for ( var idx = 0 ; idx < this.length; idx++ ) {
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
      for ( var idx = 0 ; idx < this.length; idx++ ) {
        if ( this[idx].id === id ) {
          var rem = this.splice(idx,1)[0];
          this.notify_('remove', [rem]);
          sink && sink.remove && sink.remove(rem);
          return;
        }
      }
      sink && sink.error && sink.error('remove', obj);
    },
    removeAll: function(sink, options) {
      if ( ! options ) options = {};
      if ( !options.query ) options.query = { f: function() { return true; } };

      for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        if ( options.query.f(obj) ) {
          var rem = this.splice(i,1)[0];
          this.notify_('remove', [rem]);
          sink && sink.remove && sink.remove(rem);
          i--;
        }
      }
      sink && sink.eof && sink.eof();
      return anop();
    },
    select: function(sink, options) {
      sink = sink || [].sink;
      var hasQuery = options && ( options.query || options.order );
      var originalsink = sink;
      sink = this.decorateSink_(sink, options, false, ! hasQuery);

      // Short-circuit COUNT.
      if ( ! hasQuery && GLOBAL.CountExpr && CountExpr.isInstance(sink) ) {
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
  }
});
