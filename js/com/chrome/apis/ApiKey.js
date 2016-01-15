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
  name: 'ApiKey',
  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'key',
      factory: function() {
        return createGUID();
      }
    },
    {
      name: 'apiName',
      type: 'String',
      help: 'The unique name that this API will be exposed as on the the page.'
    },
    {
      name: 'experimentActivation',
      type: 'Reference',
      subType: 'com.chrome.apis.ExperimentActivation',
      help: 'The specific Origin+Experiment pair that this key is active for'
    },
    {
      name: 'experiment',
      type: 'Reference',
      subType: 'com.chrome.apis.Experiment',
      help: 'The API that this API Key enables.',
      hidden: true
    },
    {
      name: 'expires',
      type: 'DateTime',
      help: 'The time when this API key expires.',
      hidden: true
    },
    {
      name: 'revoked',
      type: 'Boolean',
      defaultValue: false,
      help: 'Has the API key been revoked?'
    }
  ],
  actions: [
    {
      name: 'revoke',
      code: function() {
        this.revoked = true;
      }
    }
  ]
});
