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
  package: 'foam.apps.builder.kiosk',
  name: 'KioskView',
  extendsModel: 'foam.ui.View',
  traits: [ 'foam.apps.builder.ZIndexTrait' ],

  requires: [
    'foam.apps.builder.kiosk.KioskChromeView',
    'foam.apps.builder.Timeout',
    'foam.apps.builder.TOSData',
    'foam.apps.builder.TOSView',
    'foam.apps.builder.WebView',
    'foam.graphics.ActionButtonCView',
    'foam.ui.md.PopupView',
  ],
  exports: [
    'as kiosk',
    'url$',
    'webview',
  ],

  properties: [
    {
      name: 'data',
      view: 'foam.apps.builder.kiosk.KioskChromeView',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) {
          old.termsOfService$.removeListener(this.onTOSChange);
          old.sessionDataTimeoutTime$.removeListener(this.onCacheTimeoutChange);
          old.sessionTimeoutTime$.removeListener(this.onHomeTimeoutChange);
          old.rotation$.removeListener(this.onRotationChange);
        }
        if ( nu ) {
          this.tosData.tos = this.data.termsOfService;
          nu.termsOfService$.addListener(this.onTOSChange);
          nu.sessionDataTimeoutTime$.addListener(this.onCacheTimeoutChange);
          nu.sessionTimeoutTime$.addListener(this.onHomeTimeoutChange);
          nu.rotation$.addListener(this.onRotationChange);
          if ( nu.rotation !== 0 ) this.onRotationChange();
        }
      },
    },
    {
      model_: 'IntProperty',
      name: 'zIndex',
      defaultValue: 1,
    },
    {
      type: 'foam.apps.builder.TOSData',
      name: 'tosData',
      lazyFactory: function() {
        return this.TOSData.create({}, this.Y);
      },
    },
    {
      type: 'foam.ui.md.PopupView',
      name: 'tosView',
      lazyFactory: function() {
        return this.PopupView.create({
          delegate: this.TOSView,
          data$: this.tosData$,
          blockerMode: 'modal'
        }, this.Y);
      },
    },
    {
      type: 'foam.apps.builder.WebView',
      name: 'webview',
      lazyFactory: function() {
        return this.WebView.create({
          data$: this.data$,
          extraClassName: 'kiosk-webview',
        });
      },
      postSet: function(old, nu) {
        if ( old ) old.unsubscribe(['action'], this.onWebviewAction);
        if ( nu ) nu.subscribe(['action'], this.onWebviewAction);
      },
    },
    {
      model_: 'StringProperty',
      name: 'url',
    },
    {
      name: 'cacheTimeout',
      factory: function() {
        return this.Timeout.create({
          minutes: this.data ? this.data.sessionDataTimeoutTime : 0,
          callback: this.onCacheTimeout,
        });
      },
    },
    {
      name: 'homeTimeout',
      factory: function() {
        return this.Timeout.create({
          minutes: this.data ? this.data.sessionTimeoutTime : 0,
          callback: this.onHomeTimeout,
        });
      },
    },
  ],

  methods: [
    function init() {
      this.Y.registerModel(this.ActionButtonCView.xbind({
        height: 24,
        width: 24,
        haloColor: 'black'
      }), 'foam.ui.ActionButton');
    },
    function initHTML() {
      this.SUPER();
      if ( this.data.termsOfService )
        this.openTOS();
      else
        this.closeTOS();
    },
    function logout() {
      this.webview.ahome(function() {
        this.webview.clearCache();
        if ( this.data.termsOfService ) this.openTOS();
      }.bind(this));
    },
    function openTOS() {
      this.tosData.accepted = false;
      this.tosView.open(this.$);
    },
    function closeTOS() { this.tosView.close(); },
  ],

  listeners: [
    {
      name: 'onTOSChange',
      code: function() {
        this.tosData.tos = this.data.termsOfService;
        if ( this.tosData.tos )
          this.openTOS();
        else
          this.closeTOS();
      },
    },
    {
      name: 'onWebviewAction',
      code: function() {
        this.cacheTimeout.restart();
        this.homeTimeout.restart();
      },
    },
    {
      name: 'onCacheTimeoutChange',
      code: function() {
        this.cacheTimeout.cancel();
        var minutes = this.data ? this.data.sessionDataTimeoutTime : 0;
        this.cacheTimeout.minutes = minutes;
        if ( minutes ) this.cacheTimeout.start();
      },
    },
    {
      name: 'onHomeTimeoutChange',
      code: function() {
        this.homeTimeout.cancel();
        var minutes = this.data ? this.data.sessionTimeoutTime : 0;
        this.homeTimeout.minutes = minutes;
        if ( minutes ) this.homeTimeout.start();
      },
    },
    {
      name: 'onCacheTimeout',
      code: function() { this.webview.clearCache(); },
    },
    {
      name: 'onHomeTimeout',
      code: function() {
        this.url = this.data.homepage;
        if ( this.data.termsOfService ) this.openTOS();
      },
    },
    {
      name: 'onRotationChange',
      code: function() {
        if ( ! ( chrome && chrome.system && chrome.system.display ) ) return;
        var rotation = this.data.rotation;
        chrome.system.display.getInfo(function(displays) {
          if ( displays.every(function(display) {
            return display.rotation === rotation;
          }) ) return;

          for ( var i = 0; i < displays.length; ++i ) {
            var display = displays[i];
            chrome.system.display.setDisplayProperties(
                display.id, { rotation: rotation }, function() {
                  chrome.runtime.lastError && chrome.runtime.lastError.message;
                });
          }
        });
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <kiosk id="%%id" <%= this.cssClassAttr() %> >
        %%tosView
        $$data
        %%webview
      </kiosk>
    */},
    function CSS() {/*
      kiosk {
        position: relative;
        flex-direction: column;
      }
      kiosk, kiosk .kiosk-webview {
        display: flex;
        flex-grow: 1;
      }
      kiosk kiosk-chrome {
        z-index: 2;
      }
      kiosk .kiosk-webview {
        z-index: 1;
      }
    */},
  ],
});
