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
  package: 'com.google.ow.content',
  name: 'OrderStream',
  extends: 'com.google.ow.content.Stream',

  requires: [
    'com.google.ow.content.UpdateStream',
    'com.google.ow.model.Envelope',
    'com.google.ow.model.Order',
  ],
  imports: [
    'streamDAO',
  ],

  properties: [
    {
      type: 'Reference',
      name: 'merchant',
      help: 'Merchant user id.',
      defaultValue: '0',
    },
  ],

  methods: [
    function put(e) {
      var orderSid = e.data;
      // Construct stream for merchant.
      this.streamDAO.put(this.Envelope.create({
        owner: this.merchant,
        source: e.source,
        substreams: [orderSid],
        data: this.UpdateStream.create(),
      }));
      // HACK(markdittmer): Notify put on existing stream items to trigger
      // new stream.
      var orders = [];
      this.streamDAO.where(EQ(this.Envelope.SID, orderSid))
          .select(orders)(function() {
            for ( var i = 0; i < orders.length; ++i ) {
              this.streamDAO.put(orders[i]);
            }
          }.bind(this));
    },
    function toEnvelope(X) {
      var envelope = X.envelope;
      return this.Envelope.create({
        owner: envelope.owner,
        source: envelope.owner,
        data: this,
      }, X);
    },
  ],
});
