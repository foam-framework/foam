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
  name: 'VotableTrait',

  documentation: function() {/* Vote updates itself, and on the server side
    every other owner's vote (for the same stream/parent object) is notified
    to re-tally. They all operate as peers, with no central controller. */},

  requires: [
    'foam.u2.Element',
    'foam.ui.Icon',
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
      name: 'sid',
      defaultValueFn: function() { return this.id; }
    },
    {
      name: 'substreams',
      documentation: 'This model uses matching substream and sid, so all instances across owners are notified as peers when one changes.',
      defaultValueFn: function() { return [this.id]; },
    },
    {
      model_: 'StringProperty',
      name: 'titleText',
      defaultValue: 'Vote',
    },
    {
      name: 'vote',
      help: 'The client plus one/minus one vote',
      defaultValue: 0,
    },
    {
      model_: 'IntProperty',
      name: 'tally',
      defaultValue: 0,
    },
    {
      model_: 'IntProperty',
      name: 'count',
      defaultValue: 0,
    },
  ],

  actions: [
    {
      name: 'voteUp',
      label: 'Vote Up',
      ligature: 'thumb up',
      isEnabled: function() { return this.vote < 1; },
      code: function(action) {
        // this is a client action, so X.envelope is available on the context
        console.assert(this.envelope, "X.envelope not found! Vote can't update its envelope.");
        console.assert(this.envelope.data === this, "X.envelope doesn't contain this JS object");

        // propagate change to server
        this.vote = 1;
        this.streamDAO.put(this.envelope);
      },
    },
    {
      name: 'voteDown',
      label: 'Vote Down',
      ligature: 'thumb down',
      isEnabled: function() { return this.vote > -1; },
      code: function(action) {
        // this is a client action, so X.envelope is available on the context
        console.assert(this.envelope, "X.envelope not found! Vote can't update its envelope.");
        console.assert(this.envelope.data === this, "X.envelope doesn't contain this JS object");

        // propagate change to server
        this.vote = -1;
        this.streamDAO.put(this.envelope);
      },
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

    // TODO(markdittmer): We should use model-for-model or similar here.
    function toVoteE(X) {
      /* Client: render a UI */
      if ( X.envelope ) this.envelope = X.envelope; // TODO: propagate envelope better

      var Y = (X || this.Y).sub({ data: this });
      return this.Element.create(null, Y.sub({controllerMode: 'read-only'}))
        .start().style({
          'display': 'flex',
          'flex-direction': 'row',
          'margin': '8px',
          'border': '1px solid black'
        })
          .add(this.VOTE_UP)
          .add(this.VOTE_DOWN)
          .add(this.TALLY).add("/").add(this.COUNT)
        .end()
    },
  ],
});
