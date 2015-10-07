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
  package: 'foam.build',
  name: 'WebApplication',

  properties: [
    {
      model_: 'StringProperty',
      name: 'id'
    },
    {
      model_: 'StringProperty',
      name: 'controller'
    },
    {
      model_: 'BooleanProperty',
      name: 'appcacheManifest',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'includeFoamCSS',
      defaultValue: false
    },
    {
      model_: 'StringProperty',
      name: 'icon'
    },
    {
      model_: 'BooleanProperty',
      name: 'precompileTemplates',
      defaultValue: true
    },
    {
      model_: 'StringArrayProperty',
      name: 'resources'
    },
    {
      model_: 'StringProperty',
      name: 'htmlFileName'
    },
    {
      model_: 'StringArrayProperty',
      name: 'htmlHeaders',
      factory: function() { return [
        '<meta charset="utf-8"/>',
        '<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0"/>',
        '<meta name="mobile-web-app-capable" content="yes"/>'
      ]; }
    },
    {
      model_: 'StringArrayProperty',
      name: 'coreFiles',
    },
    {
      model_: 'StringArrayProperty',
      name: 'extraModels'
    },
    {
      model_: 'StringArrayProperty',
      name: 'extraFiles'
    },
    {
      model_: 'StringProperty',
      name: 'defaultView'
    },
    {
      model_: 'StringArrayProperty',
      name: 'htmlHeaders'
    },
    {
      model_: 'BooleanProperty',
      name: 'appcache',
      defaultValue: false
    },
    {
      model_: 'StringProperty',
      name: 'version'
    }
  ]
});
