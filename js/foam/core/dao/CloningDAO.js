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
  package: 'foam.core.dao',
  name: 'CloningDAO',
  properties: [
    {
      type: 'Boolean',
      name: 'onSelect',
      defaultValue: false
    }
  ],
  extends: 'foam.dao.ProxyDAO',
  methods: [
    function select(sink, options) {
      if ( ! this.onSelect ) return this.SUPER(sink, options);

      sink = sink || [].sink;
      var future = afuture();
      this.delegate.select({
        put: function(obj, s, fc) {
          obj = obj.deepClone();
          sink.put && sink.put(obj, s, fc);
        },
        error: function() {
          sink.error && sink.error.apply(sink, argumentS);
        },
        eof: function() {
          sink.eof && sink.eof();
          future.set(sink);
        }
      }, options);
      return future.get;
    },
    function find(key, sink) {
      return this.SUPER(key, {
        put: function(o) {
          var clone = o.deepClone();
          sink && sink.put && sink.put(clone);
        },
        error: sink && sink.error && sink.error.bind(sink)
      });
    },
    function put(obj, sink) {
      obj = obj.deepClone();
      this.SUPER(obj, sink);
    }
  ]
});
