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
  name: 'OAuth2Redirect',
  package: 'foam.oauth2',
  extends: 'foam.oauth2.OAuth2',
  help: 'OAuth2 strategy that uses the redirect.',
  imports: [
    'window',
    'location',
    'setTimeout'
  ],
  properties: [
    {
      name: 'redirectURL',
      transient: true,
      defaultValueFn: function() {
        return this.location.protocol + '//' + this.location.host +
          this.location.pathname + this.location.search;
      }
    },
    {
      name: 'redirects',
      transient: true,
      defaultValue: 0,
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

      // Now that we've had a track at loading them from the address bar,
      // remove these fields from the hash.
      // Replacing the whole hash is heavy-handed, but any preexisting hash
      // values aren't preserved by the redirect anyway, so there's nothing
      // in the hash post-redirect but the OAuth details.
      this.location.hash = '';
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
      if ( this.accessToken ) {
        this.redirects += 1;
        ret(this.accessToken);
        return;
      }
      if ( this.redirects < 3 ) {
        this.redirects += 1;

        var params = [
          'response_type=token',
          'client_id=' + encodeURIComponent(this.clientId),
          'redirect_uri=' + encodeURIComponent(this.redirectURL),
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
    }
  }
});
