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
    'foam.browser.ui.DAOController',
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
      model_: 'ModelProperty',
      name: 'model',
      help: 'The type of the content items. Should have an id property.',
      defaultValue: 'com.google.ow.model.StreamableTrait',
      postSet: function(_,model) {
        // Model not always ready in node, but don't need views there anyway
        if ( ! model.getFeature ) return;

        if ( model.getFeature('toCitationE') ) this.contentRowView = function(args,X) {
          var d = args.data || X.data;
          if ( ! d ) {
            d = args.data$ || X.data$;
            d = d && d.value;
          }
          return d.toCitationE(X).style({ margin: '8px 0px' });
        }
        if ( model.getFeature('toDetailE') ) this.contentDetailView = function(args,X) {
          var d = args.data || X.data;
          if ( ! d ) {
            d = args.data$ || X.data$;
            d = d && d.value;
          }
          return d.toDetailE(X).style({ 'flex-grow': 1 });
        }
      }
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
      name: 'contentRowView',
      help: 'The row view for the content item list.',
      defaultValue: 'foam.ui.md.CitationView',
    },
    {
      name: 'contentRowE',
      help: 'The row element for the content item list.',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'contentDetailView',
      help: 'The row view for the content item list.',
      defaultValue: 'foam.ui.md.DetailView',
    },
    {
      name: 'contentDetailE',
      help: 'The row element for the content item list.',
    },
  ],

  methods: [
    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE(X) {
      var Y = X || this.Y;
      return this.Element.create(null, Y.sub({controllerMode: 'read-only'}))
        .style({ display: 'flex', 'flex-grow': 1, 'flex-direction': 'column' })
        .add(this.DAOController.create({
          name: this.description,
          data: this.dao,
          rowView: this.contentRowE || this.contentRowView,
          innerEditView: this.contentDetailE || this.contentDetailView,
        }, Y))
    },
    function toCitationE(X) {
      var Y = X || this.Y;
      return this.Element.create(null, Y)
        .start().style({
            'display': 'flex',
            'flex-direction': 'row',
          })
          .start().add(this.description$).style({ margin: 10 }).end()
        .end();
    },
  ],
});
