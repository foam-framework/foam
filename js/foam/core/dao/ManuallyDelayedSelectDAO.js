/*
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
  name: 'ManuallyDelayedSelectDAO',
  package: 'foam.core.dao',
  extends: 'foam.dao.ProxyDAO',
  properties: [
    {
      name: 'pending',
      factory: function() { return []; }
    }
  ],
  methods: {
    select: function(sink, options) {
      var future = afuture();

      sink = sink || [].sink;

      var daofuture = this.delegate.select(undefined, options);

      var fc = this.createFlowControl_();

      this.pending.push(function(ret) {
        daofuture(function(a) {
          for ( var i = 0; i < a.length && ! fc.stopped; i++ ) {
            sink.put(a[i], null, fc);
            if ( fc.errorEvt ) {
              sink.error && sink.error(fc.errorEvt);
            }
          }
          if ( ! fc.errorEvt ) {
            sink.eof && sink.eof();
          }
          future.set(sink);
          ret();
        });
      });

      return future.get;
    },
    join: function(ret) {
      var pending = this.pending;
      this.pending = [];
      apar.apply(null, pending)(ret);
    }
  }
});
