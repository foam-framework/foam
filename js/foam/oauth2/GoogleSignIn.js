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
  name: 'GoogleSignIn',
  requires: [
    'foam.ui.md.PopupView',
  ],
  imports: [
    'document',
    'googleClientId',
    'window',
  ],

  constants: {
    COOKIE_KEY: 'foamDAOAuth',
  },

  properties: [
    {
      name: 'popupView_',
    },
    {
      name: 'authComplete_',
      defaultValue: false
    },
  ],

  methods: [
    function alogin(ret) {
      // We might already have a valid Google auth token in a cookie.
      // So we first read the cookies, and check if it's present.
      if (this.authComplete_) {
        ret();
        return;
      }

      var cookies = this.document.cookie.split(/;\s*/);
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        if (parts[0] === this.COOKIE_KEY) {
          // Found a valid cookie; nothing else needs to be done.
          this.authComplete_ = true;
          ret();
          return;
        }
      }

      var onLogin = function(ret) {
        this.authComplete_ = true;
        ret();
      };

      // TODO(braden): Investigate the practicality of reimplementing this small
      // part of the library, to avoid needing to include it.

      // If we're still here, no valid cookie was found. So first make sure the
      // Google sign-in library is loaded.
      // If it's already loading, this.window.__googleSignInListeners will be
      // defined, and we should add ourselves to it.
      if (this.window.__googleSignInListeners) {
        this.window.__googleSignInListeners.push(onLogin.bind(this, ret));
        return;
      }

      // No one else has loaded the Google sign-in library, so I will.
      // First, add the listeners array, and put ourselves in.
      this.window.__googleSignInListeners = [onLogin.bind(this, ret)];
      this.window.__googleSignInSuccess = this.onSuccess;

      // Next, add the <meta> tag with the client_id for its use.
      if (!this.googleClientId) {
        console.error('No googleClientId found on the context. See ' +
            'https://developers.google.com/identity/sign-in/web/devconsole-project' +
            'to set up a project and acquire a client ID, then set it on the ' +
            'context.');
        return;
      }
      this.document.head.insertAdjacentHTML('beforeend',
          '<meta name="google-signin-client_id" content="' +
          this.googleClientId + '" />');

      // Then add the script tag.
      var script = this.document.createElement('script');
      script.src = 'https://apis.google.com/js/platform.js';
      this.document.body.appendChild(script);

      // Finally, open a PopupView containing their login button.
      this.popupView_ = this.PopupView.create({
        delegate: function(args, X) {
          return this.LoginPopupView.create(args, X);
        }.bind(this)
      });
      this.document.body.insertAdjacentHTML('beforeend',
          this.popupView_.toHTML());
      this.popupView_.initHTML();
      this.popupView_.open();
    },
  ],

  listeners: [
    {
      name: 'onSuccess',
      code: function(googleUser) {
        this.popupView_.close();
        // Set the cookie, then ping all the listeners.
        var auth = googleUser.getAuthResponse();
        this.document.cookie = 'foamDAOAuth=' + auth.id_token + '; expires=' +
            (new Date(auth.expires_at)).toGMTString() + '; path=/';

        for (var i = 0; i < this.window.__googleSignInListeners.length; i++) {
          this.window.__googleSignInListeners[i]();
        }
      }
    },
  ],

  models: [
    {
      name: 'LoginPopupView',
      extends: 'foam.ui.SimpleView',
      templates: [
        function toHTML() {/*
          <div id="%%id" %%cssClassAttr()>
            <h3>Sign in</h3>
            <div>Press the button below to sign in with your Google account.</div>
            <div class="g-signin2" data-onsuccess="__googleSignInSuccess"></div>
          </div>
        */},
      ]
    }
  ]
});
