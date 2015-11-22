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
  name: 'Notification',

  requires: [
    'foam.u2.Element',
    'com.google.plus.ui.PersonChipView',
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
      model_: 'StringProperty',
      name: 'content',
    },
    {
      name: 'name',
    },
    {
      name: 'source',
    },
    {
      name: 'count',
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
          'padding-left': '4px',
          'margin': '8px',
          'background-color': '#ffdddd',
        })
          .start().style({ 'margin': '8px' })
            .start().add(this.content$).cls('md-body md-grey').end()
            .start().add(this.count$).cls('md-body').end()
          .end()
        .end();
    },
    function toCitationE(X) {
      return this.toDetailE(X);
    },
  ],
});
