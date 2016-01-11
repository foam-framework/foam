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
    'com.google.ow.model.Envelope',
    'foam.u2.md.QuickActionButton'
  ],

  exports: [
    'this as data'
  ],

  imports: [
    'envelope', // used client-side
    'streamDAO'
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
      type: 'String',
      name: 'titleText',
      defaultValue: 'Vote'
    },
    {
      type: 'Int',
      name: 'vote',
      help: 'The client plus one/minus one vote',
      defaultValue: 0
    },
    {
      type: 'Int',
      name: 'tally',
      factory: function() { return Math.floor(Math.random() * 1000); }
    },
    {
      type: 'Int',
      name: 'count',
      factory: function() { return Math.floor(Math.random() * 1000); }
    },
  ],

  actions: [
    {
      name: 'voteUp',
      label: 'Vote Up',
      ligature: 'thumb_up',
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
      ligature: 'thumb_down',
      isEnabled: function() { return this.vote > -1; },
      code: function(action) {
        // this is a client action, so X.envelope is available on the context
        console.assert(this.envelope, "X.envelope not found! Vote can't update its envelope.");
        console.assert(this.envelope.data === this, "X.envelope doesn't contain this JS object");

        // propagate change to server
        this.vote = -1;
        this.streamDAO.put(this.envelope);
      }
    }
  ],

  methods: [
    function put(envelope, sink, yourEnvelope) {
      /* Server: this is a substream target, implement put handler */
      console.log("VotablePut");

      var self = this;
      // Since this should be running on the server, grab all the owners
      // of this vote, based on stream id, tally it up, update self.tally.
      // Note that all the other votes are also notified, so we do this tally
      // once for each owner, which is wasteful.
      // Also note that since new vote instances default to zero, we don't care
      // if this gets copied and shared, since it will get included in the tallies
      // once it changes from zero and is put back to streamDAO on the client.
      var originalTally = self.tally;
      var originalCount = self.count;

      self.tally = 0;
      self.count = 0;
      self.streamDAO.where(EQ(self.Envelope.SID, self.sid)).select({
        put: function(vote) {
          //console.log("Tally", self.tally, self.count, vote.data.vote);
          self.tally += vote.data.vote;
          self.count += 1;
        },
        eof: function() {
          if ( self.tally == originalTally && originalCount == self.count ) return; // don't save if no change

          console.assert(yourEnvelope.data.id === self.id, "Vote.put yourEnvelope does not contain this!");
          yourEnvelope.data = self;
          self.streamDAO.put(yourEnvelope); // check that sync is inc'd
        }
      });
    },

    // TODO(markdittmer): We should use model-for-model or similar here.
    function toVoteE(X) {
      /* Client: render a UI */
      if ( X.envelope ) this.envelope = X.envelope; // TODO: propagate envelope better

      var Y = (X || this.Y).sub({ data: this });
      Y.registerModel(this.QuickActionButton, 'foam.u2.ActionButton');
      return this.Element.create(null, Y.sub({controllerMode: 'rw'}))
        .start().style({
          'display': 'flex',
          'flex-direction': 'row',
          'margin': '8px',
        })
          .add(this.VOTE_UP)
          .add(this.VOTE_DOWN)
          .start().cls('md-style-trait-standard').cls('md-subhead').add(this.tally).add("/").add(this.count).end()
        .end()
    }
  ]
});
