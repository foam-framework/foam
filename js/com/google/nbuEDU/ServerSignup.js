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
    'foam.u2.Element',
    'com.google.ow.content.PreviewStream',
    'com.google.ow.content.CommentThreadStream'
  ],

  imports: [
    'streamDAO'
  ],

  properties: [
    {
      name: 'substreams',
      defaultValueFn: function() { return ['nbuEDUSignup']; }
    },
    'sid',
    {
      type: 'String',
      name: 'titleText',
      defaultValue: 'StudyBuddy Signup Server'
    },
    {
      type: 'String',
      name: 'description',
      defaultValue: 'Responds to StudyBuddy signup requests.'
    },
    {
      name: 'curriculumData_',
      hidden: true,
      defaultValue: ''
    },
  ],

  methods: [
    function put(env, sink, yourEnv) {
      console.log("ServerSignup put", env.owner);

      var self = this;
      var newUserId = env.owner;

      var signup = env.data;
      console.assert(signup.name_ == 'ClientSignup', "ServerSignup got a put that's not a ClientSignup!");
      self.streamDAO.where(
        AND(
          EQ(self.Envelope.SOURCE, self.substreams[0]+"ServerSignup"),
          EQ(self.Envelope.OWNER, newUserId)),
          EQ(self.Envelope.SUBSTREAMS, "eduVidStream487673295")
        )
      .select(COUNT())(function(count) {
//          console.log("Count: ", count.count);
        if (count.count <= 0) {
          // IF not added already, add some streams:
          // determine the curriculum streams to add
          // Fake stream
          self.streamDAO.put(self.Envelope.create({
            model_: "com.google.ow.model.Envelope",
            "owner": newUserId,
            "source": self.substreams[0]+"ServerSignup",
            "substreams": ["eduVidStream487673295"],
            data: self.PreviewStream.create({
              "name": "MathVideos",
              "titleText": "Math Videos for grade 7",
              "description": "Suggested videos for Math:",
              "model": "com.google.ow.content.VotableVideo",
              "contentItemView": "foam.ui.md.CitationView",
              "id": "eduVidStream487673295"
            })
          }));

          self.streamDAO.put(self.Envelope.create({
            model_: "com.google.ow.model.Envelope",
            "owner": newUserId,
            "source": self.substreams[0]+"ServerSignup",
            "substreams": ["eduVidStream487673295"],
            data: self.PreviewStream.create({
              "name": "ExamPrepVideos",
              "titleText": "Exam preparation Videos for grade 7",
              "description": "Suggested videos to prepare for exams:",
              "model": "com.google.ow.content.VotableVideo",
              "contentItemView": "foam.ui.md.CitationView",
              "id": "eduVidStream487673295"
            })
          }));


          var commentStream = self.CommentThreadStream.create({
              "name": "GradeChatroom",
              "titleText": "Grade 7 Quick Chat",
              "description": "Tap here to talk to others in your grade.",
              "model": "com.google.ow.content.CommentThread",
              "id": "eduCommentsForum754788392995",
            });
          self.streamDAO.put(self.Envelope.create({
            model_: "com.google.ow.model.Envelope",
            "owner": newUserId,
            "source": self.substreams[0]+"ServerSignup",
            "substreams": ["eduCommentsForum754788392995"],
            data: commentStream,
          }));


        }
      });
    },

    // Not really used, since this runs server-side for the administrator
    function toCitationE(X) {
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
    }
  ]
});
