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
    'foam.apps.builder.administrator.AdminDetailView',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.browser.ui.BrowserView',
  ],

  exports: [
    'dao'
  ],

  properties: [
    {
      name: 'dao',
      help: 'The store of items to administer.',
      lazyFactory: function() {
        return this.data.dao.factory(this.Y);
      }
    },
    {
      name: 'content',
      help: 'The current administrator app configuration being edited',
      view: 'foam.browser.ui.BrowserView',
      getter: function() {
        return this.data.browserConfig;
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <app-body id="%%id" <%= this.cssClassAttr() %>>
        $$content
      </app-body>
    */},
    function CSS() {/*
      app-body {
        overflow-y: auto;
      }
    */},
  ]
});
