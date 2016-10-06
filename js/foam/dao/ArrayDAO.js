/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.dao',
  name: 'ArrayDAO',
  extends: 'AbstractDAO',
  properties: [
    {
      name: 'array',
      factory: function() { return []; }
    }
  ],
  methods: [
    function put(obj, sink) {
      for ( var idx = 0; idx < this.array.length; idx++ ) {
        if ( this.array[idx].id === obj.id ) {
          this.array[idx] = obj;
          sink && sink.put && sink.put(obj);
          this.notify_('put', [obj]);
          return;
        }
      }
      this.array.push(obj);
      this.notify_('put', [obj]);
      sink && sink.put && sink.put(obj);
    },
    function find(query, sink) {
      if ( query && query.f ) {
        for ( var idx = 0 ; idx < this.array.length; idx++ ) {
          if ( query.f(this.array[idx]) ) {
            sink && sink.put && sink.put(this.array[idx]);
            return;
          }
        }
      } else {
        for ( var idx = 0 ; idx < this.array.length; idx++ ) {
          if ( this.array[idx].id === query ) {
            sink && sink.put && sink.put(this.array[idx]);
            return;
          }
        }
      }
      sink && sink.error && sink.error('find', query);
    },
    function remove(obj, sink) {
      if ( ! obj ) {
        sink && sink.error && sink.error('missing key');
        return;
      }
      var objId = obj.id;
      var id = (objId !== undefined && objId !== '') ? objId : obj;

      for ( var idx = 0 ; idx < this.array.length; idx++ ) {
        if ( this.array[idx].id === id ) {
          var rem = this.array.splice(idx,1)[0];
          this.notify_('remove', [rem]);
          sink && sink.remove && sink.remove(rem);
          return;
        }
      }
      sink && sink.error && sink.error('remove', obj);
    },
    function removeAll(sink, options) {
      if ( ! options ) options = {};
      if ( !options.query ) options.query = TRUE;

      for (var i = 0; i < this.array.length; i++) {
        var obj = this.array[i];
        if ( options.query.f(obj) ) {
          var rem = this.array.splice(i,1)[0];
          this.notify_('remove', [rem]);
          sink && sink.remove && sink.remove(rem);
          i--;
        }
      }
      sink && sink.eof && sink.eof();
      return anop();
    },
    function select(sink, options) {
      sink = sink || [].sink;

      var hasQuery = options && ( options.query || options.order );
      var originalsink = sink;
      sink = this.decorateSink_(sink, options, false, ! hasQuery);

      // Short-circuit COUNT.
      if ( ! hasQuery && GLOBAL.CountExpr && CountExpr.isInstance(sink) ) {
        sink.count = this.array.length;
        return aconstant(originalsink);
      }

      var fc = this.createFlowControl_();
      var start = Math.max(0, hasQuery ? 0 : ( options && options.skip ) || 0);
      var end = hasQuery ?
        this.array.length :
        Math.min(this.array.length, start + ( ( options && options.limit ) || this.array.length));
      for ( var i = start ; i < end ; i++ ) {
        sink.put(this.array[i], null, fc);
        if ( fc.stopped ) break;
        if ( fc.errorEvt ) {
          sink.error && sink.error(fc.errorEvt);
          return aconstant(originalsink, fc.errorEvt);
        }
      }

      sink.eof && sink.eof();

      return aconstant(originalsink);
    }
  ]
});
