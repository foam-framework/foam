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
    'foam.oauth2.GoogleSignIn'
  ],
  properties: [
    {
      name: 'serverUri',
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
      model_: 'BooleanProperty',
      name: 'sockets',
      defaultValue: false
    },
    {
      name: 'reconnectPeriod',
      defaultValue: 0
    },
    {
      name: 'delegate',
      factory: function() {
        if ( this.sockets ) {
          return this.WebSocketDAO.create({
            uri: this.serverUri,
            model: this.model,
            reconnectPeriod: this.reconnectPeriod
          });
        }

	return this.ClientDAO.create({
	  asend: this.asend.bind(this),
	  model: this.model,
          subject: this.subject
	});
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
	  if ( IN_CHROME_APP() ) {
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
