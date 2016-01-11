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
  package: 'com.google.mail',
  name: 'SplitDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.core.dao.StripPropertiesDAO',
    'com.google.mail.GMailMessageDAO',
    'com.google.mail.GMailToEMailDAO'
  ],
  properties: [
    {
      name: 'remote',
      factory: function() {
        return this.StripPropertiesDAO.create({
          propertyNames: ['serverVersion'],
          delegate: this.GMailToEMailDAO.create({
            delegate: this.GMailMessageDAO.create({})
          })
        });
      }
    },
    {
      name: 'queryCache',
      factory: function() {
        return {};
      }
    },
    {
      type: 'Int',
      name: 'ttl',
      units: 's',
      defaultValue: 30
    }
  ],
  methods: {
    select: function(sink, options) {
      if ( !options || ! Number.isFinite(options.limit) ) {
        // Only split if given a limit.
        return this.SUPER(sink, options);
      }

      var query = options && options.query;
      var order = options && options.order;

      var queryMql = query && query.toMQL();
      var orderMql = order && order.toMQL();

      if ( queryMql == this.lastQuery && orderMql == this.lastOrder) {
        return this.SUPER(sink, options);
      }

console.log("Doing query: ", queryMql, " order: ", orderMql);

      this.lastQuery = query;
      this.lastOrder = orderMql;
      var dao = this.remote;
      if ( query ) dao = dao.where(query);
// network dao doesn't support ordering.
//      if ( order ) dao = dao.orderBy(order);
      if ( options.skip ) dao = dao.skip(options.skip);
      dao = dao.limit(options.limit);

      dao.select(this.delegate);
      return this.SUPER(sink, options);
    }
  }
});
