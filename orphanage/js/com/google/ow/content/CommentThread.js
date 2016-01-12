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
  name: 'CommentThread',
  extends: 'com.google.ow.content.Stream',

  documentation: function() {/* A stream of comments with a flat list of
    replies under each. TODO: Not done yet! */},

  requires: [
    'foam.u2.Element',
    'foam.u2.md.TextField',
    'foam.ui.Icon',
    'com.google.ow.content.Message',
    'com.google.ow.ui.CitationOnlyDAOController',
    'foam.ui.DAOListView',
    'com.google.ow.model.Envelope'
  ],

  exports: [
    'this as data'
  ],

  imports: [
    'envelope', // used client-side
    'streamDAO',
    'currentUser$',
    'setTimeout'
  ],

  properties: [
    {
      type: 'String',
      name: 'titleText',
      defaultValue: 'Ask a Question'
    },
    {
      type: 'String',
      name: 'description',
      defaultValueFn: function() { return this.titleText; }
    },
    {
      name: 'model',
      defaultValue: 'com.google.ow.content.Message'
    },
    {
      name: 'contentDetailE',
      preSet: function(old, nu) { return ''; },
      defaultValue: ''
    },
    {
      name: 'contentDetailView',
      preSet: function(old, nu) { return ''; },
      defaultValue: ''
    },
    [ 'border', false ],
    {
      type: 'String',
      label: 'Reply',
      name: 'newMessage',
      toPropertyE: function(X) {
        return X.lookup('foam.u2.md.TextField').create({  },X);
      },
      postSet: function(old,nu) {
        if ( nu ) {
          // create message+envelope
          var env =
            this.Envelope.create({
              owner: this.currentUser.id,
              source: this.currentUser.id,
              sid: this.substreams[0],
              data: this.Message.create({
                from: this.currentUser.id,
                content: nu,
                sid: this.substreams[0],
              })
            });
          // reset editor
          this.newMessage = '';
          // record new message
          this.streamDAO.put(env);
          // scroll ui (hacky)
          this.setTimeout(function() {
            this.scrollEl && this.scrollEl.el() && this.scrollEl.el().scrollIntoView(false);
           }.bind(this), 300);
        }
      }
    },
    {
      type: 'Imported',
      name: 'scrollEl'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.model = this.model;
    },
    function toCitationE(X) {
      var Y = (X || this.Y).sub({selection$: null});
      return this.Element.create(null, Y.sub({controllerMode: 'ro'}))
        .style({ display: 'flex', 'flex-direction': 'column', 'min-height':'50px'}).cls('md-card-shell')
        .start().cls('md-body').add(this.description$).style({padding:'8px'}).end()
        .add(this.DAOListView.create({
          mode: 'read-only',
          name: this.description,
          data: this.dao.limit(3),
          rowView: this.contentRowE || this.contentRowView,
        }, Y))
    },
    function toDetailE(X) {
      var Y = (X || this.Y).sub({selection$: null, data: this });
      this.envelope = Y.envelope;
      var e = this.Element.create(null, Y.sub({controllerMode: 'rw'}));
      e.style({ display: 'flex', 'flex-direction': 'column' }).cls(
        function() { return (this.border) ? 'md-card-shell' : ''; }.bind(this))
        //.start().add(this.description$).cls('md-subhead').end()
      .start().add(this.DAOListView.create({
          mode: 'read-only',
          name: this.description,
          data: this.dao,
          rowView: this.contentRowE || this.contentRowView,
        }, Y))
        .on('click', function() { e.el().scrollIntoView(false); })
      .end()
      .add(this.NEW_MESSAGE);
      this.scrollEl = e;
      return e;
    }
  ]
});
