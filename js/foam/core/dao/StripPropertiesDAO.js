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
  package: 'foam.core.dao',
  name: 'StripPropertiesDAO',
  extends: 'foam.dao.ProxyDAO',
  properties: [
    {
      type: 'StringArray',
      name: 'propertyNames'
    }
  ],
  methods: {
    process_: function(obj) {
      obj = obj.clone();
      for ( var i = 0 ; i < this.propertyNames.length ; i++ ) {
        obj.clearProperty(this.propertyNames[i]);
      }
      return obj;
    },
    select: function(sink, options) {
      sink = sink || [].sink;
      var self = this;
      var future = afuture();

      this.SUPER({
        put: function(obj, _, fc) {
          sink.put && sink.put(self.process_(obj), null, fc);
        },
        error: function() {
          sink.error && sink.error.apply(sink, arguments);
        },
        eof: function() {
          sink.eof && sink.eof();
        }
      }, options)(function() {
        future.set(sink);
      });

      return future.get;
    }
  }
});
