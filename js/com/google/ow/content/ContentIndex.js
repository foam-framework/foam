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
  name: 'ContentIndex',

  requires: [
    'foam.u2.Element',
    'foam.ui.ImageView',
    'foam.ui.DAOListView',
    'foam.dao.EasyClientDAO',
    'foam.dao.LoggingDAO',
  ],

  documentation: function() {/* Connects to a remote DAO and offers the
    content there in a searchable list. Content can be copied out and
    shared. */},

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
      name: 'serverUri',
      defaultValueFn: function() { return this.X.document.location.origin + '/api'; },
    },
    {
      name: 'model',
      help: 'The type of the content items. Should have an id property.',
      defaultValue: 'com.google.ow.model.StreamableTrait',
    },
    {
      name: 'dao',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        return this.LoggingDAO.create({ delegate: this.EasyClientDAO.create({
          serverUri: this.serverUri,
          model: this.model,
        }) });
      }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'contentItemView',
      help: 'The row view for the content item list.',
    },
    {
      name: 'contentItemE',
      help: 'The row element for the content item list.',
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
          .add(this.DAOListView.create({
            data: this.dao,
            rowView: this.contentItemE || this.contentItemView,
          }))
        .end();
    },
    function toCitationE() {
      return this.Element.create(null, this.Y)
        .start().style({
            'display': 'flex',
            'flex-direction': 'row',
          })
          .start().add(this.description$).style({ margin: 10 }).end()
        .end();
    },
  ],
});
