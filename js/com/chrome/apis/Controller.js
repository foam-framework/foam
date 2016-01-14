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
  package: 'com.chrome.apis',
  name: 'Controller',
  extends: 'foam.browser.u2.BrowserController',
  requires: [
    'com.chrome.apis.AccessGroup',
    'com.chrome.apis.ApiKey',
    'com.chrome.apis.ApiKeyCitationView',
    'com.chrome.apis.Experiment',
    'com.chrome.apis.ExperimentActivation',
    'com.chrome.apis.ExperimentActivationCitationView',
    'com.chrome.apis.ExperimentActivationDetailView',
    'com.chrome.apis.Origin',
    'com.chrome.apis.User',
    'foam.dao.EasyDAO'
  ],

  exports: [
    'accessGroupDAO',
    'apiKeyDAO',
    'experimentActivationDAO',
    'experimentDAO',
    'menuFactory',
    'originDAO',
    'userDAO'
  ],

  properties: [
    {
      name: 'apiKeyDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.ApiKey,
          daoType: 'LOCAL',
          cache: true,
          guid: true,
          cloning: true,
          contextualize: true
        });
      }
    },
    {
      name: 'userDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.User,
          daoType: 'LOCAL',
          cache: true,
          guid: true,
          cloning: true,
          contextualize: true
        });
      }
    },
    {
      name: 'AccessGroupDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.AccessGroup,
          daoType: 'LOCAL',
          cache: true,
          guid: true,
          cloning: true,
          contextualize: true
        });
      }
    },
    {
      name: 'experimentDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Experiment,
          daoType: 'LOCAL',
          cache: true,
          guid: true,
          cloning: true,
          contextualize: true,
        });
      }
    },
    {
      name: 'originDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Origin,
          daoType: 'LOCAL',
          cache: true,
          guid: true,
          cloning: true,
          contextualize: true,
        });
      }
    },
    {
      name: 'modelName',
      type: 'String',
      defaultValue: 'origin'
    },
    {
      name: 'data',
      factory: function() {
        return this[this.modelName + 'DAO']
      }
    },
    {
      name: 'experimentActivationDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.ExperimentActivation,
          daoType: 'LOCAL',
          guid: true,
          cache: true,
          cloning: true,
          contextualize: true
        });
      }
    },
  ],

  listeners: [
    function menuFactory() {
      var entries = [
        ['Experiments', this.experimentDAO],
        ['Origins', this.originDAO]
      ];
      var e = this.Y.E();
      for (var i = 0; i < entries.length; i++) {
        e.start('div')
            .cls(this.myCls('menu-item'))
            .add(entries[i][0])
            .on('click', function(dao) {
              this.data = dao;
              e.publish(this.BrowserView.MENU_CLOSE);
            }.bind(this, entries[i][1]))
            .end();
      }
      return e;
    },
  ],

  templates: [
    function CSS() {/*
      ^menu-item {
        margin: 8px;
        padding: 8px;
      }
    */},
  ]
});
