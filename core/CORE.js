/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

MODEL({
  name: 'Application',
  ids: ['name'],
  properties: [
    { model_: 'StringProperty', name: 'name' },
    { model_: 'IntProperty', name: 'version' },
    { model_: 'StringProperty', name: 'chromeAppVersion' }
  ]
});

// Builds a context with the basic level services installed for a given app.
function bootCORE(app) {
  var Y = this.__ctx__.sub({
    DAOVersionDAO: IDBDAO.create({ model: DAOVersion }),
    App: app
  }, app.name + ' CONTEXT');
  return Y;
}
