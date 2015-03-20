/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'Background',
  package: 'foam.apps.quickbug.controller',

  requires: [
    'foam.apps.quickbug.model.QBug',
    'foam.oauth2.AutoOAuth2',
    'foam.apps.quickbug.ui.ChromeAppBrowser',
    'foam.core.dao.ChromeSyncStorageDAO',
    'foam.input.touch.TouchManager',
    'foam.dao.NullDAO',
    'foam.dao.IDBDAO',
    'foam.dao.DAOVersion'
  ],

  exports: [
    'metricDAO',
    'daoVersionDao'
  ],

  properties: [
    {
      name: 'daoVersionDao',
      lazyFactory: function() { return this.IDBDAO.create({ model: this.DAOVersion }); }
    },
    {
      name: 'autoOAuth2',
      factory: function() { return this.AutoOAuth2.create(); }
    },
    {
      name: 'metricDAO',
      factory: function() {
        return this.NullDAO.create();
      }
    },
    {
      name: 'qb',
      factory: function() {
        return this.QBug.create();
      }
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args)
      if ( chrome.app && chrome.app.runtime ) {
        chrome.app.runtime.onLaunched.addListener(this.onLaunched);
        chrome.runtime.onMessageExternal.addListener(this.onMessageExternal);
      }
    },
    launch: function(varargs){
      this.qb.launchBrowser.apply(this.qb, arguments);
    }
  },
  listeners: [
    {
      name: 'onLaunched',
      code: function() {
        this.launch();
      }
    },
    {
      name: 'onMessageExternal',
      code: function(msg) {
        if ( msg && msg.type === 'openUrl' ) {
          // Extract the project name and call launchBrowser.
          var start = msg.url.indexOf('/p/') + 3;
          var end = msg.url.indexOf('/', start);
          var project = msg.url.substring(start, end);
          this.launch(project, msg.url);
        }
      }
    }
  ]
});
