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
  package: 'foam.dao.auth',
  name: 'AdminOnlyAuthorizer',
  imports: [
    'accountDAO'
  ],
  methods: [
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
          ret(false);
        }.bind(this)
      });
    },
    function massageForPut(ret, X, old, obj) {
      this.isAdmin(function(admin) {
        ret(admin ? obj : undefined);
      })
    },
    function shouldAllowRemove(ret, X, obj) {
      this.isAdmin(ret, X);
    },
    function massageForRead(ret, X, obj) {
      this.isAdmin(ret, X);
    },
    function decorateForSelect(ret, X, dao) {
      this.isAdmin(function(admin) {
        ret(admin ? dao : dao.where(FALSE));
      });
    }
  ]
});
