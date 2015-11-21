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
  name: 'CommentThreadStream',
  extends: 'com.google.ow.content.Stream',

  documentation: function() {/* Adds a comment thread to your content type. TODO: Not done yet! */},

  requires: [
    'foam.u2.Element',
    'foam.ui.Icon',
    'com.google.ow.content.CommentThread',
    'foam.ui.DAOListView',
    'com.google.ow.model.Envelope',
  ],

  imports: [
    'streamDAO',
    'currentUser$',
  ],

  actions: [
    {
      name: 'addCommentThread',
      label: 'New Comment',
      ligature: 'add',
      code: function() {
        var nid = createGUID();
        console.log("Going to add stream with sid ", this.substreams[0])
        var env = this.Envelope.create({
          owner: this.currentUser.id,
          sid: this.substreams[0],
          source: this.id,
          substreams: [nid],
          data: this.CommentThread.create({ 
            id: nid,
            sid: this.substreams[0],
            border: true,
          })
        });
        this.streamDAO.put(env);
      }
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.model = this.CommentThread;
    },
    
    function toDetailE(X) {
      var Y = (X || this.Y).sub({ data: this });
      this.contentRowE = this.contentDetailE;
      this.contentRowView = this.contentDetailView;
      var e = this.Element.create(null, Y);
      e.start().cls('md-flex-col').style({'position':'relative', 'min-height':'50px'})
        .add(this.SUPER(Y))
        .start().add(this.ADD_COMMENT_THREAD).style({ 
          'position': 'absolute',
          'top': '0px',
          'right': '0px'
        }).end()
      .end();
      return e;
    }
  ]

});
