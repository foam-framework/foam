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
  name: 'Builder',

  requires: [
    'Model',
    'com.google.analytics.AnalyticsDAO',
    'foam.apps.builder.AppLoader',
    'foam.apps.builder.BrowserConfig',
    'foam.apps.builder.ImportExportManager',
    'foam.apps.builder.dao.DAOFactory',
    'foam.apps.builder.kiosk.BrowserConfigFactory as KioskBCFactory',
    'foam.apps.builder.questionnaire.BrowserConfigFactory as QuestionnaireBCFactory',
    'foam.apps.builder.events.BrowserConfigFactory as EventsBCFactory',
    'foam.apps.builder.administrator.BrowserConfigFactory as AdminBCFactory',
    'foam.browser.ui.BrowserView',
    'foam.dao.ContextualizingDAO',
    'foam.dao.IDBDAO',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.metrics.Metric',
  ],
  exports: [
    'touchManager',
    'gestureManager',
    'metricsDAO',
    'menuSelection$',
    'menuDAO$',
    'importExportManager$',
    'modelDAO',
    'daoConfigDAO',
  ],

  properties: [
    {
      name: 'metricsDAO',
      factory: function() {
        return this.AnalyticsDAO.create({
          daoType: 'XHR',
          debug: true,
          propertyId: 'UA-47217230-6',
          appName: 'AppBuilder',
          appVersion: '2.0',
          endpoint: 'https://www.google-analytics.com/collect',
          debugEndpoint: 'https://www.google-analytics.com/debug/collect',
        });
      },
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'menuDAO',
      factory: function() {
        var dao = [
          this.KioskBCFactory.create({}, this.Y).factory(),
          this.QuestionnaireBCFactory.create({}, this.Y).factory(),
          this.EventsBCFactory.create({}, this.Y).factory(),
          this.AdminBCFactory.create({}, this.Y).factory(),
        ].dao;
        dao.model = this.BrowserConfig;
        return dao;
      }
    },
    {
      name: 'modelDAO',
      help: 'The store of models for all apps.',
      lazyFactory: function() {
        return this.ContextualizingDAO.create({
            delegate: this.IDBDAO.create({
              model: this.Model,
              name: 'DataModels',
              useSimpleSerialization: false,
          }, this.Y)
        }, this.Y);
      },
    },
    {
      name: 'daoConfigDAO',
      help: 'The store of DAO configurations for all apps.',
      lazyFactory: function() {
        return this.IDBDAO.create({
              model: this.DAOFactory,
              name: 'DAOFactories',
              useSimpleSerialization: false,
          }, this.Y)
      },
    },
    {
      type: 'foam.apps.builder.BrowserConfig',
      name: 'menuSelection',
      view: 'foam.browser.ui.BrowserView',
      defaultValueFn: function() {
        return Array.isArray(this.menuDAO) && this.menuDAO.length > 0 ?
            this.menuDAO[0] : '';
      },
    },
    {
      type: 'foam.apps.builder.ImportExportManager',
      name: 'importExportManager',
      factory: function() {
        return this.ImportExportManager.create({}, this.Y);
      },
    },
    {
      type: 'foam.input.touch.TouchManager',
      name: 'touchManager',
      lazyFactory: function() { return this.TouchManager.create(); },
    },
    {
      type: 'foam.input.touch.GestureManager',
      name: 'gestureManager',
      lazyFactory: function() { return this.GestureManager.create(); },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.metricsDAO.put(this.Metric.create({
        name: 'launchApp',
      }, this.Y));
    },
  ],
});
