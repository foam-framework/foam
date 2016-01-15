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
  package: 'com.chrome.apis',
  name: 'Experiment',
  requires: [
    'com.chrome.apis.ApiKey'
  ],
  imports: [
    'apiKeyDAO',
  ],
  properties: [
    {
      name: 'id',
      visibility: 'hidden'
    },
    {
      name: 'name'
    },
    {
      name: 'owner',
      type: 'Reference',
      subType: 'com.chrome.apis.User',
      toPropertyE: function(X) { return X.lookup("foam.u2.TextField").create(null, X); }
    },
    {
      name: 'frozen',
      type: 'Boolean',
      visibility: 'rw',
      defaultValue: false
    },
    {
      name: 'ended',
      type: 'Boolean',
      visibility: 'hidden',
      defaultValue: false
    }
  ],
  actions: [
    {
      name: 'cancel',
      help: 'Cancel the experiment.  Revokes all keys and disables creation of new keys',
      code: function() {
        this.frozen = true;
        this.revokeAllKeys();
        this.ended = true;
      }
    },
    {
      name: 'revokeAllKeys',
      help: 'Revokes all existing API keys for this experiment.',
      code: function() {
        this.apiKeyDAO
          .where(EQ(this.ID, this.ApiKey.EXPERIMENT))
          .update(SET(this.ApiKey.REVOKED, true));
      }
    },
  ]
});
