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
  name: 'ClientSignup',

  requires: [
    'foam.u2.Element',
    'foam.u2.md.Select',
  ],

  imports: [
    'currentUser$',
    'streamDAO',
    'createStreamItem',
    'stack',
  ],

  properties: [
    {
      name: 'sid',
    },
    {
      model_: 'StringProperty',
      name: 'titleText',
      defaultValue: 'StudyBuddy Sign Up',
    },
    {
      model_: 'StringProperty',
      name: 'description',
      defaultValue: 'Please choose your location and school board:',
    },
    {
      name: 'language',
      defaultValue: 'English',
      toPropertyE: function(X) {
        return X.data.Select.create({ choices: X.data.languageDAO }, X);
      }
    },
    {
      model_: 'IntProperty',
      name: 'age',
      label: 'How many years old are you?',
      toPropertyE: function(X) {
        return X.data.Select.create({ choices: X.data.ageDAO }, X);
      }
    },
    {
      name: 'location',
      toPropertyE: function(X) {
        return X.data.Select.create({ choices: X.data.locationDAO }, X);
      }
    },
    {
      name: 'schoolBoard',
      toPropertyE: function(X) {
        return X.data.Select.create({ choices: X.data.schoolBoardDAO }, X);
      }
    },

    {
      model_: 'StringArrayProperty',
      name: 'languageDAO',
      hidden: true,
      lazyFactory: function() {
        return [
          'English',
          'Hindi',
        ];
      },
    },
    {
      model_: 'StringArrayProperty',
      name: 'schoolBoardDAO',
      hidden: true,
      lazyFactory: function() {
        return [
          'Board A',
          'Board B',
          'Board C',
        ];
      },
    },
    {
      model_: 'StringArrayProperty',
      name: 'locationDAO',
      hidden: true,
      lazyFactory: function() {
        return [
          'District 7',
          'District 8',
          'District 9',
        ];
      },
    },
    {
      model_: 'StringArrayProperty',
      name: 'ageDAO',
      hidden: true,
      lazyFactory: function() {
        return [
          [6,'6'],
          [7,'7'],
          [8,'8'],
          [9,'9'],
          [10,'10'],
          [11,'11'],
          [12,'12'],
          [13,'13'],
          [14,'14'],
          [15,'15'],
          [20,'Older. I can volunteer to help'],
        ];
      },
    }
  ],

  actions: [
    {
      name: 'done',
      code: function() {
        // save 'this' to the streamDAO for sync to the server.
        // Something on the server should be listening for the sid that
        // was set on this.
        this.streamDAO.put(this.createStreamItem(this.sid, this, this.sid));
        // change the invite text
        this.X.envelope.data.inviteComplete();
        this.streamDAO.put(this.X.envelope);

        this.stack && this.stack.popView();
      }
    },
  ],

  methods: [
    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE(X) {
      var Y = X || this.Y;
      return this.Element.create(null, Y.sub({data: this}))
        .start().style({
          'display': 'flex',
          'flex-direction': 'column',
        })
          .start().style({ 'margin': '16px', 'overflow-y': 'auto' })
            .start('p').add(this.titleText$).cls('md-title').end()
            .start('p').add(this.currentUser.displayName).cls('md-subhead').end()
            .start('p').add(this.description$).cls('md-subhead').end()
            .start().add(this.LANGUAGE).end()
            .start().style({
              'display': 'flex',
              'flex-direction': 'row',
              'align-items': 'baseline'
            })
              .start().cls('md-style-trait-standard').add(this.AGE.label).end()
              .start().add(this.AGE).style({'flex-grow':'99'}).end()
            .end()
            .start().add(this.LOCATION).end()
            .start().add(this.SCHOOL_BOARD).end()
            .add(this.DONE)
          .end()
        .end();
    },
  ],
});
