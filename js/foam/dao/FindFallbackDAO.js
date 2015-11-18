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


CLASS({
  package: 'foam.dao',
  name: 'FindFallbackDAO',


  documentation: function() {/* Passes through to the delegate except on
    a failed find: The fallback DAO is queried, and returns the result
    if found there. Like a simple cache, a find from the fallback is also
    put() into the primary delegate. */},

  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'fallback'
    }
  ],

  methods: {
    find: function(id, sink) {
      var delegate = this.delegate;
      var fallback = this.fallback;
      delegate.find(id, {
        put: sink.put.bind(sink),
        error: function() {
          if ( fallback ) {
            fallback.find(id, {
              put: function(o) {
                delegate.put(o); // put result back to primary
                sink && sink.put && sink.put(o);
              },
              error: function() {
                sink && sink.error && sink.error();
              }
            });
          } else {
            sink && sink.error && sink.error();
          }
        }
      });
    }
  }
});
