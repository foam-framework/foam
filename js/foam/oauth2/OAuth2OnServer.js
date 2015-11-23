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
  package: 'foam.oauth2',
  name: 'OAuth2OnServer',
  extends: 'foam.oauth2.OAuth2',
  properties: [
    {
      name: 'refreshToken',
    },
    {
      name: 'https',
      factory: function() { return require("https"); }
    }
  ],
  imports: [
    'log',
    'error'
  ],
  methods: [
    function refreshNow_(ret) {
      var self = this;

      var req = this.https.request({
        hostname: "www.googleapis.com",
        port: 443,
        path: "/oauth2/v3/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }, function(response) {
        response.setEncoding('utf8');
        var data = "";
        response.on("data", function(c) { data += c; });
        response.on("end", function() {
          try {
            var payload = JSON.parse(data);
          } catch(e) {
            self.error(e);
            return;
          }

          if ( payload.error ) {
            self.error(payload.error_description);
            return;
          }

          self.accessToken = payload.access_token;
          ret(self.accessToken);
        });
      });
      var params = [
        ["refresh_token", this.refreshToken],
        ["client_id", this.clientId],
        ["client_secret", this.clientSecret],
        ["grant_type", "refresh_token"],
      ].map(function(s) { return s.map(encodeURIComponent).join('='); }).join("&")
      req.end(params);
    }
  ]
});
