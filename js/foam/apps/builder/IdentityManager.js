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
    'foam.apps.builder.OAuth2ChromeApp',
    'foam.apps.builder.OAuth2ChromeIdentity',
    'foam.oauth2.OAuth2Redirect',
    'foam.util.Base64Encoder',
  ],

  constants: {
    GET_IDENTITY: 'https://www.googleapis.com/plus/v1/people/me?fields=displayName%2Cemails%2Cid%2Cimage',
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
        if ( nu === 'CHROME_IDENTITY' )
          this.oauth2Model = this.OAuth2ChromeIdentity;
        else
          this.oauth2Model = this.OAuth2ChromeApp;
      },
    },
    {
      name: 'oauth2Model',
      defaultValueFn: function() {
        if ( this.mode === 'CHROME_IDENTITY' ) return this.OAuth2ChromeIdentity;
        else                                   return this.OAuth2ChromeApp;
      },
    },
    {
      name: 'xhrManager',
      required: true,
      transient: true,
    },
    {
      name: 'identity',
      documentation: function() {/* Current identity. */},
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
      type: 'Array',
      subType: 'foam.apps.builder.Identity',
      name: 'identities',
      lazyFactory: function() { return []; },
    },
    {
      name: 'oauthBinding_',
      documentation: function() {/*
        $$DOC{ref:'foam.apps.builder.XHRBinding'} for current identity's
        authentication. */},
      defaultValue: null,
    },
    {
      type: 'Function',
      name: 'newIdentity_',
      documentation: function() {/* Future for identity produced by
        $$DOC{ref:'.createIdentity'}. */},
      defaultValue: false,
    },
    {
      name: 'b64e_',
      lazyFactory: function() { return this.Base64Encoder.create({}, this.Y); },
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

      // Setup future for any createIdentity() calls made before this one
      // completes. When the future is resolved, this.newIdentity_ is reset
      // to allow subsequent createIdentities() to start a new flow.
      var future = afuture();
      this.newIdentity_ = future.get;

      // Construct OAuth2 agent, which may vary according to OAuth strategy.
      var oauth = this.oauth2Model.create({}, this.Y);
      var err;
      oauth.refresh(function(success, maybeError) {
        if ( ! success ) {
          err = maybeError || new Error('Identity manager: OAuth failed');
          future.set(err);
          this.newIdentity_ = null;
          if ( opt_err ) opt_err(err);
          else           ret(err);
          return;
        }

        // Temporarily bind new oauth ("permanent" binding occurs when
        // setting identity), then get user info, construct a new
        // identity from it, save and set the identity.
        var binding = this.xhrManager.bindAuthAgent(
            /^https?:[/][/]www[.]googleapis[.]com/, oauth);
        this.xhrManager.asend(function(data, xhr, status) {
          this.xhrManager.unbindAuthAgent(binding);

          if ( ! status ) {
            err = new Error('Identity: Failed to reach identity service');
            this.newIdentity_ = null;
            if ( opt_err ) opt_err(err);
            else           ret(err);
            return;
          }

          var identity = this.Identity.create({
            id: data.id,
            displayName: data.displayName,
            oauth: oauth,
            iconUrl: data.image && data.image.url ? data.image.url : '',
            authType: this.OAuth2ChromeApp.isInstance(oauth) ? 'WEB' :
                'CHROME_IDENTITY',
          }, this.Y);
          for ( var i = 0; i < data.emails.length; ++i ) {
            if ( data.emails[i].type === 'account' ) {
              var email = data.emails[i].value;
              identity.email = email;
              future.set(identity);
              this.newIdentity_ = null;
              ret(this.setIdentity(identity));
              this.encodeProfileImage_(identity);
              return;
            }
          }
          err = new Error('No account email found');
          future.set(err);
          this.newIdentity_ = null;
          if ( opt_err ) opt_err(err);
          else           ret(err);
        }.bind(this), this.GET_IDENTITY, undefined, 'GET');
      }.bind(this), true);
    },
    function getIdentity() { return this.identity.clone(); },
    function getIdentities() { return this.identities.slice(); },
    function setIdentity(identity) {
      var existingIdentities = this.identities.filter(function(ident) {
        return ident.id === identity.id;
      });
      if ( existingIdentities.length > 0 ) {
        identity = existingIdentities[0];
      } else {
        this.identities = this.identities.pushF(identity);
      }

      this.identity = identity;
      return identity;
    },
    function encodeProfileImage_(identity) {
      if ( ! (identity && identity.iconUrl &&
          identity.iconUrl.indexOf('http') === 0) ) return;

      // TODO(markdittmer): This flow should be available more generally.
      this.xhrManager.asend(function(data, xhr, status) {
        debugger;
        var b64data = this.b64e_.encode(data);
        var contentType = xhr.getResponseHeader('content-type') || 'image/png';
        identity.iconUrl = 'data:' + contentType + ';base64,' + b64data;
      }.bind(this), identity.iconUrl);
    },
  ],
});
