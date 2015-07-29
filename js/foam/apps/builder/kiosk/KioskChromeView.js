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
  name: 'KioskChromeView',
  extendsModel: 'foam.ui.View',

  imports: [
    'kiosk',
    'url$',
    'webview',
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) {
          Events.unfollow(old.homepage$, this.url$);
          old.removeListener(this.onDataPropertyChange);
        }
        if ( nu ) {
          Events.follow(nu.homepage$, this.url$);
          nu.addListener(this.onDataPropertyChange);
        }
      },
    },
    {
      model_: 'StringProperty',
      name: 'url',
      view: 'foam.ui.md.TextFieldView',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.webview.subscribe(['action', 'navigate'], this.onNavigate);
    },
    function updateInnerHTML() {
      if ( ! this.$ ) return;
      this.children = [];
      var out = TemplateOutput.create(this);
      this.toInnerHTML(out);
      this.$.innerHTML = out.toString();
    },
  ],

  listeners: [
    {
      name: 'onDataPropertyChange',
      code: function() {
        this.updateInnerHTML();
        this.initHTML();
      }
    },
    {
      name: 'onNavigate',
      code: function(_, __, url) { this.url = url; },
    },
  ],

  actions: [
    {
      name: 'back',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAOUlEQVR4AWMYxqABCElS/p/hN4MWacpDSFMeSlPlYaQo/0OScnyQYg0IJ4XjcsLI0KJFmpa64Zt3AdTaQlFOlKYFAAAAAElFTkSuQmCC',
      isAvailable: function() { return this.data.enableNavBttns; },
      isEnabled: function() { return this.webview.canGoBack; },
      action: function() { this.webview.back(); }
    },
    {
      name: 'forward',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAOUlEQVR4AWMYxqCRoYEU5boMfxj+k6YlgnQtkXTREkW6lmjcWv7jhQ3kayDspGGrnPLE1wCEwxYAABNmQoikBfhoAAAAAElFTkSuQmCC',
      isAvailable: function() { return this.data.enableNavBttns; },
      isEnabled: function() { return this.webview.canGoForward; },
      action: function() { this.webview.forward(); }
    },
    {
      name: 'home',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAQAAAD8x0bcAAAAZklEQVR4AWOgIQhg8CekJJ3hDxCm4VPSyPAfChuwK2BmmAmURMAZQBE0wMmwASqJgOsZOJCVCDIcAQpiwiNAGSiQZbgKFcSEVxhkEGY5YFXiAJLCVHSAoQEID+BWhPB6w8Apoj8AADuwY8lEA+JQAAAAAElFTkSuQmCC',
      isAvailable: function() { return this.data.enableHomeBttn; },
      action: function() { this.webview.home(); }
    },
    {
      name: 'reload',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAwElEQVR4Ad3SP04CURDA4a8RlpNYEP5zQbBGIYT4Ck5iZbwEcStj9AQW7JrI2LLxuYmx45tuMr9uXKSJpFT7VErGgIWsnr1ozElSWIr8+ZNwtDLV1TGzUQsvIh/shVd958Y+RD6YCEd9TTciH5CElaal+D0ohalzC9EW1EJXi38Hz8LMH9wLd3K2wq0fRk4qg8y+9uVaRhLeDJ0behfWsgqPQmVtrqcwt1EJD64gnyQnzefb6mg1snNQqR3sDFygb3rVYPgYJpUVAAAAAElFTkSuQmCC',
      isAvailable: function() { return this.data.enableReloadBttn; },
      action: function() { this.webview.reload(); }
    },
    {
      name: 'logout',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAcklEQVR4AWMYvCCQ4SXDfzzwFYM/inqQcgLwJYp6sBAqwJCnqgZFhgMMCqRoWAnkPUBoIewCPobjCC0IDfi1nIBoweMkTAjXQrkGTMCP6SQSlBMO1lUw5cRqUMAWcfROS68IJu8XqBoCGF4SUO47aDM/AFyMnK0wQYLQAAAAAElFTkSuQmCC',
      isAvailable: function() { return this.data.enableLogoutBttn; },
      action: function() { this.kiosk.logout(); }
    },
  ],

  templates: [
    function toHTML() {/*
      <kiosk-chrome id="%%id" <%= this.cssClassAttr() %>>
        <% this.toInnerHTML(out) %>
      </kiosk-chrome>
    */},
    function toInnerHTML() {/*
      $$back
      $$forward
      $$home
      <% if ( this.data.enableNavBar ) { %>
        $$url
      <% } %>
      $$reload
      $$logout
    */},
    function CSS() {/*
      kiosk-chrome {
        display: flex;
        align-items: center;
        flex-grow: 0;
        flex-shrink: 0;
        padding: 0px 6px;
        box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.38);
      }
      kiosk-chrome .actionButtonCView {
        flex-grow: 0;
        flex-shrink: 0;
        margin: 12px 6px;
      }
      kiosk-chrome .md-text-field-container {
        flex-grow: 1;
        flex-shrink: 1;
      }
      kiosk-chrome .actionButtonCView[width="0"][height="0"] {
        margin: 0px;
      }
    */},
  ]
});
