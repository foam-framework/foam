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
  name: 'MigrationDAO',
  package: 'foam.core.dao',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.core.dao.MigrationRule',
    'foam.dao.FutureDAO',
    'foam.dao.DAOVersion'
  ],

  imports: [
    'daoVersionDao'
  ],

  properties: [
    {
      name: 'delegate'
    },
    {
      type: 'Array',
      subType: 'foam.core.dao.MigrationRule',
      name: 'rules'
    },
    {
      name: 'name'
    }
  ],

  methods: {
    init: function() {
      var dao = this.delegate;
      var future = afuture()
      this.delegate = this.FutureDAO.create({future: future.get});

      var self = this;
      var version;
      aseq(
        function(ret) {
          self.daoVersionDao.find(self.name, {
            put: function(c) {
              version = c;
              ret();
            },
            error: function() {
              version = self.DAOVersion.create({
                name: self.name,
                version: 0
              });
              ret();
            }
          });
        },
        function(ret) {
          function updateVersion(ret, v) {
            var c = version.clone();
            c.version = v;
            self.daoVersionDao.put(c, ret);
          }

          var rulesDAO = self.rules.dao;
          rulesDAO
            .where(AND(GT(self.MigrationRule.VERSION, version.version)))
            .select()(function(rules) {
              var seq = [];
              for ( var i = 0; i < rules.length; i++ ) {
                     (function(rule) {
                       seq.push(
                         aseq(
                           function(ret) {
                             rule.migration(ret, dao);
                           },
                           function(ret) {
                             updateVersion(ret, rule.version);
                           }));
                     })(self.rules[i]);
              }
              if ( seq.length > 0 ) aseq.apply(null, seq)(ret);
              else ret();
            });
        })(function() {
          future.set(dao);
        });
      this.SUPER();
    }
  }
});
