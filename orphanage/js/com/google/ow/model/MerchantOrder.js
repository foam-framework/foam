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
  package: 'com.google.ow.model',
  name: 'MerchantOrder',
  extends: 'com.google.ow.model.Order',

  requires: [
    'com.google.ow.model.Envelope',
    'com.google.ow.model.OrderItem',
    'com.google.ow.model.Product',
    'foam.dao.EasyDAO',
  ],

  methods: [
    function toE(X) {
      return X.lookup('com.google.ow.ui.MerchantOrderSummaryView').create({ data: this }, X);
    },
    function toSummaryE(X) {
      return X.lookup('com.google.ow.ui.MerchantOrderSummaryView').create({ data: this }, X);
    },
    function toDetailE(X) {
      return X.lookup('com.google.ow.ui.MerchantOrderDetailView').create({ data: this }, X);
    },
    function toCitationE(X) {
      return X.lookup('com.google.ow.ui.MerchantOrderCitationView').create({ data: this }, X);
    },
  ],

});
