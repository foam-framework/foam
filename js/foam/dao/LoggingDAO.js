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
  name: 'LoggingDAO',

  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    Logs access to the delegate DAO.
  */},

  properties: [
    {
      name: 'name',
    },
    {
      name: 'logger',
      lazyFactory: function() {
        return console.log.bind(console, this.name);
      }
    },
    {
      type: 'Boolean',
      name: 'logReads',
      defaultValue: false
    },
  ],

  methods: [
    function put(obj, sink) {
      this.logger('put', obj);
      this.SUPER(obj, sink);
    },
    function remove(query, sink) {
      this.logger('remove', query);
      this.SUPER(query, sink);
    },
    function select(sink, options) {
      this.logger('select', options || "");
      if ( this.logReads ) {
        var put = sink.put.bind(sink);
        var newSink = { __proto__: sink };
        newSink.put = function(o) {
          this.logger('read', o);
          return put.apply(null, arguments);
        }.bind(this);
        return this.SUPER(newSink, options);
      }
      return this.SUPER(sink, options);
    },
    function removeAll(sink, options) {
      this.logger('removeAll', options);
      return this.SUPER(sink, options);
    },
    function find(id, sink) {
      this.logger('find', id);
      return this.SUPER(id, sink);
    }

  ]
});
