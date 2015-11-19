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
  name: 'ServerSignup',

  requires: [
    'com.google.ow.model.Envelope',
    //'com.google.nbuEDU.
  ],

  imports: [
    'streamDAO',
  ],

  properties: [
    {
      name: 'substreams',
      defaultValueFn: function() { return ['nbuEDUSignup']; }
    },
    {
      name: 'sid',
    },
    {
      model_: 'StringProperty',
      name: 'titleText',
      defaultValue: 'EDU-Connect Signup Server',
    },
    {
      model_: 'StringProperty',
      name: 'description',
      defaultValue: 'Responds to EDU-connect signup requests.',
    },
    {
      name: 'curriculumData_',
      hidden: true,
      defaultValue: '',
    },
  ],

  methods: [
    function put(env, sink, yourEnv) {
      var newUserId = env.owner;

      var signup = env.data;
      console.assert(signup.name_ == 'ClientSignup', "ServerSignup got a put that's not a ClientSignup!");

      // determine the curriculum streams to add
      // Fake stream TODO: change the ciXXX id used below
      this.streamDAO.put(this.Envelope.create({
        "model_": "com.google.ow.model.Envelope",
        "owner": newUserId,
        "source": this.substreams[0],
        "substreams": ["contentIndexci4873296573765766590"],
        data: this.Stream.create({
          "name": "MathVideos",
          "titleText": "Math Videos",
          "description": "Your grade level, math videos.",
          "model": "com.google.ow.content.VotableVideo",
          "contentItemView": "foam.ui.md.CitationView",
          "id": "ci4873296573765766590"
        })
      }));
    },

    // Not really used, since this runs server-side for the administrator
    function toDetailE(X) {
      var Y = X || this.Y;
      return this.Element.create(null, Y)
        .start().style({
          'display': 'flex',
          'flex-direction': 'column',
          })
          .start().style({ 'margin': '16px', 'overflow-y': 'auto' })
            .start().add(this.titleText$).cls('md-title').end()
            .start().add(this.description$).cls('md-subhead').end()
          .end()
        .end();
    },
  ],
});
