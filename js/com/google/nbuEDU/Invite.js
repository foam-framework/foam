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
    'com.google.nbuEDU.ClientSignup'
  ],

  imports: [ 'dynamic' ],

  properties: [
    {
      name: 'id'
    },
    [ 'name', 'unused' ],
    {
      name: 'signupSid',
      help: 'Add an envelope with this sid to complete signup.',
      defaultValue: 'nbuEDUSignup'
    },
    {
      type: 'String',
      name: 'titleText',
      defaultValue: 'StudyBuddy: Help with School'
    },
    {
      type: 'String',
      name: 'description',
      defaultValue: '<p>You are invited to join the StudyBuddy community.</p><p>Tap this card to get help with school.</p>'
    },
    ['resetInviteTitle', 'StudyBuddy'],
    ['resetInviteText', '<p>Welcome! You have already enrolled.</p> <p>Tap this card to see your profile.</p>'],
    ['complete', false]
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
        self.dynamic(function() { //return ( self.complete ) ?
          var nY = ( self.complete ) ? Y.sub({controllerMode: 'ro'}) : Y
          //self.toCitationE(Y).add("TODO: show control panel stuff here") :
          return self.ClientSignup.create({ sid: self.signupSid }, nY).toDetailE(nY);
        }, self.complete$)
      );
    },
    function toCitationE(X) {
      var Y = X || this.Y;
      return this.Element.create(null, Y)
        .start().style({ 'display': 'flex', 'flex-direction': 'column', margin: '16px' })
            .start().add(this.description$).cls('md-subhead').end()
        .end()
    }
  ]
});
