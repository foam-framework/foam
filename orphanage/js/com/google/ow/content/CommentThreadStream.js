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
    'foam.u2.md.QuickActionButton',
    'com.google.ow.ui.EnvelopeDetailView',
    'foam.ui.md.UpdateDetailView',
    'foam.u2.DetailView',
    'foam.ui.md.FlatButton'
  ],

  imports: [
    'streamDAO',
    'currentUser$',
    'stack'
  ],

  actions: [
    {
      name: 'addCommentThread',
      label: 'New Comment',
      ligature: 'comment',
      code: function() {
        var nid = createGUID();
        console.log("Going to add stream with sid ", this.substreams[0])
        var env = this.Envelope.create({
          owner: this.currentUser.id,
          sid: this.substreams[0],
          source: this.id,
          substreams: [nid],
          data: this.CommentThread.create({
            description: 'Question',
            id: nid,
            sid: this.substreams[0],
            border: true,
          })
        });
        this.streamDAO.put(env);

        //TODO: make this a standard thing
        //TODO: which context we are using is confusing and bad. Creation or toDetailE?
        var innerDetailView = function(args, X) {
          var envelope = args.data || args.data$.get();
          return envelope.toDetailE ? envelope.toDetailE(X) :
              this.DetailView.create({ data: envelope }, X);
        }.bind(this);

        var args = { data: env, innerView: innerDetailView };
        var v = this.UpdateDetailView.create(args, this.Y.sub({ stack: this.stack }));
        v.title = env.data.titleText
        v.liveEdit = true;
        this.stack.pushView(v);
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      //this.model = this.CommentThread;
      this.Y.registerModel(this.FlatButton, 'foam.ui.ActionButton');
    },

    function toDetailE(X) {
      var Y = (X || this.Y).sub({ data: this });
      Y.registerModel(this.QuickActionButton, 'foam.u2.ActionButton');
      this.stack = Y.stack;
      //this.contentRowE = this.contentDetailE;
      //this.contentRowView = this.contentDetailView;
      var e = this.Element.create(null, Y);
      e.start().cls('md-flex-col').style({
          'position':'relative',
          'min-height':'50px',
          'flex-grow':'1',
          'background-color':'#eeffee'})
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
