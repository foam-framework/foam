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
  package: 'com.google.nbuEDU',
  name: 'Invite',

  requires: [
    'foam.u2.Element',
    'com.google.nbuEDU.ClientSignup',
  ],

  properties: [
    {
      name: 'id'
    },
    [ 'name', 'unused' ],
    {
      name: 'signupSid',
      help: 'Add an envelope with this sid to complete signup.',
      defaultValue: 'nbuEDUSignup',
    },
    {
      model_: 'StringProperty',
      name: 'titleText',
      defaultValue: 'nbuEDU-Connect: Help with School',
    },
    {
      model_: 'StringProperty',
      name: 'description',
      defaultValue: 'You are invited to join the EDU-Connect community. <br/>Tap this card to get help with school.'
    },
    ['resetInviteTitle', 'nbuEDU-Connect'],
    ['resetInviteText', 'Welcome! You have already enrolled.'],
    ['complete', false],
  ],

  methods: [
    function inviteComplete() {
      this.titleText = this.resetInviteTitle;
      this.description = this.resetInviteText;
      this.complete = true;
    },

    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE(X) {
      var self = this;
      var Y = (X || self.Y);
      return self.Element.create(null, Y).add(
        function() { return ( self.complete ) ?
          self.toCitationE(Y).add("TODO: show control panel stuff here") :
          self.ClientSignup.create({ sid: self.signupSid }, Y).toDetailE(Y)
        }.on$(self.complete)
      );
    },
    function toCitationE(X) {
      var Y = X || this.Y;
      return this.Element.create(null, Y)
        .start().style({ 'display': 'flex', 'flex-direction': 'column', margin: '16px' })
            .start().add(this.description$).cls('md-subhead').end()
        .end()
    },
  ],
});
