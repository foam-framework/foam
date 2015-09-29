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
    'foam.apps.builder.administrator.AdminController',
  ],

  exports: [
    'dao'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( this.controller && nu && nu.targetAppConfig ) {
          this.controller.targetAppConfig = nu.targetAppConfig;
        }
      }
    },
    {
      name: 'controller',
      lazyFactory: function() {
        var c = this.AdminController.create();
        Events.follow(c.browserConfig$, this.browserConfig$);
        if ( this.data && this.data.targetAppConfig ) {
          c.targetAppConfig = this.data.targetAppConfig;
        }
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
