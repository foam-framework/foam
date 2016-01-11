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
  name: 'CommentThreadTrait',

  documentation: function() {/* Adds a comment thread to your content type. TODO: Not done yet! */},

  requires: [
    'foam.u2.Element',
    'foam.ui.Icon',
    'com.google.ow.content.CommentThreadStream',
    'foam.ui.DAOListView',
    'com.google.ow.model.Envelope',
  ],

  properties: [
    {
      model_:'ImportedProperty',
      name: 'commentThreads',
      factory: function() {
        return this.CommentThreadStream.create({
          id: this.id + '/commentThreads',
          sid: this.id + '/commentThreads',
          substreams: [this.id + '/commentThreads'],
        });
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.substreams.push(this.id + '/commentThreads');
    },
    
    function put(env, sink, yourEnv) {
      /* server side event handler */
      console.log("CommentThreadTrait sid str", env.sid );
      if ( env.sid.endsWith("/commentThreads") ) {
        console.log("Comment thread put!", env.sid);
        this.commentThreads.put(env,sink,yourEnv);
      } else {
        this.SUPER(env,sink,yourEnv);
      }
    },
    
    function toCommentsE(X) {
      var Y = X || this.Y;
      var e = this.Element.create(null, Y)
      .start().add(this.ADD_COMMENT_THREAD).style({ 
        'position': 'absolute',
        'top': '0px',
        'right': '0px'
      }).end()
      .add(this.commentThreads.toDetailE(Y));
      return e;
    }
  ]

});
