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
      type: 'String',
      name: 'id'
    },
    {
      type: 'String',
      name: 'controller'
    },
    {
      type: 'Boolean',
      name: 'appcacheManifest',
      defaultValue: true
    },
    {
      type: 'Boolean',
      name: 'includeFoamCSS',
      defaultValue: false
    },
    {
      type: 'String',
      name: 'icon'
    },
    {
      type: 'Boolean',
      name: 'precompileTemplates',
      defaultValue: true
    },
    {
      type: 'StringArray',
      name: 'resources'
    },
    {
      type: 'String',
      name: 'htmlFileName'
    },
    {
      type: 'StringArray',
      name: 'htmlHeaders',
      factory: function() { return [
        '<meta charset="utf-8"/>',
        '<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0"/>',
        '<meta name="mobile-web-app-capable" content="yes"/>'
      ]; }
    },
    {
      type: 'StringArray',
      name: 'coreFiles',
    },
    {
      type: 'StringArray',
      name: 'extraModels'
    },
    {
      type: 'StringArray',
      name: 'extraFiles'
    },
    {
      type: 'String',
      name: 'defaultView'
    },
    {
      type: 'StringArray',
      name: 'htmlHeaders'
    },
    {
      type: 'Boolean',
      name: 'appcache',
      defaultValue: false
    },
    {
      type: 'String',
      name: 'version'
    }
  ]
});
