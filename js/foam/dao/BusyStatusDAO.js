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
  name: 'BusyStatusDAO',
  extends: 'foam.dao.ProxyDAO',
  imports: [
    'busyStatus'
  ],

  methods: {
    wrapSink: function(op, sink) {
      var comp = this.busyStatus.start();
      // NB: We must make sure that whenever anything is called on sink, this
      // is the original sink, not mysink. Otherwise eg. MDAO will fail, as it
      // writes things to mysink.instance_ and not sink.instance_.
      var mysink = {
        error: function() {
          comp();
          sink && sink.error && sink.error.apply(sink, arguments);
        },
        eof: op === 'select' || op === 'removeAll' ?
          function() { comp(); sink && sink.eof && sink.eof(); } :
          sink && sink.eof && sink.eof.bind(sink),
        put: op === 'put' || op === 'find' ?
          function(x) { comp(); sink && sink.put && sink.put(x); } :
          sink && sink.put && sink.put.bind(sink),
        remove: op === 'remove' ?
          function(x) { comp(); sink && sink.remove && sink.remove(x); } :
          sink && sink.remove && sink.remove.bind(sink)
      };

      return mysink;
    },
    select: function(sink, options) {
      return this.delegate.select(this.wrapSink('select', sink || [].sink), options);
    },
    put: function(obj, sink) {
      this.delegate.put(obj, this.wrapSink('put', sink));
    },
    remove: function(obj, sink) {
      this.delegate.remove(obj, this.wrapSink('remove', sink));
    },
    find: function(obj, sink) {
      this.delegate.find(obj, this.wrapSink('find', sink));
    },
    removeAll: function(sink, options) {
      return this.delegate.removeAll(this.wrapSink('removeAll', sink), options);
    }
  }
});
