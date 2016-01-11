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
  package: 'foam.dao',
  name: 'EasyClientDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'XHR',
    'foam.core.dao.ClientDAO',
    'foam.core.dao.WebSocketDAO',
    'foam.dao.FutureDAO',
    'foam.dao.LoggingDAO',
    'foam.messaging.WebSocket',
    'foam.oauth2.GoogleSignIn'
  ],
  imports: [
    'document',
  ],
  properties: [
    {
      name: 'serverUri',
      factory: function() {
        return this.document.location.origin + '/api';
      }
    },
    {
      name: 'model'
    },
    {
      name: 'subject',
      defaultValueFn: function() { return this.model.id + 'DAO'; }
    },
    {
      name: 'googleAuth',
      documentation: 'Set this to true to enable Google authentication for ' +
          'this DAO.',
      defaultValue: false,
      postSet: function(old, nu) {
        if (nu) {
          this.googleSignIn_ = this.GoogleSignIn.create();
        }
      },
    },
    {
      name: 'googleSignIn_',
    },
    {
      type: 'Boolean',
      name: 'sockets',
      defaultValue: false
    },
    {
      name: 'reconnectPeriod',
      defaultValue: 0
    },
    {
      type: 'Boolean',
      name: 'logging',
      defaultValue: false,
      documentation: "Enable logging on the $$DOC{ref:'DAO'}."
    },
    {
      name: 'delegate',
      factory: function() {
        var dao = this.logging ? this.LoggingDAO.create(null, this.Y) :
            this.X.lookup('foam.dao.ProxyDAO').create(null, this.Y);
        if ( this.sockets ) {
          var uri = this.serverUri.replace(/^https/, "wss").replace(/^http/, "ws");

          var socket = this.WebSocket.create({
            uri: uri,
            reconnectPeriod: this.reconnectPeriod
          });

          var future = afuture();
          socket.subscribe(socket.ON_CONNECT, EventService.oneTime(function() {
            dao.delegate = this.WebSocketDAO.create({
              uri: this.serverUri,
              subject: this.subject,
              model: this.model,
              socket: socket
            }, this.Y);
            future.set(dao);
          }.bind(this)));

          return this.FutureDAO.create({
            future: future.get
          });
        }

        dao.delegate = this.ClientDAO.create({
	  asend: this.asend.bind(this),
	  model: this.model,
          subject: this.subject
	}, this.Y);
	return dao;
      }
    }
  ],
  methods: [
    function asend(ret, data) {
      var json = JSONUtil.where(function(prop, obj) {
	if ( Property.isInstance(obj) &&
	     prop.name !== 'name' &&
	     prop.name !== 'modelId' ) {
	  return false;
	}
	return true;
      });

      var auth = this.googleAuth ?
          this.googleSignIn_.alogin.bind(this.googleSignIn_) :
          aconstant(undefined);

      aseq(
        auth,
	function(ret) {
	  var xhr = this.XHR.create();
          if (this.googleAuth) xhr.addDecorator(this.googleSignIn_);
	  xhr.asend(ret, this.serverUri, json.stringify(data), 'POST');
	}.bind(this),
	function(ret, resp, _, success) {
	  if ( ! success ) {
	    ret(null);
	    return;
	  }
          // TODO(braden): This is fine in built non-Chrome apps, but would fail
          // in a built Chrome app. The model loader that defines IN_CHROME_APP
          // and friends is not used for built apps, so this check will always
          // fail in a built app.
	  if ( window.IN_CHROME_APP && IN_CHROME_APP() ) {
	    aeval("(" + resp + ")")(function(data) {
              JSONUtil.amapToObj(ret, this.X, data);
	    }.bind(this));
	    return;
	  }

          JSONUtil.aparse(ret, this.X, resp);
	}
      )(ret);
    }
  ]
});
