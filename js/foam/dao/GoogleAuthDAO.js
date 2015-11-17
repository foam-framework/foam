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
  name: 'GoogleAuthDAO',
  extends: 'foam.dao.ProxyDAO',
  imports: [
    'warn'
  ],

  documentation: function() {/*
    A DAO decorator that extracts an auth token from the context parameter and
    checks its validity as a Google OAuth/Google Sign-In token. If it
    successfully matches, it will set the "sub" claim (an app-specific, stable
    user ID for this Google account) as the "principal" on the context, for the
    use of the delegate (probably an AuthorizedDAO).
  */},

  constants: {
    // Clock skew tolerance for auth token creation/expiry timestamps is 5
    // minutes. That seems like a long time, but it was taken from Google's
    // official Node auth library, see:
    // https://github.com/google/google-auth-library-nodejs/blob/master/lib/auth/oauth2client.js#L90
    CLOCK_SKEW: 300,

    // URL for fetching Google's public keys.
    // These are fetched at startup. The HTTP cache headers are used to
    // determine when to fetch again.
    CERT_URL: 'https://www.googleapis.com/oauth2/v1/certs',
  },

  properties: [
    {
      name: 'clientId',
      required: true,
      documentation: 'Your app\'s Google client_id, from the Developer Console.'
    },
    {
      name: 'validTokenCache_',
      factory: function() {
        return {};
      }
    },
    {
      name: 'crypto',
      factory: function() {
        return require('crypto');
      }
    },
    {
      name: 'https',
      factory: function() {
        return require('https');
      }
    },
    {
      name: 'certificates_',
    },
    {
      name: 'certificatesExpiry_',
    },
    {
      name: 'certificatesListeners_',
    },
  ],

  methods: [
    function find(id, sink, opt_X) {
      this.augmentContext_(opt_X)(function(X) {
        this.delegate.find(id, sink, X);
      }.bind(this));
    },
    function put(obj, sink, opt_X) {
      this.augmentContext_(opt_X)(function(X) {
        this.delegate.put(obj, sink, X);
      }.bind(this));
    },
    function remove(id, sink, opt_X) {
      this.augmentContext_(opt_X)(function(X) {
        this.delegate.remove(id, sink, X);
      }.bind(this));
    },
    function select(sink, options, opt_X) {
      var self = this;
      return aseq(
        self.augmentContext_(opt_X),
        function(ret, X) {
          self.delegate.select(sink, options, X)(ret);
        }
      );
    },
    function removeAll(sink, options, opt_X) {
      var self = this;
      return aseq(
        self.augmentContext_(opt_X),
        function(ret, X) {
          self.delegate.removeAll(sink, options, X)(ret);
        }
      );
    },

    function augmentContext_(X) {
      if (!X || !X.authHeader) return aconstant(X);

      var token = X.authHeader;
      return aseq(
        this.getCertificates_.bind(this),
        function(ret, certs) {
          var response = this.verifyAuthToken_(certs, token);
          ret(response ? X.sub({ principal: response.sub, userInfo: response }) : X.sub({ principal: null, userInfo: {} }));
        }.bind(this)
      );
    },
    function getCertificates_(ret) {
      if (this.certificatesListeners_) {
        this.certificatesListeners_.push(ret);
      } else if (this.certificates_ && this.certificatesExpiry_ > new Date()) {
        // Certificates are loaded and still fresh, so return them.
        ret(this.certificates_);
      } else {
        // Fetch new certificates.
        this.certificatesListeners_ = [ret];
        var self = this;
        this.https.get(this.CERT_URL, function(res) {
          var body = '';
          res.on('data', function(d) { body += d; });
          res.on('end', function() {
            self.certificates_ = JSON.parse(body);
            // < Cache-Control: public, max-age=21115, must-revalidate,
            // no-transform
            //
            var cacheMatch = res.headers['cache-control'].match(/max-age=(\d+)/);
            self.certificatesExpiry_ = new Date(Date.now() + (+cacheMatch[1] * 1000));

            self.certificatesListeners_.forEach(function(l) {
              l(self.certificates_);
            });
            self.certificatesListeners_ = '';
          });
        }).on('error', function(e) {
          self.warn('Failed to fetch new Google public keys: ' + e);
        });
      }
    },
    function verifyAuthToken_(certs, jwt) {
      // Verifies that a Google auth token is valid. Returns the "sub", the
      // app-specific Google account ID for this user, or false on failure.
      // This token is a standard JWT signed by Google.
      var now = new Date().getTime() / 1000; // Epoch time in seconds.
      if (this.validTokenCache_[jwt]) {
        var obj = this.validTokenCache_[jwt];
        if (now < obj.exp + this.CLOCK_SKEW) {
          return obj;
        }
        delete this.validTokenCache_[jwt];
      }

      var segments = jwt.split('.');
      if (segments.length !== 3) {
        this.warn('Malformed auth token');
        return false;
      }

      var signed = segments[0] + '.' + segments[1];
      var signature = segments[2];

      var envelope, payload;
      try {
        envelope = JSON.parse(new Buffer(segments[0], 'base64').toString('utf-8'));
      } catch(err) { }
      if (!envelope) {
        this.warn('Could not parse auth token envelope');
        return false;
      }

      try {
        payload = JSON.parse(new Buffer(segments[1], 'base64').toString('utf-8'));
      } catch(err) { }
      if (!payload) {
        this.warn('Could not parse auth token payload');
        return false;
      }

      var pem = certs[envelope.kid];
      if (!pem) {
        this.warn('Unknown public key ID: ' + envelope.kid);
        return false;
      }
      var pemVerifier = this.crypto.createVerify('sha256');
      pemVerifier.update(signed);
      var verified = pemVerifier.verify(pem, signature, 'base64');

      if (!verified) {
        this.warn('Auth token verification failed');
        return false;
      }
      if (!payload.iat) {
        this.warn('Auth token invalid: contains no "iat" (issue time)');
        return false;
      }
      if (!payload.iat) {
        this.warn('Auth token invalid: contains no "exp" (expiry time)');
        return false;
      }

      var iat = parseInt(payload.iat, 10);
      var exp = parseInt(payload.exp, 10);

      // TODO(braden): Maybe check if the expiry date is too far in the future?
      if (now > exp + this.CLOCK_SKEW) {
        this.warn('Auth token invalid: expired');
        return false;
      }
      if (now < iat - this.CLOCK_SKEW) {
        this.warn('Auth token invalid: issued in the future');
        return false;
      }

      if (!(payload.iss === 'https://accounts.google.com' ||
          payload.iss === 'accounts.google.com')) {
        this.warn('Auth token invalid: not issued by accounts.google.com');
        return false;
      }

      if (!this.clientId) {
        this.warn('Cannot verify auth token: clientId is not set. ' +
            'Please set this value to your app\'s client_id.');
        return false;
      }

      if (payload.aud !== this.clientId) {
        this.warn('Auth token invalid: not issued to this app');
        return false;
      }

      // Token is valid! Cache it to avoid doing all this legwork again.
      this.validTokenCache_[jwt] = payload;
      return payload;
    },
  ]
});
