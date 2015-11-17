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
  package: 'com.google.watlobby',
  name: 'AuthenticatedServer',
  requires: [
    'com.google.watlobby.Server',
    'foam.node.dao.JSONFileDAO',
    'foam.dao.GoogleAuthDAO',
    'foam.dao.auth.Account',
    'foam.dao.AuthorizedDAO',
  ],
  imports: [
    'exportDAO'
  ],
  properties: [
    {
      name: 'server',
      factory: function() { return this.Server.create(); }
    },
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    },
    {
      name: 'accountDAO',
      factory: function() {
        var dao = foam.dao.EasyDAO.create({
          daoType: this.JSONFileDAO.xbind({
            filename: global.FOAM_BOOT_DIR + '/../js/com/google/watlobby/accounts_dao.json'
          }),
          model: this.Account
        });
        return this.GoogleAuthDAO.create({
          delegate: this.AuthorizedDAO.create({
            delegate: dao,
            authorizer: this
          }),
          model: this.Account,
          clientId: '495935970762-bmf0no7rttrjnobccog7a4cbnj9irm17.apps.googleusercontent.com'
        });
      }
    },
    {
      name: 'topicDAO',
      factory: function() {
        return this.GoogleAuthDAO.create({
          delegate: this.AuthorizedDAO.create({
            delegate: this.server.topicDAO,
            authorizer: this
          }),
          model: this.server.topicDAO.model,
          clientId: '495935970762-bmf0no7rttrjnobccog7a4cbnj9irm17.apps.googleusercontent.com'
        });
        return dao;
      }
    }
  ],
  methods: [
    function execute() {
      this.exportDAO(this.topicDAO);
      this.exportDAO(this.accountDAO);
    },
    function isAdmin(ret, X) {
      if ( ! X.principal ) {
        ret(false);
        return;
      }

      this.accountDAO.find(X.principal, {
        put: function(o) {
          ret(o.level == "admin");
        },
        error: function() {
          // auto account creation.
          console.log("Auto adding account", X.email, X.principal);
          this.accountDAO.delegate.delegate.put(
            this.Account.create({
              id: X.principal,
              email: X.userInfo.email
            }));
          ret(false);
        }.bind(this)
      });
    },
    function massageForPut(ret, X, old, obj) {
      // Only put if admin.
      var self = this;
      aseq(
        function(ret) {
          self.isAdmin(ret, X);
        },
        function(ret, admin) {
          if ( ! admin ) {
            var result = old.deepClone();
            result.selected = obj.selected;
            result.dir = obj.dir;
            ret(result);
          } else {
            ret(obj);
          }
        })(ret);
    },
    function shouldAllowRemove(ret, X, obj) {
      // Only remove if admin
      this.isAdmin(ret, X);
    },
    function massageForRead(ret, X, obj) {
      // All data is public
      ret(obj);
    },
    function decorateForSelect(ret, X, dao) {
      // All data is public.
      ret(dao);
    }
  ]
});
