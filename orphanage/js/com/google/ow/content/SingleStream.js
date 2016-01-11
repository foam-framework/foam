
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
  name: 'SingleStream',


  imports: [ 'streamDAO' ],

  properties: [
    'id',
    'substream',
    {
      type: 'StringArray',
      name: 'people',
    },
    {
      type: 'String',
      name: 'titleText',
      defaultValue: 'Conversation',
    },
    'message'
  ],

  methods: [
    function toDetailE(X) {
      return X.lookup('com.google.ow.ui.SingleStreamDetailView').create({ data: this }, X);
    },
    function toCitationE(X) {
      return X.lookup('com.google.ow.ui.SingleStreamCitationView').create({ data: this }, X);
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
