  /**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'TimingDAO',

  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    Times access to the this.SUPER DAO.
  */},

  properties: [
    'name',
    'id',
    ['activeOps', {put: 0, remove:0, find: 0, select: 0}]
  ],

  methods: [
    function start(op) {
      var str = this.name + '-' + op;
      var key = this.activeOps[op]++ ? str + '-' + (this.id++) : str;
      console.time(this.id);
      return [key, str, window.performance.now(), op];
    },

    function end(act) {
      this.activeOps[act[3]]--;
      this.id--;
      console.timeEnd(act[0]);
      console.log('Timing: ', act[1], ' ', (window.performance.now()-act[2]).toFixed(3), ' ms');
    },

    function endSink(act, sink) {
      return {
        put:    function() { end(act); sink && sink.put    && sink.put.apply(sink, arguments); },
        remove: function() { end(act); sink && sink.remove && sink.remove.apply(sink, arguments); },
        error:  function() { end(act); sink && sink.error  && sink.error.apply(sink, arguments); },
        eof:    function() { end(act); sink && sink.eof    && sink.eof.apply(sink, arguments); }
      };
    },

    function put(obj, sink) {
      var act = start('put');
      this.SUPER(obj, endSink(act, sink));
    },
    function remove(query, sink) {
      var act = start('remove');
      this.SUPER(query, endSink(act, sink));
    },
    function find(key, sink) {
      var act = start('find');
      this.SUPER(key, endSink(act, sink));
    },
    function select(sink, options) {
      var act = start('select');
      var fut = afuture();
      this.SUPER(sink, options)(function(s) {
        end(act);
        fut.set(s);
      });
      return fut.get;
    }
  ]
});
