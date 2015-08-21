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
  name: 'NodeServer',
  properties: [
    {
      name: 'port',
      defaultValue: 80
    },
    {
      name: 'handlers',
      factory: function() { return []; }
    },
    {
      name: 'server',
      hidden: true,
      transient: true
    }
  ],

  methods: {
    launch: function() {
      this.server = require('http').createServer(this.onRequest);
      this.server.listen(this.port);
      console.log('Server running on port ' + this.port);
    },
    // This method allows NodeServer (and subclasses) to be launched directly
    // by tools/foam.js.
    execute: function() {
      this.launch();
    },
    attachHandler: function(h) {
      this.handlers.push(h);
    }
  },

  listeners: [
    {
      name: 'onRequest',
      code: function(req, res) {
        try {
          // Request received.
          // Iterate down the handlers, waiting for one to return true.
          for ( var i = 0 ; i < this.handlers.length ; i++ ) {
            var h = this.handlers[i];
            if ( h.handle(req, res) ) return;
          }

          // If nothing handled it, return a 404.
          res.statusCode = 404;
          res.write('Error 404: Nothing found');
          res.end();
        } catch(e) {
          res.statusCode = 500;
          res.write('Error 500: ' + e);
          res.end();
        }
      }
    }
  ]
});
