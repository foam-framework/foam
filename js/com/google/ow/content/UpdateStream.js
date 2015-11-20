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
  name: 'UpdateStream',
  extends: 'com.google.ow.content.Stream',

  imports: [ 'streamDAO' ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'titleText',
      defaultValueFn: function() {
        return this.X.envelope ?
            this.X.envelope.owner === this.X.envelope.source ?
            'Your order' :
            'Customer order' :
            'Order';
      },
    },
  ],

  methods: [
    function put(envelope, sink, selfEnvelope) {
      // Relay envelopes put by other clients:
      // (1) Source and owner is the same (i.e., put by client),
      // (2) Owner is not my owner (i.e., put from other).
      if ( envelope.source === envelope.owner &&
          envelope.owner !== selfEnvelope.owner ) {
        this.streamDAO.put(this.Envelope.create({
          // Same owner as UpdateStream.
          owner: selfEnvelope.owner,

          // Other data copied from original.
          source: envelope.owner,
          shares: envelope.shares,
          sid: envelope.sid,
          substreams: envelope.substreams,
          data: envelope.data.clone(),
        }));
        } else {
          // console.log('*** Relay passthru envelope', envelope);
        }
    },
    function toDetailE(X) {
      return X.lookup('com.google.ow.ui.UpdateStreamDetailView').create({ data: this }, X);
    },
    function toCitationE(X) {
      return X.lookup('com.google.ow.ui.UpdateStreamCitationView').create({ data: this }, X);
    },
    function toEnvelope(X) {
      var envelope = X.envelope;
      var Envelope = X.lookup('com.google.ow.model.Envelope');
      return Envelope.create({
        substreams: X.substreams || [],
        owner: envelope.owner,
        source: envelope.owner,
        data: this,
      }, X);
    },
  ],
});
