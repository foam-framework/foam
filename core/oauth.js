/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
FOAModel({
  name: 'OAuth2',
  label: 'OAuth 2.0',

  properties: [
    {
      name: 'accessToken',
      help: 'Token used to authenticate requests.'
    },
    {
      name: 'refreshToken',
      help: 'Token used to generate new access tokens.'
    },
    {
      name: 'authcode',
      help: 'Authorization code used to generate a new refresh token.'
    },
    {
      name: 'clientid',
      required: true
    },
    {
      name: 'clientsecret',
      required: true
    },
    {
      model_: 'StringArrayProperty',
      name: 'scopes',
      required: true
    },
    {
      model_: 'URLProperty',
      name: 'endpoint',
      defaultValue: "https://accounts.google.com/o/oauth2/"
    }
  ],

  methods: {
    updateAccessToken: function(ret) {
      var postdata = [
        'refresh_token=' + encodeURIComponent(this.refreshToken),
        'client_id=' + this.clientid,
        'client_secret=' + this.clientsecret,
        'grant_type=refresh_token'
      ];

      var xhr = new XMLHttpRequest();
      xhr.open("POST", this.endpoint + "token")
      xhr.responseType = "json";
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      var self = this;
      aseq(
        function(ret) {
          xhr.asend(ret, postdata.join('&'));
        },
        function(ret) {
          if ( xhr.status === 200 ) self.accessToken = xhr.response.access_token;

          ret && ret(xhr.status === 200 && self.accessToken)
        })(ret);
    },

    updateRefreshToken: function(ret) {
      var postdata = [
        'code=' + (this.authcode),
        'client_id=' + (this.clientid),
        'client_secret=' + (this.clientsecret),
        'grant_type=authorization_code',
        'redirect_uri=urn:ietf:wg:oauth:2.0:oob'
      ];

      var xhr = new XMLHttpRequest();
      xhr.open("POST", this.endpoint + "token");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.responseType = "json";
      var self = this;
      aseq(
        function(ret) {
          xhr.asend(ret, postdata.join('&'));
        },
        function(ret) {
          if ( xhr.status === 200 ) {
            self.accessToken = xhr.response.access_token;
            self.refreshToken = xhr.response.refresh_token;
          }

          ret && ret(xhr.status === 200 && self.accessToken);
        })(ret);
    },

    auth: function(ret) {
      var queryparams = [
        '?response_type=code',
        'client_id=' + encodeURIComponent(this.clientid),
        'redirect_uri=urn:ietf:wg:oauth:2.0:oob',
        'scope=' + encodeURIComponent(this.scopes.join(' '))
      ];


      var self = this;
      chrome.app.window.create(
        'empty.html', { width: 800, height: 600 },
        function(w) {
          var success = false;

          w.onClosed.addListener(function() {
            if ( ! success ) ret(false);
          });

          var window = w.contentWindow;
          var document = w.contentWindow.document;

          window.addEventListener('load', function() {
            var webview = document.createElement('webview');
            webview.style.width = '100%';
            webview.style.height = '100%';
            document.body.appendChild(webview);

            webview.addEventListener('contentload', function() {
              webview.executeScript({ code: 'window.document.title;' }, function(title) {
                if ( title[0] && title[0].startsWith('Success code=') ) {
                  self.authcode = title[0].substring(title[0].indexOf('=') + 1);
                  success = true;
                  w.close();
                  self.updateRefreshToken(ret);
                }
              });
            });

            webview.src = self.endpoint + "auth" + queryparams.join('&');
          });
        });
    },

    refresh: function(ret, opt_forceInteractive) {
      if ( opt_forceInteractive ) {
        this.auth(ret);
        return;
      }

      aseq(
        (function(ret) {
          this.updateAccessToken(ret)
        }).bind(this),
        (function(ret, result) {
          if ( ! result ) {
            this.auth(ret);
            return;
          }

          ret && ret(result);
        }).bind(this)
      )(ret);
    }
  }
});
