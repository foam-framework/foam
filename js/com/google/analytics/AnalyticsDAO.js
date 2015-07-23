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
    'com.google.analytics.WebMetricsReportingDAO',
    'PersistentContext',
    'Binding',
    'foam.dao.IDBDAO',
    'foam.dao.FutureDAO'
  ],
  properties: [
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
              endpoint: this.endpoint
            })
        });
      }
    }
  ]
});
