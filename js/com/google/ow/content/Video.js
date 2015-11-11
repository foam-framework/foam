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
  name: 'Video',

  requires: [
    'foam.u2.Element',
    'foam.ui.ImageView',
  ],

  properties: [
    {
      name: 'id'
    },
    {
      model_: 'StringProperty',
      name: 'titleText'
    },
    {
      model_: 'StringProperty',
      name: 'description'
    },
    {
      model_: 'URLProperty',
      name: 'content',
    },
    {
      model_: 'ImageProperty',
      name: 'preview',
    },
  ],

  methods: [
    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE() {
      return this.Element.create(null, this.Y.sub({controllerMode: 'read-only'}))
        .start().style({
          'display': 'flex',
          'flex-direction': 'column',
          'margin': '16px'
        })
          .start().add(this.titleText$).cls('md-title').end()
          .start().add(this.description$).cls('md-subhead').end()
          .start('video')
            .attrs({ src: this.content, controls: 'true', preload:'auto'})
            .style({ width: '100%' })
          .end()
        .end();
    },
    function toCitationE() {
      return this.Element.create(null, this.Y)
        .start().style({
            'display': 'flex',
            'flex-direction': 'row',
          })
          .add(this.ImageView.create({ data: this.preview, displayWidth: 80*16/9, displayHeight: 80 }))
          .start().add(this.description$).style({ margin: 10 }).end()
        .end();
    },
  ],
});
