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
      model_: 'ReferenceProperty',
      name: 'merchant',
      help: 'Merchant user id.',
      defaultValue: '0',
    },
  ],

  methods: [
    function put(e) {
      this.put_(e.sid, e.data, e.source);
    },
    function put_(baseSid,order, source) {
      var merchant = this.merchant;
      var customer = source;
      var orderSid = baseSid + '/' + order.id;
      var merchantSid = orderSid + '/' + this.merchant;
      var customerSid = orderSid + '/' + customer;
      // Construct update streams for merchant and customer.
      // console.log('Putting update stream (merchant)');

      var self = this;

      if ( self.X.streamDAO !== self.streamDAO ) debugger;

      self.streamDAO.put(self.Envelope.create({
        owner: merchant,
        source: customer,
        substreams: [orderSid],
        data: self.UpdateStream.create(null, self.Y),
      }, self.Y), {
        put: function() {
          self.streamDAO.put(self.Envelope.create({
            owner: customer,
            source: customer,
            substreams: [orderSid],
            data: self.UpdateStream.create(null, self.Y),
          }, self.Y), {
            put: function() {

              self.streamDAO.put(self.Envelope.create({
                owner: customer,
                source: customer,
                sid: orderSid,
                data: order,
              }, self.Y));
            },
          });
        },
      });
    },
    function toEnvelope(X) {
      var envelope = X.envelope;
      return this.Envelope.create({
        owner: envelope.owner,
        source: envelope.owner,
        data: this,
      }, X);
    },
    function init() {
      if ( this.X.streamDAO !== this.streamDAO ) debugger;
      this.SUPER();
      if ( this.X.streamDAO !== this.streamDAO ) debugger;
    },
  ],
});
