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
    'foam.browser.u2.BrowserController',
    'foam.browser.u2.BrowserView',
    'foam.fonts.LigatureTester',
    'foam.memento.FragmentMementoMgr',
    'foam.u2.ActionButton',
    'foam.u2.DetailView',
    'foam.ui.DetailView',
  ],
  exports: [
    'currentUserId',
    'headerColor',
    'postId',
    'appTitle',
  ],

  properties: [
    {
      type: 'String',
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
      type: 'ViewFactory',
      name: 'clientView',
      defaultValue: function() {
        this.client.Y.registerModel(this.BrowserView.xbind({
          title$: this.appTitle$,
        }), 'foam.browser.u2.BrowserView');
        this.client.Y.registerModel(this.LigatureTester.xbind({
          timeout: 10000,
        }), 'foam.fonts.LigatureTester');
        var view = this.BrowserController.create({
            data: this.client.postDAO,
        }, this.client.Y);
        view.subscribe(
            ['loaded'],
            EventService.oneTime(function() {
              var e = window.document.getElementById('avizi-splash');
              if ( ! e ) {
                console.warn('Failed to find Avizi splash screen element');
                return;
              }
              window.document.body.removeChild(e);
            }));
        return view;
      },
    },
    {
      type: 'Function',
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
    function toInnerHTML() {/*
      %%clientView()
    */},
    function CSS() {/*
      .foam-browser-u2-BrowserView-header-title,
      .foam-u2-md-Toolbar-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .foam-browser-u2-BrowserView-body {
        overflow-x: hidden;
        overflow-y: auto;
      }
      img:not([src]){ display:none; }
      .foam-u2-ScrollView-inner div:nth-child(12n+1) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(224,92,108);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+2) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(224,138,79);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+3) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(241,189,103);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+4) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(244,211,98);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+5) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(246,235,92);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+6) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(204,228,96);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+7) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(159,215,98);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+8) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(144,190,161);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+9) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(131,174,224);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+10) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(172,139,233);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+11) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(194,88,216);
      }
      .foam-u2-ScrollView-inner div:nth-child(12n+12) .com-google-ymp-ui-PostRowView-img {
        background-color: rgb(203,82,156);
      }
    */},
  ],
});
