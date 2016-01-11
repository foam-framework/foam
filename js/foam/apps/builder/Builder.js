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
    'foam.apps.builder.IdentityManager',
    'foam.apps.builder.ImportExportFlow',
    'foam.apps.builder.ImportExportFlowView',
    'foam.apps.builder.ImportExportManager',
    'foam.apps.builder.XHRManager',
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
    'foam.ui.md.PopupView',
    'foam.apps.builder.model.regex.EasyRegex',
  ],
  exports: [
    'appBuilderAnalyticsEnabled',
    'hasSeenDesignerView',
    'identityManager',
    'importExportManager',
    'masterAppDAO',
    'menuDAO',
    'menuSelection',
    'metricsDAO',
    'modelDAO',
    'touchManager',
  ],

  properties: [
    'onWindowClosed',
    'performance',
    {
      name: 'xhrManager',
      documentation: function() {/* Top-level XHR manager controlled by
        $$DOC{ref:'.identityManager'}. Use $$DOC{ref:'.xhrManager.Y'} as context
        for XHR-aware sub-components to ensure that its bindings make it into
        sub-component contexts. */},
      factory: function() {
        return this.XHRManager.create({}, this.Y);
      },
    },
    {
      name: 'identityManager',
      factory: function() {
        return this.IdentityManager.create({
          identity$: this.identity$,
          identities$: this.identities$,
          mode: 'WEB',
          xhrManager: this.xhrManager,
        }, this.xhrManager.Y);
      },
    },
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
        }, this.xhrManager.Y);
      },
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'menuDAO',
      lazyFactory: function() {
        var dao = [
          this.KioskBCFactory.create({}, this.xhrManager.Y).factory(),
          this.QuestionnaireBCFactory.create({}, this.xhrManager.Y).factory(),
          this.EventsBCFactory.create({}, this.xhrManager.Y).factory(),
          this.AdminBCFactory.create({}, this.xhrManager.Y).factory(),
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
        }, this.xhrManager.Y);
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
          }, this.xhrManager.Y);
      },
    },
    {
      name: 'masterAppDAO',
      help: 'All defined apps, with their dao and custom model usage.',
      lazyFactory: function() {
        var dao = this.ContextualizingDAO.create({ delegate:
            this.MDAO.create({
              model: this.AppConfig
            }, this.xhrManager.Y)
        }, this.xhrManager.Y);
        return dao;
      },
    },
    {
      name: 'menuSelection',
      view: 'foam.browser.ui.BrowserView',
      defaultValueFn: function() {
        return Array.isArray(this.menuDAO) && this.menuDAO.length > 0 ?
            this.menuDAO[0] : '';
      },
    },
    {
      name: 'importExportManager',
      factory: function() {
        return this.ImportExportManager.create({}, this.xhrManager.Y);
      },
    },
    {
      name: 'touchManager',
      lazyFactory: function() { return this.TouchManager.create(); },
    },
    {
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
      name: 'ctx',
      transient: true,
      defaultValue: null,
      postSet: function(old, nu) { this.rebindCtx(old, nu); },
    },
    {
      name: 'identity',
      defaultValue: null,
    },
    {
      type: 'Array',
      subType: 'foam.apps.builder.Identity',
      name: 'identities',
      lazyFactory: function() { return []; },
    },
    {
      type: 'Boolean',
      name: 'hasSeenDesignerView',
      defaultValue: false,
    },
    {
      type: 'Boolean',
      name: 'appBuilderAnalyticsEnabled',
      defaultValue: true,
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
    function rebindCtx(old, nu) {
      this.rebindCtxProperties(old, nu, [
        'identity$',
        'identities$',
        'hasSeenDesignerView$',
        'appBuilderAnalyticsEnabled$',
      ]);
      if ( ! this.identity ) this.createFirstIdentity();
    },
    function rebindCtxProperties(old, nu, propValueNames) {
      var i;
      if ( old ) {
        for ( i = 0; i < propValueNames.length; ++i ) {
          Events.unlink(old[propValueNames[i]], this[propValueNames[i]]);
        }
      }
      if ( nu ) {
        for ( i = 0; i < propValueNames.length; ++i ) {
          Events.link(nu[propValueNames[i]], this[propValueNames[i]]);
        }
      }
    },
    function createFirstIdentity() {
      if ( DEBUG ) {
        this.identity = this.ctx.identity;
        this.identityManager.identity = this.ctx.identity;
        return;
      }

      var flow = this.ImportExportFlow.create({
        title: 'App Builder Login',
        actionName: 'createIdentity',
      }, this.xhrManager.Y);
      var popup = this.PopupView.create({
        cardClass: 'md-card-shell',
        blockerMode: 'modal',
        delegate: 'foam.apps.builder.ImportExportFlowView',
        data: flow,
      }, this.Y);
      popup.open();
      awhile(
          function() { return ! this.identity; }.bind(this),
          this.identityManager.createIdentity.bind(this.identityManager))
      (function() {
        flow.message = 'Logged in as ' + this.identity.displayName;
        flow.details = 'App Builder successfully authenticated against your ' +
            'account with email: "' + this.identity.email + '"';
        flow.state = 'COMPLETED';
      }.bind(this));
    },
  ],
});
