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
  name: 'KeywordDAO',
  package: 'foam.core.dao',

  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'idMap',
      factory: function() { return {}; }
    },
    {
      name: 'DefaultQuery',
    }
    /*
      TODO: add a DAO for persisting keyword mappings
    {
      name: 'keywordsDAO'
    }
    */
  ],

  methods: {
    init: function() {
      this.SUPER();

      var keywords = this;
      var oldF     = this.DefaultQuery.getPrototype().f;

      this.DefaultQuery.getPrototype().f = function(obj) {
        return keywords.match(obj.id, this.arg1) || oldF.call(this, obj);
      };
    },

    addKeyword: function(id, keyword) {
      // console.log('******* addKeyword: ', id, keyword);
      var map = this.idMap[id] || ( this.idMap[id] = {} );
      map[keyword] = true;
    },

    removeKeywords: function(id) {
      delete this.idMap[id];
    },

    match: function(id, keyword) {
      var map = this.idMap[id];
      return map && map[keyword];
    },

    select: function(sink, options) {
      var query = options && options.query;

      if ( ! query ) return this.delegate.select(sink, options);

      sink = sink || [].sink;

      var arg1;

      var keywords = this;

      var newSink = {
        __proto__: sink,
        put: function(obj) {
          if ( ! query.f(obj) ) keywords.addKeyword(obj.id, arg1);
          sink.put.apply(sink, arguments);
        }
      };

      // TODO(kgr): This is a bit hackish, replace with visitor support
      this.DefaultQuery.getPrototype().partialEval = function() {
        var q = keywords.DefaultQuery.create(this);
        // console.log('**** ', this.arg1);
        arg1 = this.arg1.intern();
        return q;
      };
      var newQuery = query.partialEval();
      delete this.DefaultQuery.getPrototype()['partialEval'];

      var newOptions = { __proto__: options, query: newQuery };

      return this.delegate.select(newSink, newOptions);
    },

    remove: function(query, sink) {
      var key = obj[this.model.ids[0]] != undefined ? obj[this.model.ids[0]] : obj;
      this.removeKeywords(key);
      this.delegate.remove(query, sink);
    },
  }
});
