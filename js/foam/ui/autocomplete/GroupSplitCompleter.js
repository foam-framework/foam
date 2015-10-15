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
  package: 'foam.ui.autocomplete',
  name: 'GroupSplitCompleter',
  extends: 'foam.ui.autocomplete.GroupCompleter',
  requires: [
    'MDAO',
    'foam.mlang.CannedQuery',
  ],
  properties: [
    {
      name: 'split',
    },
    {
      name: 'dao',
      adapt: function(old, nu) {
        if (Array.isArray(nu)) {
          var dao = this.MDAO.create({ model: this.CannedQuery });
          for (var i = 0; i < nu.length; i++) {
            var parts = nu[i].split(this.split);
            for (var j = 0; j < parts.length; j++) {
              var str = parts[j].trim();
              if (!str) continue;
              dao.put(this.CannedQuery.create({
                id: '' + str,
                label: '' + str,
                expression: str
              }));
            }
          }
          return dao;
        } else {
          return nu;
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
      this.autocompleteDAO = partial ? this.dao.where(CONTAINS_IC(
          this.CannedQuery.LABEL, partial)) : this.dao;
    },
    function f(obj) {
      return obj.expression;
    },
  ],
});
