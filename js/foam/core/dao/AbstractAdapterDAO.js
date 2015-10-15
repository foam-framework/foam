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
  name: 'AbstractAdapterDAO',
  package: 'foam.core.dao',
  extends: 'foam.dao.ProxyDAO',
  help: 'An abstract decorator for adapting a DAO of one data type to another data type.  Extend this class and implement aToB() and bToA().',

  methods: {
    adaptKey_: function(key) {
      // Usually the primary key doesn't need to be adapted.
      return key;
    },
    put: function(obj, sink) {
      obj = this.aToB(obj);
      this.SUPER(obj, sink);
    },
    remove: function(obj, sink) {
      obj = this.aToB(obj);
      this.SUPER(obj, sink);
    },
    adaptSink_: function(sink) {
      var self = this;
      return {
        put: function(o, s, fc) {
          o = self.bToA(o);
          sink && sink.put && sink.put(o, s, fc);
        },
        eof: function() {
          sink && sink.eof && sink.eof();
        }
      };
    },
    select: function(sink, options) {
      sink = this.decorateSink_(sink, options);
      var mysink = this.adaptSink_(sink);
      options = this.adaptOptions_(options);
      var future = afuture();
      this.SUPER(mysink, options)(function() { future.set(sink); });
      return future.get;
    },
    find: function(key, sink) {
      var self = this;
      this.SUPER(this.adaptKey_(key), {
        put: function(o) {
          sink && sink.put && sink.put(self.bToA(o));
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      });
    },
    removeAll: function(sink, options) {
      options = this.adaptOptions_(options);
      var self = this;
      var mysink = {
        remove: function(o, sink, fc) {
          sink && sink.remove && sink.remove(self.bToA(o), sink, fc);
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      };
      this.SUPER(mysink, options);
    },
    listen: function(s, options) {
      if ( options ) var myoptions = this.adaptOptions_(options);
      var self = this;
      var mysink = {
        $UID: s.$UID,
        put: function(o, sink, fc) {
          // TODO: The check that o is valid is a workaround until we have
          // an 'update' event on daos.
          s.put && s.put(o && self.bToA(o), sink, fc);
        },
        remove: function(o, sink, fc) {
          s.remove && s.remove(self.bToA(o), sink, fc);
        },
        error: function() {
          s.error && s.error.apply(s, arguments);
        }
      };
      s = this.decorateSink_(s, options, true);
      this.SUPER(mysink, myoptions);
    }
  }
});
