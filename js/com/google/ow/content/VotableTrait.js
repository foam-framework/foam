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

  requires: [
    'com.google.ow.model.Envelope',
    'com.google.ow.content.Vote',
  ],

  imports: [
    'streamDAO',
    'currentUser',
  ],

  properties: [
    {
      name: 'id'
    },
    {
      name: 'vote',
      factory: function() {
        // create vote instance, keyed on this.id
        var vote = this.Vote.create({
          id: this.id+"Vote",
          sid: this.id+"Vote",
        });
        // put to streamDAO to sync it
        this.streamDAO.put(this.Envelope.create({
          source: this.id,
          owner: this.currentUser.id,
          sid: vote.sid,
          data: vote,
        }), {
          put: function(puttedVote) {
            this.vote = puttedVote;
          }.bind(this)
        });
        return vote;
      }
    },
  ],


});
