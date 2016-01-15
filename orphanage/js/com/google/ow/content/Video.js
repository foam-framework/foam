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
    'foam.u2.md.QuickActionButton'
  ],

  imports: [
    'dynamic',
    'streamDAO'
  ],

  properties: [
    {
      name: 'id'
    },
    {
      name: 'sid',
      help: 'TODO: this is just for test data, remove!'
    },
    {
      type: 'String',
      name: 'titleText'
    },
    {
      type: 'String',
      name: 'description'
    },
    {
      type: 'URL',
      name: 'content'
    },
    {
      type: 'Image',
      name: 'preview'
    },
    {
      type: 'Blob',
      name: 'cache_'
    },
    {
      name: 'cachedState_',
      documentation: 'One of "none", "downloading", "cached".',
      defaultValue: 'none'
    },
    {
      type: 'Imported',
      name: 'envelope_',
      transient: true,
      compareProperty: function() { return 0; }
    },
  ],

  actions: [
    {
      name: 'download',
      label: 'Offline',
      ligature: 'cloud_download',
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
    {
      name: 'inProgress',
      label: 'Downloading...',
      ligature: 'cached',
      isEnabled: function() {
        return false;
      }
    },
    {
      name: 'saved',
      label: 'Saved',
      ligature: 'play_circle_filled',
      isEnabled: function() {
        return false;
      }
    }
  ],

  methods: [
    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE(X) {
      var Y = (X || this.Y).sub({ controllerMode: 'ro' });
      Y.registerModel(this.QuickActionButton, 'foam.u2.ActionButton');
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
            src: this.dynamic(function(cachedState) {
              if (cachedState === 'cached')
                return window.URL.createObjectURL(this.cache_);
              if (cachedState === 'downloading') return '';
              else return this.content;
            }.bind(this), this.cachedState_$),
            controls: 'true',
            preload:'auto'
          })
          .end()
        .end();
    },
    function toCitationE(X) {
      var Y = X || this.Y;
      Y.registerModel(this.QuickActionButton, 'foam.u2.ActionButton');
      this.envelope_ = X.envelope;
      var self = this;
      return this.Element.create(null, Y)
          .start().style({ 'margin': '8px' }).cls('md-flex-col').cls('md-card-shell')
            .start().cls('md-flex-row').style({
              'flex-grow': 1, 'justify-content':'space-between'
            })
              .start().add(this.titleText$).cls('md-subhead').style({ 'padding': '8px' }).end()
              .add(this.ImageView.create({ data: this.preview, displayWidth: 80*16/9, displayHeight: 80 }))
            .end()
            .start().cls('md-flex-row').style({
              'flex-grow': 1, 'justify-content':'space-between', 'overflow-y':'hidden'
            })
              .start().add(this.description$).cls('md-body').style({ 'padding': '8px' }).end()
              .start('span').attrs({ padding: '8px' })
              .style({ width: '48px', height: '48px', top: '0', 'right': '0' })
                .x({ data: this })
                .start('span').add(this.DOWNLOAD).cls('md-subhead').cls(this.dynamic(function(state) {
                  return state === 'none' ? '' : 'foam-u2-Element-hidden';
                }, this.cachedState_$)).end()
                .start('span').add(this.SAVED).cls('md-subhead').cls(this.dynamic(function(state) {
                  return state === 'cached' ? '' : 'foam-u2-Element-hidden';
                }, this.cachedState_$)).end()
                .start('span').add(this.IN_PROGRESS).cls('md-subhead').cls(this.dynamic(function(state) {
                  return state === 'downloading' ? '' : 'foam-u2-Element-hidden';
                }, this.cachedState_$)).end()
              .end()
            .end()
        .end();
    }
  ]
});
