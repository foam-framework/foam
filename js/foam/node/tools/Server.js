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
  package: 'foam.node.tools',
  name: 'Server',
  requires: [
    'foam.node.server.NodeServer',
    'foam.node.server.StaticFileHandler',
    'foam.node.server.FileHandler'
  ],
  properties: [
    {
      model_: 'IntProperty',
      name: 'port',
      adapt: function(_, v) {
        if ( typeof v === "string" ) return parseInt(v);
        return v;
      },
      defaultValue: 8080
    },
    {
      model_: 'StringProperty',
      name: 'filepath'
    },
    {
      name: 'server',
      factory: function() {
        console.log("boot dir is: ", global.FOAM_BOOT_DIR);

        return this.NodeServer.create();
      }
    }
  ],
  methods: [
    function execute() {
      this.configure();
      this.server.launch();
    },
    function configure() {
      this.server.port = this.port;
      this.server.handlers = [
        this.StaticFileHandler.create({
          dir: global.FOAM_BOOT_DIR,
          prefix: '/core/'
        }),
        this.StaticFileHandler.create({
          dir: global.FOAM_BOOT_DIR + '/../demos/',
          prefix: '/demos/'
        }),
        this.StaticFileHandler.create({
          dir: global.FOAM_BOOT_DIR + '/../apps/',
          prefix: '/apps/'
        }),
        this.StaticFileHandler.create({
          dir: global.FOAM_BOOT_DIR + '/../js/',
          prefix: '/js/'
        }),
	this.FileHandler.create({
	  pathname: '/index.html',
	  file: global.FOAM_BOOT_DIR + '/../index.html'
	}),
	this.FileHandler.create({
	  pathname: '/index.js',
	  file: global.FOAM_BOOT_DIR + '/../index.js'
	})
      ];
    }
  ]
});
