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
  name: 'OAuth2ChromeApp',
  package: 'foam.oauth2',
  help: 'Strategy for OAuth2 when running as a Chrome App',

  requires: [ 'XHR' ],

  extends: 'foam.oauth2.OAuth2',

  properties: [
    {
      name: 'refreshToken',
      help: 'Token used to generate new access tokens.'
    },
    {
      name: 'authCode',
      help: 'Authorization code used to generate a new refresh token.'
    }
  ],

  methods: {
    auth: function(ret) {
      var queryparams = [
        '?response_type=code',
        'client_id=' + encodeURIComponent(this.clientId),
        'redirect_uri=urn:ietf:wg:oauth:2.0:oob',
        'scope=' + encodeURIComponent(this.scopes.join(' '))
      ];

      var self = this;
      this.XHR.create({}, this.Y).asend(function(data, xhr, status) {
        if ( xhr.status === 0 ) {
          ret(false, new Error('OAuth: Failed to reach OAuth service'));
          return;
        }

        chrome.app.window.create(
            'empty.html', { width: 800, height: 600 },
            function(w) {
              var success = false;

              w.onClosed.addListener(function() {
                if ( ! success ) ret(false, new Error('OAuth: Access denied'));
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
                      self.authCode = title[0].substring(title[0].indexOf('=') + 1);
                      success = true;
                      w.close();
                      self.updateRefreshToken(ret);
                    }
                  });
                });

                webview.src = self.endpoint + "auth" + queryparams.join('&');
              });
            });
      }, this.endpoint);
    },
    updateRefreshToken: function(ret) {
      var postdata = [
        'code=' + encodeURIComponent(this.authCode),
        'client_id=' + encodeURIComponent(this.clientId),
        'client_secret=' + encodeURIComponent(this.clientSecret),
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

    updateAccessToken: function(ret) {
      var postdata = [
        'refresh_token=' + encodeURIComponent(this.refreshToken),
        'client_id=' + encodeURIComponent(this.clientId),
        'client_secret=' + encodeURIComponent(this.clientSecret),
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

    refreshNow_: function(ret, opt_forceInteractive) {
      if ( opt_forceInteractive ) {
        this.auth(ret);
        return;
      }

      aseq(
        (function(ret) {
          this.updateAccessToken(ret);
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
