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
  package: 'foam.mlang',
  name: 'ExpandableGroupByExpr',

  extends: 'BINARY',

  properties: [
    {
      name:  'groups',
      type:  'Map[Expr]',
      help:  'Groups.',
      factory: function() { return {}; }
    },
    {
      name:  'expanded',
      type:  'Map',
      help:  'Expanded.',
      factory: function() { return {}; }
    },
    {
      name:  'values',
      type:  'Object',
      help:  'Values',
      factory: function() { return []; }
    }
  ],

  methods: {
    reduce: function(other) {
      // TODO:
    },
    reduceI: function(other) {
      // TODO:
    },
    /*
      pipe: function(sink) {
      for ( key in this.groups ) {
      sink.push([key, this.groups[key].toString()]);
      }
      return sink;
      },*/
    select: function(sink, options) {
      var self = this;
      this.values.select({put: function(o) {
        sink.put(o);
        var key = self.arg1.f(o);
        var a = o.children;
        if ( a ) for ( var i = 0 ; i < a.length ; i++ ) sink.put(a[i]);
      }}, options);
      return aconstant(sink);
    },
    putKeyValue_: function(key, value) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];

      if ( ! group ) {
        group = value.exprClone();
        if ( this.expanded[key] ) group.children = [];
        this.groups[key] = group;
        group.count = 1;
        this.values.push(group);
      } else {
        group.count++;
      }

      if ( group.children ) group.children.push(obj);
    },
    put: function(obj) {
      var key = this.arg1.f(obj);

      if ( Array.isArray(key) ) {
        for ( var i = 0 ; i < key.length ; i++ ) this.putKeyValue_(key[i], obj);
      } else {
        this.putKeyValue_(key, obj);
      }
    },
    where: function(query) {
      return (this.Y || X).FilteredDAO_.create({query: query, delegate: this});
      //return filteredDAO(query, this);
    },
    limit: function(count) {
      return (this.Y || X).LimitedDAO_.create({count:count, delegate:this});
    },
    skip: function(skip) {
      return (this.Y || X).SkipDAO_.create({skip:skip, delegate:this});
      //return skipDAO(skip, this);
    },
    orderBy: function() {
      return (this.Y || X).OrderedDAO_.create({ comparator: arguments.length == 1 ? arguments[0] : argsToArray(arguments), delegate: this });
    },
    listen: function() {},
    unlisten: function() {},
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.groups; },
    deepClone: function() {
      return this;
    }
  }
});
