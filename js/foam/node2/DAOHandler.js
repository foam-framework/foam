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
  package: 'foam.node2',
  name: 'DAOHandler',
  properties: [
    'path',
    {
      name: 'daoMap',
      factory: function() { return {}; }
    }
  ],
  imports: [
    'log',
    'error'
  ],
  methods: [
    function handle(req, resp) {
      if ( req.url != this.path ) return false;
      var body = '';
      req.on('data', function(data) { body += data; });
      req.on('end', function() {
/*
  Secure parser, requires JSONParser improvements
        var map = JSONParser.parseString(body, JSONParser.obj);
        if ( ! map ) {
          this.error('Failed to parse request.', body)
        }
        var msg = JSONUtil.mapToObj(this.Y, map);
*/

        // Warning insecure parser.
        var msg = JSONUtil.parse(this.Y, body);

        var dao = this.daoMap[msg.subject];
        if ( ! dao ) {
          resp.statusCode = 400;
          resp.setHeader("Content-Type", "application/json");
          resp.write('{ "error": "No such DAO" }');
          resp.end();
          return;
        }

        switch ( msg.method ) {
        case 'select':
        case 'removeAll':
          dao[msg.method].apply(dao, msg.params)(function(sink) {
            resp.statusCode = 200;
            resp.setHeader("Content-Type", "application/x.foam-json");
            resp.write(JSONUtil.stringify(sink));
            resp.end();
          });
          break;
        case 'put':
        case 'remove':
        case 'find':
          var sink = {
            send: function(method, x) {
              resp.statusCode = 200;
              resp.setHeader("Content-Type", "application/x.foam-json");
              var payload = {};
              payload[method] = x;
              resp.write(JSONUtil.stringify(payload));
              resp.end();
            },
            put: function(x) { this.send('put', x) },
            remove: function(x) { this.send('remove', x) },
            error: function(x) { this.send('error', x); }
          };
          dao[msg.method](msg.params[0], sink);
          break;
        default:
          resp.statusCode = 400;
          resp.setHeader("Content-Type", "application/json");
          resp.write('{ "error": "Unsupported dao method." }');
          resp.end();
        }
      }.bind(this));
      return true;
    }
  ]
});
