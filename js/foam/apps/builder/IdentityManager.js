/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.builder',
  name: 'IdentityManager',

  requires: [
    'foam.oauth2.OAuth2ChromeApp',
    'foam.oauth2.OAuth2ChromeIdentity',
    'foam.oauth2.OAuth2Redirect',
  ],
  imports: [
    'xhrManager',
  ],

  constants: {
    GET_EMAIL: 'https://www.googleapis.com/plus/v1/people/me',
  },

  properties: [
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'mode',
      defaultValue: 'IDENTITY',
      choices: [
        ['CHROME_IDENTITY', 'Chrome Identity'],
        ['WEB', 'Web'],
      ],
      postSet: function(old, nu) {
        if ( old === nu || ! this.oauth ) return;
        this.setupOAuth();
        this.setupEmail();
      },
    },
    {
      model_: 'StringProperty',
      name: 'oauthDataPath',
      defaultValue: 'oauth2.json',
      postSet: function(old, nu) {
        if ( old === nu || this.mode !== 'WEB' || ! this.oauth ) return;
        this.setupWebOAuth();
        this.setupEmail();
      },
    },
    {
      name: 'oauthFuture',
      defaultValue: function() { return null; },
    },
    {
      name: 'emailFuture',
      defaultValue: function() { return null; },
    },
  ],

  methods: [
    function withOAuth(ret, opt_err) {
      this.oauthFuture(function(oauth) {
        if ( oauth.accessToken ) {
          ret(oauth);
          return;
        }

        oauth.refresh(function(token) {
          if ( token )        ret(oauth);
          else if ( opt_err ) opt_err();
          else                ret();
        });
      });
    },
    function withEmail(ret, opt_err) {
      this.emailFuture(function(email) {
        if ( email )        ret(email);
        else if ( opt_err ) opt_err();
        else                ret();
      });
    },
    function init() {
      this.SUPER();
      this.setupOAuth();
      this.setupEmail();
    },
    function setupOAuth() {
        if ( this.mode === 'WEB' ) this.setupWebOAuth();
        else                       this.setupIdentityOAuth();
    },
    function setupWebOAuth() {
      var future = afuture();
      var xhrManager = this.xhrManager;
      var Y = this.Y;

      this.xhrManager.asend(function(data, xhr, status) {
        if ( ! status ) {
          future.set(null);
          return;
        }
        // TODO(markdittmer): Shouldn't JSONUtil provide a Chrome App-friendly
        // API for this?
        aeval(data)(function(map) {
          var oauth = JSONUtil.mapToObj(Y, map);
          xhrManager.bindAuthAgent(/^https?:[/][/]www[.]googleapis[.]com/, oauth);
          future.set(oauth);
        });
      }, this.oauthDataPath);

      this.oauthFuture = future.get;
    },
    function setupIdentityOAuth() {
      var oauth = this.OAuth2ChromeIdentity.create({}, this.Y);
      this.xhrManager.bindAuthAgent(/^https?:[/][/]www[.]googleapis[.]com/, oauth);
      this.oauthFuture = aconstant(oauth);
    },
    function setupEmail() {
      var future = afuture();

      this.withOAuth(function(oauth) {
        this.xhrManager.asend(function(data, xhr, status) {
          if ( ! status ) {
            future.set(null);
            return;
          }

          for ( var i = 0; i < data.emails.length; ++i ) {
            if ( data.emails[i].type === 'account' ) {
              future.set(data.emails[i].value);
              return;
            }
          }

          future.set(null);
        }, this.GET_EMAIL, undefined, 'GET');
      }.bind(this));

      this.emailFuture = future.get;
    },
  ],
});
