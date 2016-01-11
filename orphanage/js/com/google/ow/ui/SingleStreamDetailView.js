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
  package: 'com.google.ow.ui',
  name: 'SingleStreamDetailView',
  extends: 'com.google.ow.ui.SingleStreamView',

  requires: [
    'com.google.ow.model.Envelope',
    'com.google.ow.model.Text',
    'foam.u2.md.ActionButton',
    'foam.u2.md.TextField',
  ],
  imports: [
    'personDAO',
    'streamDAO',
    'envelope',
  ],
  exports: [
    'data',
    'messageToEnvelope',
  ],

  properties: [
    [ 'nodeName', 'SINGLE-STREAM-DETAIL' ],
  ],

  actions: [
    {
      name: 'send',
      code: function(X) {
        if ( ! this.message ) return;
        X.streamDAO.put(this.message.toEnvelope ?
            this.message.toEnvelope(X.sub({ sid: this.substream })) :
            X.messageToEnvelope(this.message, X));
        this.message = '';
      },
    },
  ],

  methods: [
    function init() {
      // For Action.toE(), Property.toPropertyE().
      this.Y.registerModel(this.ActionButton, 'foam.u2.ActionButton');
      this.Y.registerModel(this.TextField, 'foam.u2.TextField');

      // HACK(markdittmer): Set titleText on messages.
      var self = this;
      var sink = {
        put: function(env) {
          self.personDAO.find(env.source, {
            put: function(p) {
              if ( env.data.titleText !== p.displayName) {
                env.data.titleText = p.displayName;
                // HACK(markdittmer): Probably shouldn't be putting-back the same envelope.
                // self.streamDAO.put(env);
              }
            },
          });
        },
      };
      self.filteredDAO.select(sink)(function() {
        self.filteredDAO.listen(sink);
      });

      this.SUPER();
    },
    function initE() {
      return this.SUPER()
          .start('div').cls('message-entry')
            .add(this.data.MESSAGE)
            .add(this.SEND)
          .end();
    }
  ],

  listeners: [
    function messageToEnvelope(m, X) {
      return this.Envelope.create({
        source: X.envelope.owner,
        owner: X.envelope.owner,
        sid: this.data.substream,
        data: this.Text.create({
          message: m
        }),
      });
    },
  ],

  templates: [
    function CSS() {/*
      .md-update-detail-view.com-google-ow-content-SingleStream .md-update-detail-view-body {
        overflow-y: hidden;
      }
      .md-update-detail-view.com-google-ow-content-SingleStream .md-update-detail-view-body,
      .md-update-detail-view.com-google-ow-content-SingleStream envelope-detail {
        display: flex;
        flex-grow: 1;
      }
      single-stream-detail {
        flex-direction: column;
        display: flex;
        flex-grow: 1;
      }
      single-stream-detail .foam-u2-DAOListView- {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        flex-grow: 1;
        flex-shrink: 1;
        overflow-x: hidden;
        overflow-y: auto;
      }
      single-stream-detail .foam-u2-DAOListView- envelope-citation {
       flex-shrink: 0;
      }
      single-stream-detail .message-entry {
        display: flex;
      }
      single-stream-detail .message-entry .foam-u2-md-TextField- {
        flex-grow: 1;
      }
    */}
  ]
});
