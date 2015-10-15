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
  name: 'OAuth2RedirectWithServer',
  package: 'foam.oauth2',
  extends: 'foam.oauth2.OAuth2',
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
