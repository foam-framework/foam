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
  extends: 'foam.ui.View',
  traits: [ 'foam.apps.builder.ZIndexTrait' ],

  requires: [
    'foam.apps.builder.TOSData',
    'foam.apps.builder.TOSView',
    'foam.apps.builder.Timeout',
    'foam.apps.builder.WebView',
    'foam.apps.builder.kiosk.ChromeView',
    'foam.metrics.Event',
    'foam.metrics.Metric',
    'foam.ui.md.FlatButton',
    'foam.ui.md.PopupView',
  ],
  imports: [
    'metricsDAO',
    'urlDAO',
  ],
  exports: [
    'as kiosk',
    'url$',
    'webview',
  ],

  properties: [
    'metricsDAO',
    'urlDAO',
    {
      name: 'data',
      view: 'foam.apps.builder.kiosk.ChromeView',
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
      type: 'Int',
      name: 'zIndex',
      defaultValue: 1,
    },
    {
      name: 'tosData',
      lazyFactory: function() {
        return this.TOSData.create({}, this.Y);
      },
    },
    {
      name: 'tosView',
      lazyFactory: function() {
        return this.PopupView.create({
          delegate: this.TOSView,
          data$: this.tosData$,
          blockerMode: 'modal',
          cardClass: 'md-card-shell',
        }, this.Y);
      },
    },
    {
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
      type: 'String',
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
      this.Y.registerModel(this.FlatButton.xbind({
        displayMode: 'ICON_ONLY',
        height: 24,
        width: 24,
        color: 'black'
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
      }.bind(this));
      if ( this.data.termsOfService ) this.openTOS();
    },
    function openTOS() {
      this.tosData.accepted = false;
      this.tosView.open(this.$);
    },
    function closeTOS() { this.tosView.close(); },
  ],

  actions: [
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'clearCache',
      code: function() { this.webview.clearCache(); },
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'returnHome',
      code: function() {
        this.url = this.data.homepage;
        if ( this.data.termsOfService ) this.openTOS();
      },
    },
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
      code: function(webview, topic, url) {
        if ( topic && topic[1] === 'navigate' ) {
          url && this.urlDAO && this.urlDAO.put(this.Metric.create({
            // App Builder apps are "mobile apps" (not web properties); use
            // "screenview" instead of "pageview" to report analytics in a
            // useful place for mobile apps.
            type: 'screenview',
            name: url,
          }, this.Y));
          this.metricsDAO && this.metricsDAO.put(this.Event.create({
            name: 'Action:kiosk:navigate',
          }, this.Y));
        }
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
      code: function() { this.clearCache(); },
    },
    {
      name: 'onHomeTimeout',
      code: function() { this.returnHome(); },
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
