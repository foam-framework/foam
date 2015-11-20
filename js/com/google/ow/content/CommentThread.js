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
    'foam.u2.md.Input',
    'foam.ui.Icon',
    'com.google.ow.content.Message',
    'com.google.ow.ui.CitationOnlyDAOController',
    'foam.ui.DAOListView',
    'com.google.ow.model.Envelope',
  ],

  exports: [
    'this as data',
  ],

  imports: [
    'envelope', // used client-side
    'streamDAO',
    'currentUser$',
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'titleText',
      defaultValue: 'Ask a Question',
    },
    {
      model_: 'StringProperty',
      name: 'description',
      defaultValueFn: function() { return this.titleText; }
    },
    {
      name: 'model',
      defaultValue: 'com.google.ow.content.Message',
    },
    {
      name: 'contentDetailE',
      preSet: function(old, nu) { return ''; },
      defaultValue: '',
    },
    {
      name: 'contentDetailView',
      preSet: function(old, nu) { return ''; },
      defaultValue: '',
    },
    {
      model_: 'StringProperty',
      label: 'Reply',
      name: 'newMessage',
      toPropertyE: function(X) {
        return X.lookup('foam.u2.md.Input').create({  },X);
      },
      postSet: function(old,nu) {
        if (nu) {
          // create message+envelope
          this.streamDAO.put( 
            this.Envelope.create({
              owner: this.currentUser.id,
              source: this.currentUser.id,
              sid: this.substreams[0],
              data: this.Message.create({
                from: this.currentUser.id,
                content: nu,
                sid: this.substreams[0],
              })
            })
          );
          // reset editor 
          this.newMessage = '';
        }
      }
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
        .style({ display: 'flex', 'flex-direction': 'column'})
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
      return this.Element.create(null, Y.sub({controllerMode: 'rw'}))
        .style({ display: 'flex', 'flex-direction': 'column'})
//        .start().add(this.titleText$).cls('md-subhead').end()
        .add(this.DAOListView.create({
          mode: 'read-only',
          name: this.description,
          data: this.dao,
          rowView: this.contentRowE || this.contentRowView,
        }, Y))
        .add(this.NEW_MESSAGE)
    },
    
  ]

});
