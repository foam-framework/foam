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
    'ApiKeyDAO',
  ],
  properties: [
    {
      name: 'id'
    },
    {
      name: 'name'
    },
    {
      name: 'owner',
      type: 'Reference',
      subType: 'com.chrome.apis.User'
    },
    {
      name: 'frozen',
      type: 'Boolean',
      defaultValue: false
    },
    {
      name: 'ended',
      type: 'Boolean',
      defaultValue: false
    }
  ],
  actions: [
    {
      name: 'cancel',
      help: 'Cancel the experiment.  Revokes all keys and disables creation of new keys',
      code: function() {
        this.freeze();
        this.revokeAllKeys();
        this.ended = true;
      }
    },
    {
      name: 'freeze',
      help: 'Disables creation of new API keys for this experiment',
      code: function() {
        this.frozen = true;
      }
    },
    {
      name: 'revokeAllKeys',
      help: 'Revokes all existing API keys for this experiment.'
      code: function() {
        this.ApiKeyDAO
          .where(EQ(this.ID, this.nApiKey.EXPERIMENT))
          .update(SET(this.ApiKey.REVOKED, true));
      }
    },
  ]
});
