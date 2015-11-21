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

  imports: [ 'streamDAO' ],

  properties: [
    'id',
    {
      model_: 'StringArrayProperty',
      name: 'substreams',
    },
    {
      model_: 'StringProperty',
      name: 'titleText',
      defaultValue: 'Order',
    },
  ],

  methods: [
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
        owner: envelope.owner,
        source: envelope.owner,
        data: this,
      }, X);
    },
  ],
});
