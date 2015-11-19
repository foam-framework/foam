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
  name: 'CommentThread',
  extends: 'com.google.ow.content.Stream'

  documentation: function() {/* A stream of comments with a flat list of
    replies under each. TODO: Not done yet! */},

  requires: [
    'foam.u2.Element',
    'foam.ui.Icon',
    'com.google.ow.content.
  ],

  exports: [
    'this as data',
  ],

  imports: [
    'envelope', // used client-side
    'streamDAO',
  ],

  properties: [
    {
      name: 'model',
      defaultValue: '
    },
    {
      name: 'substreams',
      documentation: 'This model uses matching substream and sid, so all instances across owners are notified as peers when one changes.',
      defaultValueFn: function() { return [this.id]; },
    },
    {
      model_: 'StringProperty',
      name: 'titleText',
      defaultValue: 'Ask a Question',
    },
  ],

  methods: [
    function put(envelope, sink) {
      /* Server: this is a substream target, implement put handler */
      var self = this;
      // Since this should be running on the server, grab all the owners
      // of this vote, based on stream id, tally it up, update self.tally.
      // Note that all the other votes are also notified, so we do this tally
      // once for each owner, which is wasteful.
      // Also note that since new vote instances default to zero, we don't care
      // if this gets copied and shared, since it will get included in the tallies
      // once it changes from zero and is put back to streamDAO on the client.
      self.tally = 0;
      self.count = 0;
      self.streamDAO.where(EQ(self.Envelope.SID, self.sid)).select({
        put: function(vote) {
          self.tally += vote.vote;
          self.count += 1;
        },
        eof: function() {
          console.assert(envelope.vote === this, "Vote.put envelope does not contain this!");
          self.streamDAO.put(envelope); // check that sync is inc'd
        },
      });
    },

  ],
});
