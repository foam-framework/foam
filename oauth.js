/*
 * Copyright 2013 Google Inc. All Rights Reserved.
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

var OAuth2 = FOAM.create({
  model_: 'Model',

  name: 'OAuth2',
  label: 'OAuth 2.0',


  properties: [
    {
      name: 'token'
    },
    {
      name: 'clientid',
      required: true
    },
    {
      name: 'scope',
      required: true
    }
  ],

  methods: {
    authenticate: function() {
      var callbackid = Math.floor(Math.random() * 1000000);
      var self = this;
      window['__oauth_' + callbackid] = function(result) {
        delete window['__oauth_' + callbackid];
        self.token = result.token;
      };

      var uri = "https://accounts.google.com/o/oauth2/auth?";
      var queryparams = [
        'response_type=token',
        'client_id=' + encodeURIComponent(this.clientid),
        'redirect_uri=http://localhost:8000/oauth.html',
        'scope=' + encodeURIComponent(this.scope),
        'state=' + encodeURIComponent(callbackid)
      ];
      uri += queryparams.join('&');
      var w = window.open(uri);
    }
  }
});
