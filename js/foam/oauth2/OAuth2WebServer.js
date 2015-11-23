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
  name: 'OAuth2WebServer',
  requires: [
    'foam.dao.auth.Account'
  ],
  imports: [
    'accountDAO',
    'clientId'
  ],
  properties: [
    {
      name: 'clientId',
    },
    {
      name: 'clientSecret',
    },
  ],
  methods: [
    function handle(req, resp) {
      if ( req.url.indexOf("/oauth2callback?") != 0 ) return false;

      var params = req.url.substring(req.url.indexOf('?'))
          .split('&').map(function(s) { return s.split('=').map(decodeURIComponent); });

      var code;
      for ( var i = 0 ; i < params.length ; i++ ) {
        if ( params[i][0] === "code" ) {
          code = params[i][1];
          break;
        }
      }

      if (!code) {
        resp.writeHead(500);
        resp.end();
        return true;
      }

      var accountDAO = this.accountDAO;
      var self = this;
      var https = require("https");
      var req = https.request({
        hostname: "www.googleapis.com",
        port: 443,
        path: "/oauth2/v3/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }, function(response) {
        response.setEncoding('utf8');
        var data = ""
        response.on("data", function(c) {
          data += c;
        });
        response.on("end", function() {
          var payload = JSON.parse(data);

          if ( payload.error ) {
            resp.writeHead(500);
            resp.end();
            return;
          }

          var token = JSON.parse(
            new Buffer(payload.id_token.split('.')[1], 'base64').toString('utf8'));

          accountDAO.find(token.sub, {
            put: function(a) {
              a.accessToken = payload.access_token;
              a.refreshToken = payload.refresh_token;
              accountDAO.put(a);
            },
            error: function(a) {
              accountDAO.put(self.Account.create({
                id: token.sub,
                email: token.email,
                accessToken: payload.access_token,
                refreshToken: payload.refresh_token
              }));
            }
          });

          resp.writeHead(200, {
            "content-type": "text/html"
          });
          resp.end(
            '<html><head></head><body>' +
              '<script language="javascript">window.opener.postMessage({ msg: "auth_finished", data: ' +
              data +
              ' }, this.document.location.origin);</script></body></html>'
          );
        });
      });
      req.end([
        ["code",code],
        ["client_id", this.clientId],
        ["client_secret", this.clientSecret],
        ["redirect_uri", "http://localhost:8000/oauth2callback"],
        ["grant_type", "authorization_code"],
        ["access_type", "offline"]
      ].map(function(s) { return s.map(encodeURIComponent).join('='); }).join("&"));
      return true;
    }
  ],
});
