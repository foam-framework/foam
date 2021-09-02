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
  name: 'ContextualizingDAO',
  extends: 'foam.dao.ProxyDAO',
  methods: {
    find: function(id, sink) {
      var X = this.Y;
      this.delegate.find(id, {
        put: function(o) {
          if ( sink && sink.put ) {
            sink.put(o.model_.create(o, X));
          }
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      });
    }
  }
});
