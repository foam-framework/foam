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
  package: 'foam.node.handlers',
  name: 'DAOHandler',
  requires: [
    'foam.node.ws.WebSocket'
  ],
  properties: [
    'path',
    {
      name: 'crypto',
      factory: function() { return require('crypto'); }
    },
    {
      name: 'daoMap',
      factory: function() { return {}; }
    },
    {
      type: 'Function',
      name: 'stringify',
      factory: function() {
        var jsonUtil = JSONUtil.compact.where(NOT_TRANSIENT);
        return jsonUtil.stringify.bind(jsonUtil);
      }
    },
  ],
  imports: [
    'log',
    'error'
  ],
  methods: [
    function getDAO(subject) {
      return this.daoMap[subject];
    },
    function upgrade(req, socket, data) {
      if ( req.url != this.path ) return false;

      var key = req.headers['sec-websocket-key'];
      key += '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

      var hash = this.crypto.createHash('SHA1');
      hash.update(key);
      hash = hash.digest('base64');

      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
          'Upgrade: websocket\r\n' +
          'Connection: upgrade\r\n' +
          'Sec-WebSocket-Accept: ' + hash + '\r\n\r\n');

      var ws = this.WebSocket.create({
        socket: socket
      });

      var stringify = this.stringify;
      ws.subscribe(ws.ON_MESSAGE, function(_, _, message) {
        try {
          var envelope = JSONUtil.mapToObj(this.Y, JSON.parse(message));
          // TODO (adamvy): USe JSONParser
          // var msg = JSONUtil.mapToObj(this.Y, JSONParser.parseString(message, JSONParser.obj));
        } catch(e) {
          console.error("Error parsing message", e)
          ws.close();
          return;
        }
        var msgid = envelope.msgid;
        var msg = envelope.msg;

        var subX = this.Y;
        if (envelope['x-foam-auth'])
          subX = subX.sub({ authHeader: envelope['x-foam-auth'] });

        if ( msg.method == 'listen' ) {
          var dao = this.getDAO(msg.subject);

          if ( ! dao ) {
            ws.send(JSON.stringify({ msgid: msgid, msg: { error: 'No dao found.' } }));
            return;
          }

          var options = msg.params ? msg.params[1] : undefined;

          dao.listen({
            put: function(o) {
              ws.send(stringify({
                msg: {
                  notify: ["put", o]
                }
              }));
            },
            remove: function(o) {
              ws.send(stringify({
                msg: {
                  notify: ["remove",o]
                }
              }));
            },
            reset: function() {
              ws.send(JSON.stringify({
                msg: {
                  notify: ["reset"]
                }
              }));
            }
          }, options, subX);

          ws.send(JSON.stringify({
            msgid: msgid,
            msg: true
          }));
        } else {
          this.handleDAORequest(msg, {
            put: function(m) {
              ws.send(stringify({
                msgid: msgid,
                msg: m
              }));
            },
            error: function(msg) {
              ws.send(stringify({
                msgid: msgid,
                msg: { error: msg }
              }));
            }
          }, subX);
        }
      }.bind(this));

      return true;
    },
    function handleDAORequest(msg, resp, X) {
      var dao = this.getDAO(msg.subject);
      if ( ! dao ) {
        resp.error && resp.error('no such dao');
        return;
      }

      switch ( msg.method ) {
      case 'select':
      case 'removeAll':
        dao[msg.method].apply(dao, msg.params.concat(X))(function(sink) {
          resp.put && resp.put(sink);
        });
        break;
      case 'put':
      case 'remove':
      case 'find':
        var sink = {
          send: function(method, x) {
            var payload = {};
            payload[method] = x;
            resp.put && resp.put(payload);
          },
          put: function(x) { this.send('put', x) },
          remove: function(x) { this.send('remove', x) },
          error: function(x) { this.send('error', x); }
        };
        dao[msg.method](msg.params[0], sink, X);
        break;
      default:
        resp.error && resp.error("Unsupported dao method.");
      }
    },
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
        var subX = this.Y;
        if (req.headers && req.headers['x-foam-auth']) {
          subX = subX.sub({ authHeader: req.headers['x-foam-auth'] });
        }

        var msg = JSONUtil.mapToObj(this.Y, JSON.parse(body));
        // TODO (adamvy): Use FOAM's JSONParser
        // var msg = JSONUtil.mapToObj(this.Y, JSONParser.parseString(message, JSONParser.obj));
        var stringify = this.stringify;

        this.handleDAORequest(msg, {
          put: function(msg) {
            resp.statusCode = 200;
            resp.setHeader("Content-Type", "application/json");
            resp.write(stringify(msg));
            resp.end();
          },
          error: function(err) {
            resp.statusCode = 400;
            resp.setHeader("Content-Type", "application/json");
            resp.write(JSON.stringify({ error: err }));
            resp.end();
          }
        }, subX);
      }.bind(this));
      return true;
    }
  ]
});
