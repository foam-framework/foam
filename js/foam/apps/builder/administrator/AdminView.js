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
  package: 'foam.apps.builder.administrator',
  name: 'AdminView',

  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.browser.ui.BrowserView',
  ],

  exports: [
    'dao'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old ) Events.unfollow(old.browserConfig$, this.browserConfig$);
        if ( nu )  Events.follow(nu.browserConfig$, this.browserConfig$);
        nu.findAppConfig();
      }
    },
    {
      name: 'browserConfig',
      help: 'The current administrator app configuration being edited',
      postSet: function(old, nu) {
        this.updateHTML();
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <app-body id="%%id" <%= this.cssClassAttr() %>>
        $$targetAppId
        <% if ( this.browserConfig ) { %>
          $$browserConfig{ model_: 'foam.browser.ui.BrowserView' }
        <% } %>
      </app-body>
    */},
    function CSS() {/*
      app-body {
        overflow-y: auto;
      }
    */},
  ]
});
