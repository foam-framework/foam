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
  ],

  methods: [
    function put(env, sink, yourEnv) {


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
