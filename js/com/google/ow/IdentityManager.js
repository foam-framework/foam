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
  package: 'com.google.ow',
  name: 'IdentityManager',

  requires: [
    'Binding',
    'PersistentContext',
    'XHR',
    'com.google.ow.Context',
    'com.google.plus.Person',
    'foam.dao.IDBDAO',
    'foam.oauth2.OAuth2Redirect as OAuth2',
  ],

  constants: {
    LOOKUP_IDENTITY_URL: 'https://www.googleapis.com/plus/v1/people/me',
  },

  properties: [
    'xhr_',
    {
      type: 'com.google.plus.Person',
      name: 'identity',
      defaultValue: null,
    },
    {
      name: 'oauth2',
      lazyFactory: function() {
        return this.OAuth2.create({
          clientId: '236110047991-lheqmjk123qg742ibdao2p8kgosql3c0.apps.googleusercontent.com',
          clientSecret: 'FmJgOObSq7IUnFUC1yIENSap',
          scopes: [ 'email', 'profile' ],
        }, this.Y);
      },
    },
    {
      name: 'persistentContext',
      transient: true,
      lazyFactory: function() {
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({ model: this.Binding }),
          predicate: NOT_TRANSIENT,
          context: this
        });
      },
    },
    {
      type: 'com.google.ow.Context',
      name: 'ctx',
      transient: true,
      defaultValue: null,
      postSet: function(old, nu) {
        if ( ! nu.accessToken ) {
          this.oauth2.refresh(function(accessToken) {
            this.ctx.accessToken = accessToken;
            this.lookupIdentity();
          }.bind(this));
        } else {
          this.oauth2.accessToken = nu.accessToken;
          this.lookupIdentity();
        }
      },
    },
  ],

  methods: [
    function logout() {
      this.identity = null;
      this.ctx.accessToken = this.oauth2.accessToken = '';
      this.ctx = this.ctx;
    },
    function lookupIdentity() {
      this.xhr_.create(null, this.X).asend(function(data, xhr, status) {
        if ( ! status ) throw 'Identity lookup error';
        this.identity = this.Person.create(null, this.X).fromJSON(data);
      }.bind(this), this.LOOKUP_IDENTITY_URL, undefined, 'GET');
    },
    function init() {
      this.SUPER();
      this.xhr_ = this.XHR.xbind({
        authAgent: this.oauth2,
        retries: 3,
        delay: 10,
        responseType: 'json',
      });
      this.X.registerModel(this.xhr_, 'GXHR');
      this.persistentContext.bindObject('ctx', this.Context, undefined, 1);
    },
  ],
});
