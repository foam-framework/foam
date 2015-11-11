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
  name: 'Handler',
  documentation: 'Abstract Handler class. handle() returns true if handled, ' +
    'false if the server should keep looking.',

  imports: [
    'log as log_',
    'warn as warn_',
    'error as error_'
  ],

  properties: [
    {
      name: 'logLevel',
      defaultValue: 3,
      documentation: '0 = none, 1 = errors, 2 = warnings, 3 = normal logging, 4 = verbose'
    }
  ],
  constants: {
    LOG_TITLE: 'Default'
  },

  methods: {
    handle: function() {
      this.warn_('Abstract handle call');
      return false;
    },
    send: function(res, status, body) {
      res.statusCode = status;
      res.write(body, 'utf8');
      res.end();
    },
    sendJSON: function(res, status, json) {
      this.send(res, status, JSON.stringify(json));
    },
    mkLogMessage_: function(level, msg) {
      return '[' + (new Date()).toISOString() + '] (' + level + ') [' + this.LOG_TITLE + ']  ' + msg;
    },
    log: function(msg) {
      if ( this.logLevel < 3 ) return;
      this.log_(this.mkLogMessage_('II', msg));
    },
    warn: function(msg) {
      if ( this.logLevel < 2 ) return;
      this.warn_(this.mkLogMessage_('WW', msg));
    },
    error: function(msg) {
      if ( this.logLevel < 1 ) return;
      this.error_(this.mkLogMessage_('EE', msg));
    },
    verbose: function(msg) {
      if ( this.logLevel < 4 ) return;
      this.log_(this.mkLogMessage_('VV', msg));
    }
  }
});
