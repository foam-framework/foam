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
  package: 'com.google.ymp',
  name: 'UserClient',
  extends: 'foam.ui.SimpleView',
  traits: [
    'foam.memento.MemorableTrait'
  ],

  requires: [
    //'com.google.ymp.Browser',
    'com.google.ymp.Client',
    'com.google.ymp.controllers.DAOController',
    'foam.memento.FragmentMementoMgr',
    'foam.ui.DetailView',
    'foam.browser.u2.BrowserController',
    'foam.browser.u2.BrowserView',
    'foam.u2.DetailView',
    'foam.u2.ActionButton',
  ],
  exports: [
    'currentUserId',
    'headerColor',
    'postId',
    'appTitle',
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'currentUserId',
      memorable: true,
      postSet: function(old, nu, prop) {
        if ( old === nu ) return;
        if ( old && nu ) GLOBAL.location.reload();
      },
    },
    {
      type: 'String',
      name: 'postId',
      memorable: true,
    },
    {
      type: 'String',
      name: 'appTitle',
      defaultValue: 'Avizi',
    },
    {
      name: 'client',
      lazyFactory: function() {
        return this.clientFactory();
      },
      postSet: function(old, nu, prop) {
        console.log('Set UserClient.client', nu);
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'clientView',
      defaultValue: function() {
        this.client.Y.registerModel(this.BrowserView.xbind({
          title$: this.appTitle$,
        }), 'foam.browser.u2.BrowserView');

        return this.BrowserController.create({
            data: this.client.postDAO,
        }, this.client.Y);
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'clientFactory',
      defaultValue: function() {
        return this.Client.create({
          currentUserId$: this.currentUserId$,
        });
      },
    },
    [ 'headerColor', '#3e50b4' ],
  ],

  methods: [
    function init() {
      this.SUPER();
      this.FragmentMementoMgr.create({ mementoValue: this.memento$ });
      this.Y.registerModel(this.DAOController, 'foam.u2.DAOController');
    },
  ],

  templates: [
    function toInnerHTML() {/*%%clientView()*/},
    function CSS() {/*
      .foam-browser-u2-BrowserView-header-title,
      .foam-u2-md-Toolbar-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      img:not([src]){ display:none; }
    */},
  ],
});
