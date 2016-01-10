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
  extends: 'foam.ui.View',

  imports: [
    'url$'
  ],

  constants: {
    CLEAR_CACHE_OPTS: {
      appcache: true,
      cache: true,
      cookies: true,
      fileSystems: true,
      indexedDB: true,
      localStorage: true,
      webSQL: true,
    },
  },

  properties: [
    {
      type: 'String',
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
      },
    },
    {
      type: 'String',
      name: 'url',
      postSet: function(old, nu) {
        if ( old === nu || ( ! this.$ ) ||
            this.$.getAttribute('src') === nu ) return;
        this.$.setAttribute('src', nu);
      },
    },
    {
      type: 'Boolean',
      name: 'isLoading',
      defaultValue: false,
    },
    {
      type: 'Boolean',
      name: 'canGoBack',
      defaultValue: false,
    },
    {
      type: 'Boolean',
      name: 'canGoForward',
      defaultValue: false,
    },
    {
      type: 'Array',
      subType: 'Function',
      name: 'loadListeners_',
      lazyFactory: function() { return []; },
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
    function initHTML() {
      this.SUPER();
      if ( ! this.inChromeApp() ) {
        console.warn('Simulating Chrome webview.initHTML: ' +
            'Some features disabled');
        return;
      }

      var webview = this.$;
      webview.addEventListener('loadcommit', this.onLoadCommit);
      webview.addEventListener('loadstop', this.onLoadStop);
      webview.addEventListener('permissionrequest', this.onPermissionRequest);
    },
    function resetState() {
      var oldElem = this.$;
      this.id = this.nextID();
      var out = TemplateOutput.create(this);
      this.toHTML(out);
      oldElem.outerHTML = out.toString();
      this.canGoBack = this.$.canGoBack();
      this.canGoForward = this.$.canGoForward();
      this.isLoading = false;
    },
    function onNextLoadStop(ret) {
      var listener = function(_, __, ___, nu) {
        if ( nu ) return;
        this.isLoading$.removeListener(listener);
        ret();
      }.bind(this);
      this.isLoading$.addListener(listener);
    },
    function ahome(ret) {
      this.home();
      this.onNextLoadStop(ret);
    },
    function clearCache() {
      if ( this.inChromeApp() ) this.$.clearData({}, this.CLEAR_CACHE_OPTS);
    },
  ],

  listeners: [
    {
      name: 'onLoadCommit',
      code: function(e) {
        if ( e.isTopLevel ) {
          this.canGoBack = this.$.canGoBack();
          this.canGoForward = this.$.canGoForward();
          this.isLoading = true;
          this.publish(['action', 'navigate'], e.url);
        }
      },
    },
    {
      name: 'onLoadStop',
      code: function(e) { this.isLoading = false; },
    },
    {
      name: 'onPermissionRequest',
      code: function(e) {
        // TODO(markdittmer): Prompt user for permission.
        if ( e.permission === 'media' ||
            e.permission === 'geolocation' ||
            e.permission === 'pointerLock' ) e.request.allow();
      },
    },
  ],

  actions: [
    {
      name: 'back',
      isAvailable: function() { return this.inChromeApp(); },
      code: function() { this.$.back(); },
    },
    {
      name: 'forward',
      isAvailable: function() { return this.inChromeApp(); },
      code: function() { this.$.forward(); },
    },
    {
      name: 'home',
      code: function() { this.$.setAttribute('src', this.data.homepage); },
    },
    {
      name: 'reload',
      isAvailable: function() { return this.inChromeApp(); },
      code: function() { this.$.reload(); },
    },
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
