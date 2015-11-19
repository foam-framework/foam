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
    'XHR',
    'foam.u2.Element',
    'foam.ui.ImageView',
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
      help: 'TODO: this is just for test data, remove!',
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
    {
      model_: 'BlobProperty',
      name: 'cache_',
    },
    {
      name: 'cachedState_',
      documentation: 'One of "none", "downloading", "cached".',
      defaultValue: 'none'
    },
    {
      model_: 'ImportedProperty',
      name: 'envelope_',
      transient: true,
      compareProperty: function() { return 0; }
    },
  ],

  actions: [
    {
      name: 'download',
      label: 'Download',
      isAvailable: function() {
        return this.cachedState_ === 'none';
      },
      code: function() {
        this.cachedState_ = 'downloading';
        var xhr = this.XHR.create({ responseType: 'blob' });
        xhr.asend(function(blob) {
          this.cache_ = blob;
          this.cachedState_ = 'cached';
          this.streamDAO.put(this.envelope_);
        }.bind(this), this.content);
      }
    },
  ],

  methods: [
    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE(X) {
      var Y = (X || this.Y).sub({ controllerMode: 'read-only' });
      this.envelope_ = X.envelope;
      return this.Element.create(null, Y)
        .start().style({
          'display': 'flex',
          'flex-direction': 'column',
        })
          .start().style({ 'margin': '16px' })
            .start().add(this.titleText$).cls('md-title').end()
            .start().add(this.description$).cls('md-subhead').end()
          .end()
          .start('video')
          .attrs({
            src: function(cachedState) {
              if (cachedState === 'cached')
                return window.URL.createObjectURL(this.cache_);
              if (cachedState === 'downloading') return '';
              else return this.content;
            }.bind(this).on$(this.X, this.cachedState_$),
            controls: 'true',
            preload:'auto'
          })
          .end()
        .end();
    },
    function toCitationE(X) {
      var Y = X || this.Y;
      this.envelope_ = X.envelope;
      var self = this;
      return this.Element.create(null, Y)
          .start().style({ 'display': 'flex' })
          .add(this.ImageView.create({ data: this.preview, displayWidth: 80*16/9, displayHeight: 80 }))
            .start().style({
              'display': 'flex',
              'flex-direction': 'column',
              margin: '16px',
              'flex-grow': 1
            })
              .start().add(this.titleText$).cls('md-subhead').end()
              .start().add(this.description$).cls('md-body').end()
            .end()
            .start('span').attrs({ margin: '8px' })
              .x({ data: this }).add(this.DOWNLOAD)
              .start('span').add('Saved').cls2(function(state) {
                return state === 'cached' ? '' : 'foam-u2-Element-hidden';
              }.on$(this.X, this.cachedState_$)).end()
              .start('span').add('Downloading...').cls2(function(state) {
                return state === 'downloading' ? '' : 'foam-u2-Element-hidden';
              }.on$(this.X, this.cachedState_$)).end()
              .end()
        .end();
    },
  ],
});
