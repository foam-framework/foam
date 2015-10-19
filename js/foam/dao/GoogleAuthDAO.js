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
    use of the delegate (probably an AuthenticatedDAO).
  */},

  constants: {
    // Clock skew tolerance for auth token creation/expiry timestamps is 5
    // minutes. That seems like a long time, but it was taken from Google's
    // official Node auth library, see:
    // https://github.com/google/google-auth-library-nodejs/blob/master/lib/auth/oauth2client.js#L90
    CLOCK_SKEW: 300,
    // Google's public keys for verifying auth tokens.
    CERTS: {
      '5fafa2017895d588e4695446533f4093c0e2a8cc': '-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIIK6ARM4DTSQIwDQYJKoZIhvcNAQEFBQAwNjE0MDIGA1UE\nAxMrZmVkZXJhdGVkLXNpZ25vbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTAe\nFw0xNTEwMTMwMzEzMzRaFw0xNTEwMTQxNjEzMzRaMDYxNDAyBgNVBAMTK2ZlZGVy\nYXRlZC1zaWdub24uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDL7gvnorwO9kO3TToJvOKYJh7eD/r5X0d0\nzKkafDpxVLGa2ZikJnEmkWVIxbzy3wGpqJphukc3bNw/aGSf5NYGi2G/ohDbjhm8\n/0QYcW1BeCRMrOXbRjERVnEGEwn/qU02/z7XUEuZPvDLT8dtxV8jr9HB7pieJy83\nmefSl2BzvuG7gC1xBLNkxdpqvD34ij/Z5JEnVQsUhiQTwyKhBaWCyu9oHBSTJDZM\njykvZ9IGWJiPfOd213QclmyTRN0mcubakIRlIKNqVCTuB9Y1z8gG/qLKzLn23xM7\nksG1ra5MBXbU1eRgArN/Z0Rf/TWmR3vAMBuPEtxhwd0IbhwWHU87AgMBAAGjODA2\nMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsG\nAQUFBwMCMA0GCSqGSIb3DQEBBQUAA4IBAQCcAh6MKkBe7F3MWB6tAZFpAy6Vu0wV\nH7UBPJJdSloSuvruh3rQIOlI3Hpk5JSpxPU9XU8eBJh6RlzfKbmmXiE+UeW2NtMC\n0IoRKvRN3lzlXWkgkaT8OMhVr0FzfG5jAAhJUxhhHqL9ZhczXC7m7MGz8UFuWGdu\ness7X8nSwj7TsjSE16EllR44V2pYQJy0Mr4DBAxGZ1Pf0Ir4URHZhJ35Jn+gU5o/\nPxSHtyOusKawNIUb2xMrlzsM7647S8R1JI6kk571ZPPkAEUKicTA46dijq/KlBGY\nAvLX3OewSLHdlbQ5uzPo1Zqanyddz5zDsR9RNa1eEnbIkT1C+WPdzzjp\n-----END CERTIFICATE-----\n',
      '47db449f1e27fda0db71d5777ea5cdc64352d5f3': '-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIITwjU8ORVNrUwDQYJKoZIhvcNAQEFBQAwNjE0MDIGA1UE\nAxMrZmVkZXJhdGVkLXNpZ25vbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTAe\nFw0xNTEwMTQwMjU4MzRaFw0xNTEwMTUxNTU4MzRaMDYxNDAyBgNVBAMTK2ZlZGVy\nYXRlZC1zaWdub24uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDF0sHOzYce06FPrJztkiqC9Yk4pqsBykR2\nI4C0X+3lIR4oKOmSqOIHaf6sPWPby5z0KSewH/2lzuUZnyQo586AdQeyEZ8Xd5h6\nfJDcqjgY8wFNmWA23Bpgku4nBi1R5zShqQ6nGf39wR0izafMb2ZYExwi68fORhJi\nkg4mMqvKXASgZQfHZlXQCaP6A/Cmj8Xqdwb4IcJWIWbccvKoQ8Rku3TK7KOWG/74\ng6gFr1efvOb2PYxwnv77a4iUX5bDzDAzgTUA4G/0iv54PP9GhRLhcvgdo6shaoXr\n1UnHwUgcWyGus7fOHyF+aEiJBhpKOjG6Nk+jKC0/Ay5VwuvbdwpJAgMBAAGjODA2\nMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsG\nAQUFBwMCMA0GCSqGSIb3DQEBBQUAA4IBAQAHJ+dd24vyp7fZ8E6dDSlC8SnhKht3\nQ718l52UgG97Dkphqh9f37wid+IN48tkwC3HTGOHNm2rro0FxL1yljZAwS/F0uDf\n1Q1KCZkpHaOMq46cuPf3OpmYRd8o4tXCrE3czcgNDozLepHpmhzz+mx6nanMB87n\n9XMdVHz1cadEP1itqlF1l0E0f/hJVFR6IBT5RGQ3vWcQnDItLlGtAzNd5l9ZGTzA\n/0QRzk96Yf22R51kAN+8aArpUH8v8HKuXmgV5FrNpOxEnfSLUDLwCCl932ZvaT01\nUR4d9P/gyAFhLqTMhBWiimdfP5eCUao8Bfu/YnZIyRRCkPd638yWA/gS\n-----END CERTIFICATE-----\n'
    }
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
  ],

  methods: [
    function find(id, sink, opt_X) {
      this.delegate.find(id, sink, this.augmentContext_(opt_X));
    },
    function put(obj, sink, opt_X) {
      this.delegate.put(obj, sink, this.augmentContext_(opt_X));
    },
    function remove(id, sink, opt_X) {
      this.delegate.remove(id, sink, this.augmentContext_(opt_X));
    },
    function select(sink, options, opt_X) {
      return this.delegate.select(sink, options, this.augmentContext_(opt_X));
    },
    function removeAll(sink, options, opt_X) {
      return this.delegate.removeAll(sink, options, this.augmentContext_(opt_X));
    },

    function augmentContext_(X) {
      if (!X || !X.cookies || !X.cookies.foamDAOAuth) return X;

      var token = X.cookies.foamDAOAuth;
      var response = this.verifyAuthToken_(token);
      return response ? X.sub({ principal: response }) : X;
    },
    function verifyAuthToken_(jwt) {
      // Verifies that a Google auth token is valid. Returns the "sub", the
      // app-specific Google account ID for this user, or false on failure.
      // This token is a standard JWT signed by Google.
      var now = new Date().getTime() / 1000; // Epoch time in seconds.
      if (this.validTokenCache_[jwt]) {
        var obj = this.validTokenCache_[jwt];
        if (now < obj.exp + this.CLOCK_SKEW) {
          return obj.sub;
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

      var pem = this.CERTS[envelope.kid];
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
      return payload.sub;
    },
  ]
});
