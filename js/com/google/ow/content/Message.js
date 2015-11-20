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
  name: 'Message',

  requires: [
    'foam.u2.Element',
  ],

  imports: [
    'streamDAO',
  ],

  properties: [
    {
      name: 'id'
    },
    {
      name: 'sid',
    },
    {
      name: 'from',
    },
    {
      model_: 'StringProperty',
      name: 'content',
    },
    {
      name: 'name',
    }
  ],

  methods: [
    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE(X) {
      var Y = (X || this.Y);
      this.envelope_ = X.envelope;
      return this.Element.create(null, Y)
        .start().style({
          'display': 'flex',
          'flex-direction': 'column',
        })
          .start().style({ 'margin': '8px' })
            .start().add(this.from$).cls('md-subhead').end()
            .start().add(this.content$).cls('md-body md-grey').end()
          .end()
        .end();
    },
    function toCitationE(X) {
      return this.toDetailE(X);
    },
  ],
});
