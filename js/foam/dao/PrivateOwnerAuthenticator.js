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
  name: 'PrivateOwnerAuthenticator',
  implements: ['foam.dao.Authenticator'],

  documentation: function() {/*
    <p>$$DOC{ref:'foam.dao.Authenticator'} for the common case where each user
    of the service owns their own data. An $$DOC{ref:'foam.dao.AuthenticatedDAO'}
    backed by this $$DOC{ref:'foam.dao.Authenticator'} presents a view of the
    world as though only this user's data exists.</p>
  */},

  properties: [
    {
      name: 'ownerProp',
    },
  ],

  methods: [
    function massageForPut(ret, principal, old, nu) {
      // If old exists and old.owner != principal, fail: trying to write someone
      // else's data.
      if (old && NEQ(this.ownerProp, principal).f(old)) {
        ret(null);
        return;
      }

      // Now either old exists but is owned by me, or this is a new put.
      // Either way, clone nu and set its owner to the principal.
      var clone = nu.clone();
      clone[this.ownerProp.name] = principal;
      ret(clone);
    },
    function massageForRead(ret, principal, obj) {
      var mine = EQ(this.ownerProp, principal).f(obj);
      if (mine) {
        ret(obj);
      } else {
        ret(null);
      }
    },
    function shouldAllowRemove(ret, principal, obj) {
      if (obj) {
        ret(EQ(this.ownerProp, principal).f(obj));
      } else {
        ret(false);
      }
    },
    function decorateForSelect(ret, principal, dao) {
      ret(dao.where(EQ(this.ownerProp, principal)));
    },
  ]
});
