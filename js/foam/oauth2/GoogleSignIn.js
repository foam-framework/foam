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
    'Binding',
    'PersistentContext',
    'foam.dao.IDBDAO',
    'foam.oauth2.GoogleSignInTokenCarrier',
    'foam.ui.md.PopupView',
  ],
  imports: [
    'document',
    'googleClientId',
    'window',
  ],

  constants: {
    AUTH_HEADER: 'X-FOAM-Auth',
  },

  properties: [
    {
      name: 'popupView_',
    },
    {
      name: 'persistentContext_',
      factory: function() {
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({
            model: this.Binding,
            name: 'google-auth-' + this.googleClientId
          }),
          predicate: NOT_TRANSIENT,
          context: this
        });
      }
    },
    {
      name: 'authToken_',
    },
  ],

  methods: [
    function alogin(ret) {
      // We might already have a valid Google auth token stored.
      var future = this.persistentContext_.bindObject('authToken_',
          this.GoogleSignInTokenCarrier, undefined, 2);

      future(function(token) {
        if (token && token.token && new Date(token.expiry) > new Date()) {
          ret();
          return;
        }

        // TODO(braden): Investigate the practicality of reimplementing this small
        // part of the library, to avoid needing to include it.

        // If we're still here, no valid token was found. So first make sure the
        // Google sign-in library is loaded.
        // If it's already loading, this.window.__googleSignInListeners will be
        // defined, and we should add ourselves to it.
        if (this.window.__googleSignInListeners) {
          this.window.__googleSignInListeners.push(ret);
          return;
        }

        // No one else has loaded the Google sign-in library, so I will.
        // First, add the listeners array, and put ourselves in.
        this.window.__googleSignInListeners = [ret];
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
      }.bind(this));
    },

    // Decorator method for XHR.configure.
    function configure(decorator, delegate, args) {
      var xhr = args[0];
      xhr.setRequestHeader("X-FOAM-Auth", decorator.authToken_.token);
      return delegate.apply(this, args);
    },
  ],

  listeners: [
    {
      name: 'onSuccess',
      code: function(googleUser) {
        this.popupView_.close();
        var auth = googleUser.getAuthResponse();
        this.authToken_.token = auth.id_token;
        this.authToken_.expiry = auth.expires_at;
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
