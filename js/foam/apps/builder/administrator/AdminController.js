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
  name: 'AdminController',

  extends: 'foam.apps.builder.AppController',

  requires: [
    'foam.browser.BrowserConfig',
    'foam.browser.ui.BrowserView',
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( nu && old !== nu &&
            old.appId !== nu.appId ) {

          // TODO(jacksonic): support multiple DataConfigs, not just the primary one
          this.browserConfig = this.BrowserConfig.create({
            title: nu.appName,
            label: nu.appName,
            model: nu.getDataConfig().model,
            dao: nu.createDAO(),
            detailView: {
              factory_: 'foam.ui.md.UpdateDetailView',
              liveEdit: true,
              minWidth: 600,
              preferredWidth: 10000
            },
            innerDetailView: { factory_: 'foam.apps.builder.AppConfigActionsView',
              delegate: 'foam.ui.md.DetailView' // per app editor view, or specialized per model?
            },
          });

        }
      }
    },
    {
      name: 'browserConfig',
      postSet: function(old,nu) {
        this.updateHTML();
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <% if ( this.data ) { %>
          $$browserConfig{ model_: 'foam.browser.ui.BrowserView' }
        <% } %>
      </div>
    */},
  ],



});
