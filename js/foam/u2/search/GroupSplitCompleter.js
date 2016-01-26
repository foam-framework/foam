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
  name: 'GroupSplitCompleter',
  extends: 'foam.u2.search.Autocompleter',
  requires: [
    'MDAO',
    'foam.mlang.CannedQuery',
  ],

  documentation: 'Expects $$DOC{ref:".dao"} to be an array of strings, ' +
      'the group names. Splits those groups by the $$DOC{ref:".split"} and ' +
      'then autocompletes on the parts.',

  properties: [
    {
      name: 'split',
      documentation: 'The field on which to split each group.',
    },
    'mdao',
  ],

  methods: [
    function onDAOUpdate() {
      var dao = this.MDAO.create({ model: this.CannedQuery });
      for (var i = 0; i < this.dao.length; i++) {
        var parts = this.dao[i].split(this.split);
        for (var j = 0; j < parts.length; j++) {
          var str = parts[j].trim();
          if (!str) continue;
          dao.put(this.CannedQuery.create({
            id: '' + str,
            label: '' + str,
            expression: str,
          }));
        }
      }

      this.mdao = dao;
      this.onUpdate();
    },

    function onUpdate() {
      this.filteredDAO = this.partial ?
          this.mdao.where(CONTAINS_IC(this.CannedQuery.LABEL, this.partial)) :
          this.mdao;
    },
  ]
});
