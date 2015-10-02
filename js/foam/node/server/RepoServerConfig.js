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
  package: 'foam.node.server',
  name: 'RepoServerConfig',
  extendsModel: 'foam.node.server.ServerConfig',

  documentation: 'Subclass of $$DOC{ref:"foam.node.server.ServerConfig"} ' +
      'that expects to be run from the root of the FOAM repo, and will serve ' +
      'up FOAM\'s core and library as well as any DAOs specified.',

  // TODO(braden): This server might as well have a ModelDAO instead of serving
  // FOAM's library.

  properties: [
    {
      name: 'port',
      defaultValue: 8000
    },
    {
      name: 'staticDirs',
      factory: function() {
        return ['apps', 'core', 'demos', 'js'];
      }
    },
    {
      name: 'staticFiles',
      factory: function() {
        return [
          ['/index.html', global.FOAM_BOOT_DIR + '/../index.html'],
          ['/index.js', global.FOAM_BOOT_DIR + '/../index.js']
        ];
      }
    },
  ]
});
