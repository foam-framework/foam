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
  name: 'WebView',
  extendsModel: 'foam.ui.View',

  imports: [
    'url$'
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'tagName',
      defaultValueFn: function() {
        return this.inChromeApp() ? 'webview' : 'iframe';
      }
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) Events.unfollow(old.homepage$, this.url$);
        if ( nu ) Events.follow(nu.homepage$, this.url$);
        this.onDataChange();
      },
    },
    {
      model_: 'StringProperty',
      name: 'url',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.setAttribute('src', nu);
      },
    },
  ],

  methods: [
    function inChromeApp() {
      return !!(this.X.window && this.X.window.chrome &&
          this.X.window.chrome.runtime && this.X.window.chrome.runtime.id);
    },
    function webViewAttrs() {
      if ( ! this.inChromeApp() ) return '';
      // TODO(markdittmer): Add <webview>-related HTML attributes.
      return '';
    },
  ],

  listeners: [
    {
      name: 'onDataChange',
      code: function() {
        if ( ! this.inChromeApp() ) {
          console.warn('Simulating Chrome webview.onDataChange: ' +
              'Some features disabled');
          return;
        }
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <{{this.tagName}} id="%%id" <%= this.cssClassAttr() %> src="%%url" %%webViewAttrs()>
      </{{this.tagName}}>
    */},
    function CSS() {/*
      webview, iframe {
        border: none;
        width: initial;
        height: initial;
      }
    */},
  ],
});
