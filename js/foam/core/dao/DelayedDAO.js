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
  name: 'DelayedDAO',
  package: 'foam.core.dao',
  help: "Apply this decorator to a DAO if you'd like to pretend that accesses are slow. Currently, only select has been targetted.",
  extendsModel: 'ProxyDAO',

  properties: [
    {
      model_: 'IntProperty',
      name: 'initialDelay'
    },
    {
      model_: 'IntProperty',
      name: 'rowDelay'
    }
  ],

  methods: {
    select: function(sink, options) {
      sink = sink || [];
      var f = afuture();
      var self = this;

      if ( Expr.isInstance(sink) ) {
        setTimeout(function() {
          self.delegate.select(sink, options)(f.set)
        }, this.initialDelay);
        return f.get;
      }


      var i = 0;
      var delayedSink = {
        pars: [],
        put: function() {
          var args = arguments;
          this.pars.push(
            function(ret) {
              setTimeout(function() {
                sink.put.apply(sink, args);
                ret()
              }, self.rowDelay * ++i );
            });
        },
        eof: function() {
          apar.apply(null, this.pars)(
            function() {
              sink && sink.eof && sink.eof();
              f.set(sink);
            });
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      };

      setTimeout(function() {
        self.delegate.select(delayedSink, options)
      }, this.initialDelay);

      return f.get;
    }
  }
});
