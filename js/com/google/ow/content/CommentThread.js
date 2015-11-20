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
    'foam.ui.Icon',
    'com.google.ow.content.Message',
    'com.google.ow.ui.CitationOnlyDAOController',
  ],

  exports: [
    'this as data',
  ],

  imports: [
    'envelope', // used client-side
    'streamDAO',
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
      lazyFactory: function() { return this.Message; }
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
    
  ],

  methods: [  
    function toCitationE(X) {
      var Y = X || this.Y;
      return this.Element.create(null, Y.sub({controllerMode: 'ro'}))
        .style({ display: 'flex', 'flex-direction': 'row' })
        .add(this.CitationOnlyDAOController.create({
          mode: 'read-only',
          name: this.description,
          data: this.dao.limit(3),
          rowView: this.contentRowE || this.contentRowView,
          innerEditView: '',
        }, Y))
    },
    
  ]

});
