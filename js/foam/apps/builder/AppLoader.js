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
  name: 'AppLoader',
  extendsModel: 'foam.ui.View',
  traits: [
    'foam.apps.builder.TrackLaunchCloseTrait',
  ],

  documentation: function() {/*
    Used by exported App Builder apps to load the desired model and view.
  */},

  requires: [
    'com.google.analytics.AnalyticsDAO',
    'foam.core.dao.SplitDAO',
    'foam.dao.NullDAO',
    'foam.dao.ProxyDAO',
    'foam.metrics.Metric',
    'foam.ui.md.FlatButton',
    'foam.ui.md.SharedStyles',
  ],
  imports: [
    'appConfig as data',
    'document',
  ],
  exports: [
    'metricsDAO',
  ],

  constants: {
    CONFIG_PATH: 'config.json',
  },

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.configure(nu);
        this.updateView(nu);
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'delegate',
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'metricsDAO',
      factory: function() { return this.ProxyDAO.create({}, this.Y); },
    },
    {
      model_: 'foam.core.types.DAOProperty',
      type: 'com.google.analytics.AnalyticsDAO',
      name: 'appMetricsDAO',
    },
    {
      model_: 'foam.core.types.DAOProperty',
      type: 'com.google.analytics.AnalyticsDAO',
      name: 'appBuilderMetricsDAO',
    },
    {
      name: 'hasAppBuilderMetricsDAO',
      getter: function() {
        return this.data && this.data.appBuilderAnalyticsEnabled;
      },
    },
    {
      name: 'hasAppMetricsDAO',
      getter: function() {
        return this.data && this.data.analyticsId;
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'appMetricsDAOFactory',
      defaultValue: function(data) {
        if ( ! data ) return this.NullDAO.create({}, this.Y);
        return this.AnalyticsDAO.create({
          storageName: 'App-' + data.appId + '-operations',
          daoType: 'XHR',
          propertyId: data.analyticsId,
          appName: data.appName,
          appVersion: data.version,
          endpoint: 'https://www.google-analytics.com/collect',
        }, this.Y);
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'appBuilderMetricsDAOFactory',
      defaultValue: function(data) {
        if ( ! data ) return this.NullDAO.create({}, this.Y);
        return this.AnalyticsDAO.create({
          storageName: 'AppBuilder-' + data.appId + '-operations',
          daoType: 'XHR',
          debug: true,
          propertyId: 'UA-47217230-7',
          appName: data.appName,
          appVersion: data.version,
          endpoint: 'https://www.google-analytics.com/collect',
          debugEndpoint: 'https://www.google-analytics.com/debug/collect',
        }, this.Y);
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.SharedStyles.create({}, this.Y);

      // Mimic behaviour of foam.browser.BrowserView.
      this.Y.registerModel(this.FlatButton.xbind({
        displayMode: 'ICON_ONLY',
        height: 24,
        width: 24,
      }), 'foam.ui.ActionButton');
    },
    function initHTML() {
      this.SUPER();
      if ( ! this.parent ) this.document.title = this.data.appName;
    },
    function configure(data) {
      if ( ! data ) return;

      // Report analytics under category: [App ID].
      this.Y.registerModel(this.Metric.xbind({
        subType: data.appId,
      }), 'foam.metrics.Metric');

      // Change exported metricsDAO delegate, according to whether configured
      // to report metrics to user-defined analytics ID and/or App Builder Apps
      // analytics ID.
      if ( this.hasAppMetricsDAO && this.hasAppBuilderMetricsDAO ) {
        this.metricsDAO.delegate = this.SplitDAO.create({
          remote: this.appMetricsDAOFactory(data),
          delegate: this.appBuilderMetricsDAOFactory(data),
        }, this.Y);
      } else if ( this.hasAppMetricsDAO ) {
        this.metricsDAO.delegate = this.appMetricsDAOFactory(data);
      } else if ( this.hasAppBuilderMetricsDAO ) {
        this.metricsDAO.delegate = this.appBuilderMetricsDAOFactory(data);
      } else {
        this.metricsDAO.delegate = this.NullDAO.create({}, this.Y);
      }
    },
    function updateView(data) {
      this.delegate = this.X.lookup(this.data.defaultView).xbind({ data: data },
                                                                 this.Y);
      this.updateHTML();
    },
  ],

  templates: [
    function toHTML() {/*
      <app-loader id="%%id" %%cssClassAttr()>
        %%delegate()
      </app-loader>
    */},
    function CSS() {/*
      app-loader { display: block; }
    */},
  ],
});
