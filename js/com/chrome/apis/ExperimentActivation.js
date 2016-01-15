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
  name: 'ExperimentActivation',
  requires: [
    'com.chrome.apis.ApiKey'
  ],
  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'origin',
      type: 'Reference',
      subType: 'com.chrome.apis.Origin'
    },
    {
      name: 'experiment',
      type: 'Reference',
      subType: 'com.chrome.apis.Experiment'
    }
  ],
  relationships: [
    {
      name: 'apiKeys',
      relatedModel: 'com.chrome.apis.ApiKey',
      relatedProperty: 'experimentActivation'
    }
  ],
  actions: [
    {
      name: 'generateApiKey',
      code: function() {
        // TODO: Request new key from backend.
        this.apiKeys.removeAll();
        this.apiKeys.put(this.ApiKey.create({
          expires: new Date(Date.now() + 36000),
          experiment: this.experiment,
          apiName: 'CustomApiName-' + Math.floor(Math.random() * 100 ).toString(16)
        }));
      }
    }
  ]
});
