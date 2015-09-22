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
  name: 'DAOHandler',
  extendsModel: 'foam.node.server.Handler',
  properties: [
    {
      name: 'path',
      defaultValue: '/api'
    },
    {
      name: 'daoMap',
      lazyFactory: function() { return {}; }
    }
  ],
  constants: {
    LOG_TITLE: 'DAO'
  },

  methods: {
    handle: function(req, res) {
      if ( req.url !== this.path ) return false;
      var body = '';
      req.on('data', function(data) { body += data; });
      req.on('end', function() {
        var msg = JSONUtil.parse(this.X, body);
        var dao = this.daoMap[msg.subject];
        if (!dao) {
          this.sendJSON(res, 400, { error: 'No such DAO.' });
          this.warn('Requested DAO not found: ' + msg.subject);
          return;
        }

        // Now: we have various parameters in the message and need to parse them.
        // subject gives the DAO name.
        // method is one of: find, select, remove, put.
        // params (an array) is deserialized and passed to the said method.
        // context is an object containing any extra info. Currently unhandled.
        //   May eventually be useful for authentication, authorization, etc.
        var self = this;
        if (msg.method == 'select') {
          dao.select.apply(dao, msg.params)(function(sink) {
            self.log('select() success');
            self.send(res, 200, JSONUtil.stringify(sink));
          });
        } else if (msg.method == 'removeAll') {
          if (msg.params[0]) { // hasSink
            var arr = [];
            dao.removeAll({
              remove: arr.push,
              eof: function() {
                self.log('removeAll() success');
                self.send(res, 200, JSONUtil.stringify(arr));
              }
            }, msg.params[1]);
          } else {
            dao.removeAll({
              eof: function() {
                self.log('removeAll() success');
                self.send(res, 200, JSON.stringify('[]'));
              }
            }, msg.params[1]);
          }
        } else {
          // TODO: Handle cases where the argument is missing.
          dao[msg.method](msg.params[0], {
            put: function(x) {
              self.log(msg.method + '() success');
              self.send(res, 200, JSONUtil.stringify({ put: x }));
            },
            remove: function() {
              self.log('remove() success');
              self.sendJSON(res, 200, { put: 1 });
            },
            error: function(err) {
              self.warn('Error during ' + msg.method + ': ' + err);
              self.sendJSON(res, 200, { error: err });
            }
          });
        }
      }.bind(this));
      return true;
    }
  }
});
