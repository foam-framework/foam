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

  requires: [
    'com.google.ow.model.Envelope',
  ],
  imports: [ 'streamDAO' ],

  properties: [
    'id',
    {
      type: 'StringArray',
      name: 'substreams',
    },
    {
      type: 'String',
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
    function toString() { return '[rich content]'; },
    function toSharable() {
      // HACK(markdittmer):
      // Best effort for synchronous load of most recent item; otherwise share
      // updates stream itself, hoping that recipient has access to items.
      var self = this;
      var item = this;
      var substreams = this.substreams;
      substreams.forEach(function(substream) {
        self.streamDAO.where(EQ(self.Envelope.SID, substream))
            .orderBy(DESC(self.Envelope.TIMESTAMP)).limit(1).select({
              put: function(env) {
                item = env.data;
              },
            });
      });
      return item;
    },
  ],
});
