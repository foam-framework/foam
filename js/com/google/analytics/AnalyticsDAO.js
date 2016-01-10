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
  name: 'AnalyticsDAO',
  package: 'com.google.analytics',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'Binding',
    'PersistentContext',
    'com.google.analytics.WebMetricsReportingDAO',
    'com.google.analytics.XHRMetricsReportingDAO',
    'foam.core.dao.DelayedPutDAO',
    'foam.core.dao.SerialPutDAO',
    'foam.core.dao.StoreAndForwardDAO',
    'foam.dao.FutureDAO',
    'foam.dao.IDBDAO'
  ],
  properties: [
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'daoType',
      defaultValue: 'WEB',
      choices: [
        ['WEB', 'Web'],
        ['XHR', 'XHR']
      ],
    },
    {
      type: 'Boolean',
      name: 'debug',
      defaultValue: false
    },
    {
      type: 'String',
      name: 'propertyId'
    },
    {
      type: 'String',
      name: 'appName'
    },
    {
      type: 'String',
      name: 'appId'
    },
    {
      type: 'String',
      name: 'appVersion'
    },
    {
      type: 'String',
      name: 'endpoint',
      defaultValue: 'http://www.google-analytics.com/collect'
    },
    {
      type: 'String',
      name: 'debugEndpoint',
      defaultValue: 'https://www.google-analytics.com/debug/collect'
    },
    {
      name: 'persistentContext',
      factory: function() {
        var context = {};
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({
            model: this.Binding,
            name: 'AnalyticsDAO-Bindings'
          }),
          predicate: NOT_TRANSIENT,
          context: context
        });
      }
    },
    {
      name: 'metricsFutureDAO',
      factory: function() {
        return this.FutureDAO.create({
          future: this.persistentContext.bindObject(
              'analyticsDAO',
              this.daoType === 'XHR' ? this.XHRMetricsReportingDAO :
                  this.WebMetricsReportingDAO, {
                    propertyId: this.propertyId,
                    appName: this.appName,
                    appId: this.appId,
                    appVersion: this.appVersion,
                    endpoints: this.debug ?
                        [this.endpoint, this.debugEndpoint] :
                        [this.endpoint]
                  })
        });
      },
    },
    {
      name: 'storageName',
      transient: true,
      defaultValue: 'AnalyticsDAO-operations'
    },
    {
      name: 'delegate',
      factory: function() {
        return this.StoreAndForwardDAO.create({
          storageName: this.storageName,
          delegate:
          this.SerialPutDAO.create({
            delegate: this.DelayedPutDAO.create({
              rowDelay: 500,
              delegate: this.metricsFutureDAO,
            }),
          }),
        });
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.X.dynamicFn(
          function() { this.debug; this.endpoint; this.debugEndpoint; }.bind(this),
          function() {
            this.metricsFutureDAO.future(function(metricsDAO) {
              metricsDAO.endpoints = this.debug ?
                [this.endpoint, this.debugEndpoint] :
                [this.endpoint];
            }.bind(this));
          }.bind(this));
    }
  ]
});
