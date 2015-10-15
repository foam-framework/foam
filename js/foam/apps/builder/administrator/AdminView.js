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

  extends: 'foam.apps.builder.AppController',

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
          this.controller.data = nu.targetAppConfig;
        }
      }
    },
    {
      name: 'controller',
      lazyFactory: function() {
        var c = this.AdminController.create();
        if ( this.data && this.data.targetAppConfig ) {
          c.data = this.data.targetAppConfig;
        }
        return c;
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <app-body id="%%id" <%= this.cssClassAttr() %>>
        %%controller
      </app-body>
    */},
    function CSS() {/*
      app-body {
        overflow-y: auto;
        position: relative;
        display: flex;
      }
    */},
  ]
});
