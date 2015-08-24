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
  package: 'foam.ui',
  name: 'QueryParserAutocompleter',
  requires: [
  ],

  properties: [
    {
      name: 'prop',
    },
    {
      name: 'model',
      defaultValueFn: function() {
        return this.prop.subType ? this.X.lookup(this.prop.subType) : this.dao.model;
      }
    },
    {
      name: 'parser',
      lazyFactory: function() {
        return QueryParserFactory(this.model, true /* opt_enableKeyword */);
      }
    },
    {
      name: 'projection_',
      lazyFactory: function() {
        var subKey = this.X.lookup(this.prop.subType + '.' + this.prop.subKey);
        return function(obj) { return subKey.f(obj); };
      }
    },
    {
      name: 'dao',
      lazyFactory: function() {
        if (this.prop && this.prop.subType) {
          var last = this.prop.subType.split('.').pop();
          var daoName = last.substring(0, 1).toLowerCase() + last.substring(1) + 'DAO';
          return this.X[daoName];
        } else {
          return this.X.dao;
        }
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'autocompleteDAO',
    },
  ],

  methods: [
    function autocomplete(partial) {
      var query = this.parser.parseString(partial);
      console.log('parsed "' + partial + '" into', query);
      var dao = this.dao.limit(4);
      if (query) {
        console.log(query.toMQL());
        dao = dao.where(query);
      }
      this.autocompleteDAO = dao;
    },
  ],

  listeners: [
    {
      name: 'f',
      code: function(obj) {
        return this.projection_(obj);
      }
    },
  ]
});
