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
  name: 'Stream',

  requires: [
    'foam.u2.Element',
    'foam.ui.ImageView',
    'foam.ui.DAOListView',
    'foam.dao.EasyClientDAO',
    'foam.dao.LoggingDAO',
    'foam.browser.ui.DAOController',
    'com.google.ow.model.Envelope',
  ],

  imports: [
    'streamDAO',
    'createStreamItem',
  ],

  documentation: function() {/* Connects to a remote DAO and offers the
    content there in a searchable list. Content can be copied out and
    shared. */},

  properties: [
    {
      name: 'id'
    },
    {
      name: 'substreams',
      lazyFactory: function() { return ['contentIndex/' + this.id]; }
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
      model_: 'ModelProperty',
      name: 'model',
      help: 'The type of the content items. Should have an id property.',
      defaultValue: 'com.google.ow.model.StreamableTrait',
      propertyToJSON: function() {
        return (this.model && this.model.id) || '';
      },
      postSet: function(_,model) {
        // Model not always ready in node, but don't need views there anyway
        if ( ! model.getFeature ) return;

        if ( model.getFeature('toCitationE') ) this.contentRowView = function(args,X) {
          var d = args.data || X.data;
          if ( ! d ) {
            d = args.data$ || X.data$;
            d = d && d.value;
          }
          if ( d.data ) d = d.data; // TODO: hacky! assuming it's an envelope
          return d.toCitationE(X).style({ margin: '8px 0px' });
        }
        if ( model.getFeature('toDetailE') ) this.contentDetailView = function(args,X) {
          var d = args.data || X.data;
          if ( ! d ) {
            d = args.data$ || X.data$;
            d = d && d.value;
          }
          if ( d.data ) d = d.data; // TODO: hacky! assuming it's an envelope
          return d.toDetailE(X).style({ 'flex-grow': 1, overflow: 'hidden' });
        }
      }
    },
    {
      name: 'dao',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        return this.streamDAO.where(EQ(this.Envelope.SID, this.substreams[0]));
      }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'contentRowView',
      help: 'The row view for the content item list.',
      defaultValue: 'com.google.ow.ui.EnvelopeCitationView',
    },
    {
      name: 'contentRowE',
      help: 'The row element for the content item list.',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'contentDetailView',
      help: 'The row view for the content item list.',
      defaultValue: 'com.google.ow.ui.EnvelopeDetailView',
    },
    {
      name: 'contentDetailE',
      help: 'The row element for the content item list.',
    },
  ],

  methods: [
    function put(envelope, sink) {
      /* this is a substream target, implement put handler */
      var self = this;
      // Since this should be running on the server, grab all the owners
      // of this contentIndex, based on stream id, and share the new substream
      // content with those owners.
      self.streamDAO.where(IN(self.Envelope.SUBSTREAMS, self.substreams[0])).select(
        MAP(self.Envelope.OWNER, { put: function(owner) {
          self.streamDAO.put(
            self.createStreamItem(self.substreams[0], owner, envelope.data, self.substreams[0])
          );
        } })
      );
    },
    function onShare(source, target, opt_sid) {
      /* React to share events. Called just before this item is shared. */
      var self = this;
      // Duplicate source user's stream content for the new target user
      // TODO: don't duplicate if it's already there?
      self.dao.where(EQ(self.Envelope.OWNER, source)).select({
        put: function(env) {
          self.streamDAO.put(
            self.createStreamItem(
              self.substreams[0],
              target,
              env.data,
              self.substreams[0]
            )
          );
        }
      });
    },

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
