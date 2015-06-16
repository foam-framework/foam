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
  package: 'foam.testing',
  name: 'TestServer',
  requires: [
    'foam.node.dao.XMLFileDAO',
    'foam.node.server.DAOHandler',
    'foam.node.server.NodeServer',
    'foam.node.server.StaticFileHandler',
  ],

  properties: [
    {
      name: 'path',
      factory: function() {
        return require('path');
      }
    },
    {
      name: 'testsDir',
      factory: function() {
        return this.path.resolve(FOAM_BOOT_DIR, '..', 'tests');
      }
    },
    {
      name: 'fileDAO',
      factory: function() {
        return this.XMLFileDAO.create({
          name: this.path.join(this.testsDir, 'FUNTests.xml'),
          model: Model
        });
      }
    },
    {
      name: 'port',
      factory: function() {
        return process.argv.length > 2 ? process.argv[2] : 8888;
      }
    },
    {
      name: 'server',
      factory: function() {
        var server = this.NodeServer.create({
          port: this.port,
          handlers: [
            this.DAOHandler.create({
              daoMap: { 'ModelDAO': this.fileDAO },
              path: '/api'
            }),
            this.StaticFileHandler.create({
              dir: this.testsDir,
              prefix: '/'
            })
          ]
        });
        server.launch();
        return server;
      }
    }
  ]
});
