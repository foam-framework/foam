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
  traits: [
    'foam.apps.builder.TrackLaunchCloseTrait',
  ],

  requires: [
    'Binding',
    'MDAO',
    'Model',
    'PersistentContext',
    'com.google.analytics.AnalyticsDAO',
    'foam.apps.builder.AppBuilderContext',
    'foam.apps.builder.AppConfig',
    'foam.apps.builder.AppLoader',
    'foam.apps.builder.BrowserConfig',
    'foam.apps.builder.ImportExportManager',
    'foam.apps.builder.administrator.BrowserConfigFactory as AdminBCFactory',
    'foam.apps.builder.dao.DAOFactory',
    'foam.apps.builder.events.BrowserConfigFactory as EventsBCFactory',
    'foam.apps.builder.kiosk.BrowserConfigFactory as KioskBCFactory',
    'foam.apps.builder.questionnaire.BrowserConfigFactory as QuestionnaireBCFactory',
    'foam.browser.ui.BrowserView',
    'foam.dao.ContextualizingDAO',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.metrics.Metric',
    'foam.ui.md.FlatButton',
  ],
  exports: [
    'daoConfigDAO',
    'gestureManager',
    'importExportManager$',
    'masterAppDAO',
    'menuDAO$',
    'menuSelection$',
    'metricsDAO',
    'modelDAO',
    'ctx$ as persistentContext$',
    'touchManager',
  ],

  properties: [
    'onWindowClosed',
    'performance',
    {
      name: 'metricsDAO',
      lazyFactory: function() {
        return this.AnalyticsDAO.create({
          daoType: 'XHR',
          debug: true,
          propertyId: 'UA-47217230-6',
          appName: 'AppBuilder',
          appVersion: '2.0',
          endpoint: 'https://www.google-analytics.com/collect',
          debugEndpoint: 'https://www.google-analytics.com/debug/collect',
        }, this.Y);
      },
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'menuDAO',
      lazyFactory: function() {
        var dao = [
          this.KioskBCFactory.create({}, this.Y).factory(),
          this.QuestionnaireBCFactory.create({}, this.Y).factory(),
          this.EventsBCFactory.create({}, this.Y).factory(),
          this.AdminBCFactory.create({}, this.Y).factory(),
        ].dao;
        dao.model = this.BrowserConfig;

        // pipe each app type's dao into our master list
        var master = this.masterAppDAO;
        dao.forEach(function(d) {
          d.dao && d.dao.pipe(master);
        });

        return dao;
      }
    },
    {
      name: 'modelDAO',
      help: 'The store of models for all apps.',
      lazyFactory: function() {
        // extract the models out of the master list of apps
        var dao = this.MDAO.create({
          model: Model,
        }, this.Y);
        this.masterAppDAO
          .where(HAS(this.AppConfig.DATA_CONFIGS))
          .pipe(MAP(function(appCfg) { // dump models
            for (var i = 0; i < appCfg.dataConfigs.length; ++i) {
              dao.put(appCfg.dataConfigs[i].model);
            }
          }));
        return dao;
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
          }, this.Y);
      },
    },
    {
      name: 'masterAppDAO',
      help: 'All defined apps, with their dao and custom model usage.',
      lazyFactory: function() {
        var dao = this.ContextualizingDAO.create({ delegate:
            this.MDAO.create({
              model: this.AppConfig
            }, this.Y)
        }, this.Y);
        return dao;
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
    {
      name: 'persistentContext',
      transient: true,
      lazyFactory: function() {
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({ model: this.Binding }),
          predicate: NOT_TRANSIENT,
          context: this
        });
      },
    },
    {
      type: 'foam.apps.builder.AppBuilderContext',
      name: 'ctx',
      transient: true,
      defaultValue: null,
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.Y.registerModel(this.FlatButton.xbind({
        displayMode: 'LABEL_ONLY',
      }), 'foam.ui.ActionButton');
      this.persistentContext.bindObject('ctx', this.AppBuilderContext,
                                        undefined, 1);
    },
  ],
});
