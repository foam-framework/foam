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
  name: 'ChromeView',
  extends: 'foam.ui.View',

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
          Events.unfollow(old.enableNavBar$, this.urlEnabled$);
        }
        if ( nu ) {
          Events.follow(nu.homepage$, this.url$);
          Events.follow(nu.enableNavBar$, this.urlEnabled$);
        }
      },
    },
    {
      type: 'String',
      name: 'url',
      view: 'foam.ui.md.TextFieldView',
    },
    {
      type: 'Boolean',
      name: 'urlEnabled',
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.webview &&
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
      name: 'onNavigate',
      code: function(_, __, url) { this.url = url; },
    },
  ],

  actions: [
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'back',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAOUlEQVR4AWMYxqABCElS/p/hN4MWacpDSFMeSlPlYaQo/0OScnyQYg0IJ4XjcsLI0KJFmpa64Zt3AdTaQlFOlKYFAAAAAElFTkSuQmCC',
      ligature: 'arrow_back',
      isAvailable: function() { return this.data.enableNavBttns; },
      isEnabled: function() {
        return ( ! this.webview ) || this.webview.canGoBack;
      },
      code: function() { this.webview && this.webview.back(); }
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'forward',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAOUlEQVR4AWMYxqCRoYEU5boMfxj+k6YlgnQtkXTREkW6lmjcWv7jhQ3kayDspGGrnPLE1wCEwxYAABNmQoikBfhoAAAAAElFTkSuQmCC',
      ligature: 'arrow_forward',
      isAvailable: function() { return this.data.enableNavBttns; },
      isEnabled: function() {
        return ( ! this.webview ) || this.webview.canGoForward;
      },
      code: function() { this.webview && this.webview.forward(); }
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'home',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAeElEQVR4Ae3Lr9WCABxA0UugaWUB3YAZdAgdgzncQpdghs8NWIBMI/DTQOBw+Bcser778vMtErd3iY1SDyHcpTbYK0VfaWdF5ikG/cksOKrEqMrBjFwtJqrlJpw1YqbGychVKxZqXQwUOrFSpzASC4EPDr3/4Ye8AFVvsVUqqgZTAAAAAElFTkSuQmCC',
      ligature: 'home',
      isAvailable: function() { return this.data.enableHomeBttn; },
      code: function() { this.webview && this.webview.home(); }
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'reload',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAwElEQVR4Ad3SP04CURDA4a8RlpNYEP5zQbBGIYT4Ck5iZbwEcStj9AQW7JrI2LLxuYmx45tuMr9uXKSJpFT7VErGgIWsnr1ozElSWIr8+ZNwtDLV1TGzUQsvIh/shVd958Y+RD6YCEd9TTciH5CElaal+D0ohalzC9EW1EJXi38Hz8LMH9wLd3K2wq0fRk4qg8y+9uVaRhLeDJ0behfWsgqPQmVtrqcwt1EJD64gnyQnzefb6mg1snNQqR3sDFygb3rVYPgYJpUVAAAAAElFTkSuQmCC',
      ligature: 'refresh',
      isAvailable: function() { return this.data.enableReloadBttn; },
      code: function() { this.webview && this.webview.reload(); }
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'logout',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAcklEQVR4AWMYvCCQ4SXDfzzwFYM/inqQcgLwJYp6sBAqwJCnqgZFhgMMCqRoWAnkPUBoIewCPobjCC0IDfi1nIBoweMkTAjXQrkGTMCP6SQSlBMO1lUw5cRqUMAWcfROS68IJu8XqBoCGF4SUO47aDM/AFyMnK0wQYLQAAAAAElFTkSuQmCC',
      ligature: 'exit_to_app',
      isAvailable: function() { return this.data.enableLogoutBttn; },
      code: function() { this.kiosk.logout(); }
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
      $$url{ enabled$: this.urlEnabled$ }
      $$reload
      $$logout
      <% this.setClass('hidden', function() {
           return ! this.data.enableNavBar;
         }.bind(this), this.urlView.id); %>
    */},
    function CSS() {/*
      kiosk-chrome {
        display: flex;
        align-items: center;
        flex-grow: 0;
        flex-shrink: 0;
        padding: 0 0 0 8px;
        box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.38);
        overflow: hidden;
      }
      kiosk-chrome .md-button {
        flex-grow: 0;
        flex-shrink: 0;
        margin-left: 0;
      }
      kiosk-chrome .md-text-field-container {
        flex-grow: 1;
        flex-shrink: 1;
      }
      kiosk-chrome .md-text-field-container.hidden {
        display: inherit!important;
        transition-delay: 0ms, 250ms, 250ms, 250ms;
        opacity: 0;
        width: 0;
        margin: 0;
        padding: 0;

      }
      kiosk-chrome .md-text-field-container {
        transition: opacity 250ms ease, width 249ms ease, margin 249ms ease, padding 249ms ease;
        transition-delay: 249ms, 0ms, 0ms, 0ms;
        opacity: unset;
      }
    */},
  ]
});
