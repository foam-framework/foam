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
  package: 'com.google.mail',
  name: 'AuthClient',
  requires: [
    'foam.ui.md.PopupView',
  ],
  imports: [
    'clientId',
    'window'
  ],
  properties: [
    {
      name: 'idToken'
    },
    {
      type: 'StringArray',
      name: 'scopes',
      factory: function() {
        return [
          "openid",
          "profile",
          "email",
          "https://www.googleapis.com/auth/gmail.modify",
          "https://www.googleapis.com/auth/gmail.compose"
        ];
      }
    }
  ],
  methods: [
    function buildAuthUrl() {
      var params = [
        ["response_type", "code"],
        ["access_type", "offline"],
        ["approval_prompt", "force"],
        ["client_id", this.clientId],
        ["redirect_uri", "http://localhost:8000/oauth2callback"],
        ["scope", this.scopes.join(" ")],
        ["state", 1]
      ];
      params = params.map(function(s) {
        return s.map(encodeURIComponent).join('=');
      }).join('&');

      return "https://accounts.google.com/o/oauth2/auth?" + params;
    },
    function go() {
      this.window.addEventListener("message", this.onMessage);
      this.PopupView.create({
        delegate: function(args, X) {
          args = args || {};
          args.auth = this;
          return this.Popup.create(args, X);
        }.bind(this)
      }).open();
    }
  ],
  listeners: [
    {
      name: "onMessage",
      code: function(m) {
        var data = m.data;
        if ( data.msg && data.msg == "auth_finished" ) {
          m.source.close();
          this.idToken = data.data.id_token;
        }
      }
    }
  ],
  models: [
    {
      name: 'Popup',
      extends: 'foam.ui.SimpleView',
      imports: [
        'window'
      ],
      properties: [
        'auth'
      ],
      templates: [
        function toHTML() {/*
<div id="%%id" %%cssClassAttr() style="width: 300px;height: 230px;">
<span id="<%= this.on('click', this.onClick) %>">Click here to sign in.</span>
</div>*/}
      ],
      listeners: [
        {
          name: 'onClick',
          code: function() {
            var w = this.window.open(this.auth.buildAuthUrl());
          }
        }
      ]
    }
  ]
});
