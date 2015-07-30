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
  extendsModel: 'foam.dao.ProxyDAO',
  requires: [
    'Binding',
    'PersistentContext',
    'com.google.analytics.WebMetricsReportingDAO',
    'com.google.analytics.XHRMetricsReportingDAO',
    'foam.core.dao.SplitDAO',
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
      model_: 'BooleanProperty',
      name: 'debug',
      defaultValue: false
    },
    {
      model_: 'StringProperty',
      name: 'propertyId'
    },
    {
      model_: 'StringProperty',
      name: 'appName'
    },
    {
      model_: 'StringProperty',
      name: 'appId'
    },
    {
      model_: 'StringProperty',
      name: 'appVersion'
    },
    {
      model_: 'StringProperty',
      name: 'endpoint',
      defaultValue: 'http://www.google-analytics.com/collect'
    },
    {
      model_: 'StringProperty',
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
      name: 'delegate',
      factory: function() {
        return this.FutureDAO.create({
          future: this.persistentContext.bindObject(
            'analyticsDAO', this.WebMetricsReportingDAO, {
              propertyId: this.propertyId,
              appName: this.appName,
              appId: this.appId,
              appVersion: this.appVersion,
              endpoints: this.debug ?
                  [this.endpoint, this.debugEndpoint] :
                  [this.endpoint]
            })
        });
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.X.dynamic(
          function() { this.debug; this.endpoint; this.debugEndpoint; }.bind(this),
          function() {
            this.delegate.endpoints = this.debug ?
                [this.endpoint, this.debugEndpoint] :
                [this.endpoint];
          }.bind(this));
    }
  ]
});
