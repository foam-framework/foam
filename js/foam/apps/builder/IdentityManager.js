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
    'foam.apps.builder.Identity',
    'foam.oauth2.OAuth2ChromeApp',
    'foam.oauth2.OAuth2ChromeIdentity',
    'foam.oauth2.OAuth2Redirect',
  ],
  imports: [
    'persistentContext$ as ctx$',
  ],

  constants: {
    GET_IDENTITY: 'https://www.googleapis.com/plus/v1/people/me',
  },

  properties: [
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'mode',
      defaultValueFn: function() {
        if ( chrome && chrome.identity ) return 'CHROME_IDENTITY';
        return 'WEB';
      },
      choices: [
        ['CHROME_IDENTITY', 'Chrome Identity'],
        ['WEB', 'Web'],
      ],
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.setupOAuth();
      },
    },
    {
      model_: 'StringProperty',
      name: 'oauthDataPath',
      defaultValue: 'oauth2.json',
      postSet: function(old, nu) {
        if ( old === nu || this.mode !== 'WEB' ) return;
        this.setupWebOAuth();
      },
    },
    {
      type: 'foam.apps.builder.AppBuilderContext',
      name: 'ctx',
      transient: true,
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old == nu ) return;
        if ( old ) Events.unlink(old.identity$, this.identity_$);
        if ( nu ) Events.link(nu.identity$, this.identity_$);
      },
    },
    {
      type: 'foam.apps.builder.XHRManager',
      name: 'xhrManager',
      required: true,
      transient: true,
    },
    {
      model_: 'FunctionProperty',
      name: 'oauthFuture_',
      documentation: function() {/* Future containing "base" OAuth object that
        is cloned for authenticating new identities. */},
      defaultValue: function() { return null; },
    },
    {
      type: 'foam.apps.builder.Identity',
      name: 'identity_',
      documentation: function() {/* Current identity bound to
        current $$DOC{ref:'.ctx'} identity. */},
      defaultValue: null,
      postSet: function(old, nu) {
        if ( this.oauthBinding_ )
          this.xhrManager.unbindAuthAgent(this.oauthBinding_);
        if ( nu )
          this.oauthBinding_ = this.xhrManager.bindAuthAgent(
              /^https?:[/][/]www[.]googleapis[.]com/, nu.oauth);
        else
          this.oauthBinding_ = null;
      },
    },
    {
      type: 'foam.apps.builder.XHRBinding',
      name: 'oauthBinding_',
      documentation: function() {/*
        $$DOC{ref:'foam.apps.builder.XHRBinding'} for current identity's
        authentication. */},
      defaultValue: null,
    },
    {
      model_: 'FunctionProperty',
      name: 'newIdentity_',
      documentation: function() {/* Future for identity produced by
        $$DOC{ref:'.createIdentity'}. */},
      defaultValue: false,
    },
  ],

  methods: [
    function createIdentity(ret, opt_err) {
      if ( this.newIdentity_ ) {
        this.newIdentity_(function(ident) {
          if ( this.Identity.isInstance(ident) || ! opt_err ) ret(ident);
          else                                                opt_err(ident);
        }.bind(this));
        return;
      }

      var future = afuture();
      this.newIdentity_ = future.get;

      // Fetch base OAuth, which may vary according to OAuth strategy.
      this.oauthFuture_(function(baseOAuth) {
        // Create a copy of base OAuth and force authentication screen
        // for establishing new identity.
        var oauth = baseOAuth.clone();
        var err;
        oauth.refresh(function(success, maybeError) {
          if ( ! success ) {
            err = maybeError || new Error('Identity manager: OAuth failed');
            if ( opt_err ) opt_err(err);
            else           ret(err);
            future.set(err);
            this.newIdentity_ = null;
            return;
          }

          // Temporarily bind new oauth ("permanent" binding occurs when
          // setting identity on ctx), then get user info, construct a new
          // identity from it, save and set the identity.
          var binding = this.xhrManager.bindAuthAgent(
              /^https?:[/][/]www[.]googleapis[.]com/, oauth);
          this.xhrManager.asend(function(data, xhr, status) {
            this.xhrManager.unbindAuthAgent(binding);

            if ( ! status ) {
              err = new Error('Identity: Failed to reach identity service');
              if ( opt_err ) opt_err(err);
              else           ret(err);
              this.newIdentity_ = null;
              return;
            }

            var identity = this.Identity.create({
              id: data.id,
              displayName: data.displayName,
              oauth: oauth,
              authType: this.OAuth2ChromeApp.isInstance(oauth) ? 'WEB' :
                  'CHROME_IDENTITY',
            }, this.Y);
            for ( var i = 0; i < data.emails.length; ++i ) {
              if ( data.emails[i].type === 'account' ) {
                var email = data.emails[i].value;
                identity.email = email;
                ret(this.setIdentity(identity));
                future.set(identity);
                this.newIdentity_ = null;
                return;
              }
            }

            err = new Error('No account email found');
            if ( opt_err ) opt_err(err);
            else           ret(err);
            future.set(err);
            this.newIdentity_ = null;
          }.bind(this), this.GET_IDENTITY, undefined, 'GET');
        }.bind(this), true);
      }.bind(this));
    },
    function getIdentity(ret, opt_err) {
      if ( this.identity_ ) ret(this.identity_);
      else                  this.createIdentity(ret, opt_err);
    },
    function setIdentity(identity) {
      if ( ! this.ctx ) return null;
      var existingIdentities = this.ctx.identities.filter(function(ident) {
        return ident.id === identity.id;
      });
      if ( existingIdentities.length > 0 ) {
        identity = existingIdentities[0];
      } else {
        this.ctx.identities = this.ctx.identities.pushF(identity);
      }

      this.ctx.identity = identity;
      return identity;
    },
    function init() {
      this.SUPER();
      this.setupOAuth();
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
          future.set(oauth);
        });
      }, this.oauthDataPath);

      this.oauthFuture_ = future.get;
    },
    function setupIdentityOAuth() {
      var oauth = this.OAuth2ChromeIdentity.create({}, this.Y);
      this.oauthFuture_ = aconstant(oauth);
    },
  ],
});
