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
  package: 'com.google.mail',
  name: 'Sync',
  extends: 'foam.core.dao.Sync',
  requires: [
    'foam.lib.email.EMail'
  ],
  methods: {
    purge: function(ret, remoteLocal) {
      // Drafts that were created and sent from the client with no sync in
      // between, do not get marked as deleted.  However if the client version
      // is old and the draft is marked as sent, then it is no longer needed.
      var self = this;
      this.SUPER(function(purged) {
        this.local
          .where(AND(LTE(this.localVersionProp, remoteLocal),
                     EQ(this.EMail.MESSAGE_SENT, true),
                     EQ(this.EMail.LABELS, 'DRAFT')))
          .removeAll(purged)(ret);
      }.bind(this), remoteLocal);
    }
  }
});
