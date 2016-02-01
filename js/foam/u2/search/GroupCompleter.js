/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.search',
  name: 'GroupCompleter',
  extends: 'foam.u2.search.Autocompleter',
  requires: [
    'MDAO',
    'foam.dao.ProxyDAO',
    'foam.mlang.CannedQuery',
  ],

  documentation: 'Expects $$DOC{ref:".groups"} to be an array of strings, ' +
      'the group names. Autocompletes on those names.',

  properties: [
    'groups',
    {
      name: 'dao',
      factory: function() {
        return this.ProxyDAO.create();
      }
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.groups$.addListener(this.onDAOUpdate.bind(this));
    },
    function onDAOUpdate() {
      var dao = this.MDAO.create({ model: this.CannedQuery });
      for (var i = 0; i < this.groups.length; i++) {
        var str = '' + this.groups[i];
        if (!str) continue;
        dao.put(this.CannedQuery.create({
          id: str,
          label: str,
          expression: this.groups[i]
        }));
      }
      this.dao.delegate = dao;
      this.onUpdate();
    },

    function onUpdate() {
      this.filteredDAO = this.partial ?
          this.dao.where(CONTAINS_IC(this.CannedQuery.LABEL, this.partial)) :
          this.dao;
    },
  ]
});
