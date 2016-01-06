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
  name: 'PreviewStream',
  extends: 'com.google.ow.content.Stream',

  requires: [
    'foam.u2.Element',
    'com.google.ow.ui.PreviewImageView',
    'foam.ui.DAOListView',
  ],

  documentation: function() {/* A stream with a 
    gallery-style citation preview. */},

  methods: [

    // TODO(markdittmer): We should use model-for-model or similar here.
    function toCitationE(X) {
      var Y = (X || this.Y).sub({'selection$': null});;
      return this.Element.create(null, Y.sub({controllerMode: 'ro'}))
        .style({ display: 'flex', 'flex-grow': 1, 'flex-direction': 'column' })
        .start().add(this.description$).style({ margin: 10 }).end()
        .add(this.DAOListView.create({
          extraClassName: 'md-flex-row',
          data: this.dao,
          rowView: this.PreviewImageView,
        }, Y))
    },
  ],
});
