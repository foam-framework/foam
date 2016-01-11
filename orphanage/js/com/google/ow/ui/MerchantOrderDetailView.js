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
  package: 'com.google.ow.ui',
  name: 'MerchantOrderDetailView',
  extends: 'com.google.ow.ui.OrderDetailView',

  imports: [ 'dynamic', 'streamDAO' ],

  properties: [
    'customer',
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.getPerson(nu.customer, this.customer$);
      },
    },
  ],

  methods: [
    function titleE(prev) {
      return prev.start('div').cls('heading').cls('md-headline')
            .add('Order (')
            .add(this.dynamic(function(customer) {
              return customer ? customer.displayName : '';
            }.bind(this), this.customer$))
            .add(')')
          .end();
    },
    function mainE(prev) {
      return this.SUPER(prev)
          .start('span').x({ controllerMode: 'view' }).add(this.data.METHOD_OF_PAYMENT).end()
          .start('span').x({ controllerMode: 'view' }).add(this.data.STATUS).end();
    },
    function actionsE(prev) {
      return this.SUPER(prev)
          .add(this.ACCEPT)
          .add(this.NOTIFY)
          .add(this.DELIVER);
    }
  ],

  actions: [
    {
      name: 'accept',
      ligature: 'file_download',
      code: function(X) {
        this.status = 'ACCEPTED';
        X.streamDAO.put(this.toEnvelope(X.sub({ sid: X.envelope.sid })));
      },
      isAvailable: function() {
        return this.status === 'PENDING' || this.status === 'SUBMITTED';
      }
    },
    {
      name: 'notify',
      ligature: 'done',
      code: function(X) {
        this.status = 'READY';
        X.streamDAO.put(this.toEnvelope(X.sub({ sid: X.envelope.sid })));
      },
      isAvailable: function() {
        return this.status === 'ACCEPTED';
      }
    },
    {
      name: 'deliver',
      ligature: 'done_all',
      code: function(X) {
        this.status = 'DELIVERED';
        X.streamDAO.put(this.toEnvelope(X.sub({ sid: X.envelope.sid })));
      },
      isAvailable: function() {
        return this.status === 'READY';
      }
    }
  ]
});
