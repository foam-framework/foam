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

CLASS({
  name: 'OAuth2',
  label: 'OAuth 2.0',

  properties: [
    {
      name: 'accessToken',
      help: 'Token used to authenticate requests.'
    },
    {
      name: 'clientId',
      required: true,
      transient: true
    },
    {
      name: 'clientSecret',
      required: true,
      transient: true
    },
    {
      model_: 'StringArrayProperty',
      name: 'scopes',
      required: true,
      transient: true
    },
    {
      model_: 'URLProperty',
      name: 'endpoint',
      defaultValue: "https://accounts.google.com/o/oauth2/"
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.refresh_ = amerged(this.refreshNow_.bind(this));
    },

    refreshNow_: function(){},

    refresh: function(ret, opt_forceInteractive) {
      return this.refresh_(ret, opt_forceInteractive);
    },

    setJsonpFuture: function(X, future) {
      var agent = this;
      future.set((function() {
        var factory = X.OAuthXhrFactory.create({
          authAgent: agent,
          responseType: "json"
        });

        return function(url, params, opt_method, opt_payload) {
          return function(ret) {
            var xhr = factory.make();
            xhr.responseType = "json";
            return xhr.asend(ret,
                             opt_method ? opt_method : "GET",
                             url + (params ? '?' + params.join('&') : ''),
                             opt_payload);
          };
        };
      })());
    }
  }
});

function deferJsonP(X) {
  var future = afuture();
  X.ajsonp = function() {
    var args = arguments;
    return function(ret) {
      future.get(function(f) {
        f.apply(undefined, args)(ret);
      });
    };
  };

  return future;
}

CLASS({
  name: 'OAuth2WebClient',
  help: 'Strategy for OAuth2 when running as a web page.',

  extendsModel: 'OAuth2',

  methods: {
    refreshNow_: function(ret, opt_forceInteractive) {
      var self = this;
      var w;
      var cb = wrapJsonpCallback(function(code) {
        self.accessToken = code;
        try {
          ret(code);
        } finally {
          w && w.close();
        }
      }, true /* nonce */);

      var path = location.pathname;
      var returnPath = location.origin +
        location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/oauth2callback.html';

      var queryparams = [
        '?response_type=token',
        'client_id=' + encodeURIComponent(this.clientId),
        'redirect_uri=' + encodeURIComponent(returnPath),
        'scope=' + encodeURIComponent(this.scopes.join(' ')),
        'state=' + cb.id,
        'approval_prompt=' + (opt_forceInteractive ? 'force' : 'auto')
      ];

      w = window.open(this.endpoint + "auth" + queryparams.join('&'));
    }
  }
});

CLASS({
  name: 'OAuth2ChromeApp',
  help: 'Strategy for OAuth2 when running as a Chrome App',

  extendsModel: 'OAuth2',

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

CLASS({
  name: 'OAuth2ChromeIdentity',
  extendsModel: 'OAuth2',
  help: 'OAuth2 strategy that uses the Chrome identity API',
  methods: {
    refreshNow_: function(ret) {
      var self = this;
      chrome.identity.getAuthToken({
        interactive: true
      }, function(token) {
        self.accessToken = token;
        ret(self.accessToken);
      });
    }
  }
});

CLASS({
  name: 'OAuth2Redirect',
  extendsModel: 'OAuth2',
  help: 'OAuth2 strategy that uses the redirect.',
  imports: [
    'window',
    'location',
    'setTimeout'
  ],
  properties: [
    {
      name: 'redirects',
      transient: true,
      defaultValue: 0
    }
  ],
  constant: {
    REDIRECTS_TIMEOUT: 30000
  },
  methods: {
    init: function(args) {
      this.loadState_();
      var self = this;

      this.setTimeout(function() {
        self.redirects = 0;
      }, this.REDIRECTS_TIMEOUT);

      this.loadToken_();
      this.SUPER(args);
    },
    loadState_: function() {
      var state = this.location.hash.match(/state=([^&]*)/);
      state = state && state[1];
      if ( state ) this.redirects = parseInt(state);
      return state;
    },
    loadToken_: function() {
      var token = this.location.hash.match(/token=([^&]*)/);
      token = token && token[1];
      if ( token ) this.accessToken = token;
      return token;
    },
    refreshNow_: function(ret) {
      if ( this.redirects < 2 ) {
        this.redirects += 1;
        var redirect =
          this.location.protocol + '//' +
          this.location.host +
          this.location.pathname +
          this.location.search;

        var params = [
          'response_type=token',
          'client_id=' + encodeURIComponent(this.clientId),
          'redirect_uri=' + encodeURIComponent(redirect),
          'scope=' + encodeURIComponent(this.scopes.join(' ')),
          'state=' + this.redirects
        ];
        this.window.location = this.endpoint + 'auth?' + params.join('&');
        return;
      } else {
        // TODO: Handle permanent auth failure detected by repeated redirect
        // attempts.
        console.error("Failed to authenticated after ", this.redirects, "attempts.");
      }
    },
    setJsonpFuture: function(X, future) {
      var agent = this;
      future.set(function(url, params) {
        var tries = 0;
        params = params.clone();
        params.push('access_token=' + encodeURIComponent(agent.accessToken));
        return function(ret) {
          function callback(data)  {
            if ( data === null ) {
              tries++;
              if ( tries == 3 ) ret(null);
              else {
                agent.refresh(function(token) {
                  params[params.length - 1] = 'access_token=' +
                    encodeURIComponent(token);
                  ajsonp(url, params)(callback)
                });
              }
            } else {
              ret(data);
            }
          }
          ajsonp(url, params)(callback);
        }
      });
    }
  }
});

CLASS({
  name: 'OAuth2RedirectWithServer',
  extendsModel: 'OAuth2',
  documentation: 'OAuth2 strategy that redirects the whole page. Uses the ' +
      'web server flow, so you need a server. Expects to find the access ' +
      'access token in LocalStorage, under the key "__foam_oauth_token". If ' +
      'it fails to find the token, it will perform the redirect.',

  methods: {
    refreshNow_: function(ret) {
      var token = this.X.window.localStorage.getItem('__foam_oauth_token');
      if ( token ) {
        this.accessToken = token;
        ret(token);
      } else {
        var returnPath = location.origin +
          location.pathname.substring(0, location.pathname.lastIndexOf('/')) +
              '/oauth2callback.html';

        var params = [
          'response_type=code',
          'client_id=' + encodeURIComponent(this.clientId),
          'redirect_uri=' + encodeURIComponent(returnPath),
          'scope=' + encodeURIComponent(this.scopes.join(' '))
        ];
        this.X.window.location = this.endpoint + 'auth?' + params.join('&');
      }
    }
  }
});

// TODO: Register model for model, or fix the facade.
if ( window.cordova || window.PhoneGap || window.phonegap) {
  var EasyOAuth2 = OAuth2ChromeIdentity
} else if ( window.chrome && window.chrome.runtime && window.chrome.runtime.id ) {
  EasyOAuth2 = OAuth2ChromeApp;
} else {
  EasyOAuth2 = OAuth2WebClient;
}
