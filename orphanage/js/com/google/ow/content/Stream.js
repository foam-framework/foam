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
    'com.google.ow.ui.CitationOnlyDAOController',
    'com.google.ow.model.Envelope',
    'com.google.ow.ui.EnvelopeCitationView',
    'com.google.ow.ui.EnvelopeDetailView',
  ],

  imports: [
    'streamDAO',
    'createStreamItem',
  ],

  documentation: function() {/* Connects to a remote DAO and offers the
    content there in a searchable list. Content can be copied out and
    shared. */},

  properties: [
    'id',
    {
      type: 'String',
      name: 'name',
      lazyFactory: function() { return this.id.toString(); },
    },
    {
      name: 'substreams',
      lazyFactory: function() { return [this.id]; }
    },
    {
      type: 'String',
      name: 'titleText'
    },
    {
      type: 'String',
      name: 'description'
    },
    {
      type: 'Model',
      transient: true,
      name: 'model',
      help: 'The type of the content items. Should have an id property.',
      defaultValue: 'com.google.ow.model.StreamableTrait',
      propertyToJSON: function() {
        return (this.model && this.model.id) || '';
      },
      postSet: function(_,model) {
        // Model not always ready in node, but don't need views there anyway
        if ( ! (model && model.getFeature) ) return;

        this.extractViews();
      }
    },
    {
      type: 'Imported',
      name: 'dao',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        console.log(this.name_, "Stream where:", this.Envelope.SID, this.substreams[0])
        return this.streamDAO.where(CONTAINS(this.Envelope.SID, this.substreams[0])); // TODO: slightly hacky, path split alternative
      }
    },
    {
      type: 'ViewFactory',
      transient: true,
      name: 'contentRowView',
      help: 'The row view for the content item list.',
      defaultValue: 'com.google.ow.ui.EnvelopeCitationView',
    },
    {
      name: 'contentRowE',
      transient: true,
      help: 'The row element for the content item list.',
    },
    {
      type: 'ViewFactory',
      name: 'contentDetailView',
      transient: true,
      help: 'The row view for the content item list.',
      defaultValue: 'com.google.ow.ui.EnvelopeDetailView',
    },
    {
      name: 'contentDetailE',
      transient: true,
      help: 'The row element for the content item list.',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      //this.model = this.model;
    },
    
    function put(envelope, sink, yourEnvelope) {
      /* this is a substream target, implement put handler */
      var self = this;
      // propagate out the object to other owners, but only if we own it
      if ( envelope.owner !== yourEnvelope.owner ) return;
      console.log("Processing new env for stream ", yourEnvelope.substreams[0], yourEnvelope.owner, envelope.data.id);
      // Since this should be running on the server, grab all the owners
      // of this contentIndex, based on stream id, and share the new substream
      // content with those ownerIds.
      self.streamDAO.where(EQ(self.Envelope.SUBSTREAMS, self.substreams[0])).select(
        MAP(self.Envelope.OWNER, { put: function(ownerId) {
          // if an envelope doens't already exist, make one
          console.log("Stream put for owner", ownerId);
          var found = false;
          self.streamDAO.where(
            AND(
              EQ(self.Envelope.SID, envelope.sid),
              EQ(self.Envelope.OWNER, ownerId))// ,
//               EQ(self.Envelope.DATA.dot(self.model_.ID), envelope.data.id)// this.model_.ID is a bit of a hack to extract ID from data, when we don't know what model data really is.
            )
          .select({
            put: function(env) {
              if (env.data.id !== envelope.data.id) return;
              // existing envelope for the content
              //console.log("Stream: Found existing", env.data.id, env);
              found = true;
              // TODO: try to merge/update the content?
            },
            eof: function() {
              if ( ! found ) {
                console.log("Stream: not found, copying to:", ownerId, envelope.sid);
                self.streamDAO.put(self.Envelope.create({
                  source: self.substreams[0],
                  owner: ownerId,
                  data: envelope.data,
                  sid: envelope.sid,
                  substreams: envelope.substreams,
                }));
              }
            }
          });
        } })
      );
    },
    function onShare(source, target, opt_sid) {
      /* React to share events. Called just before this item is shared. */
      console.log("Sharing stream", source, target, opt_sid);
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

    function extractViews() {
      var model = this.model;
      // if ( model.getFeature('toCitationE') )
      this.contentRowView = function(args,X) {
        var env = args.data || (args.data$ && args.data$.value) ||  X.data || (X.data$ && X.data$.value);
        var d = env.data || env;
        if (d.toCitationE)
          return d.toCitationE(X.sub({ envelope: env })).style({ margin: '8px 0px' });
        else
          return this.EnvelopeCitationView.create(args,X);
      }
      if ( model.getFeature('toDetailE') ) this.contentDetailView = function(args,X) {
        var env = args.data || (args.data$ && args.data$.value) ||  X.data || (X.data$ && X.data$.value);
        var d = env.data || env;
        if (d.toDetailE) 
          return d.toDetailE(X.sub({ envelope: env })).style({ 'flex-grow': 1, overflow: 'hidden' });
        else
          return this.EnvelopeDetailView.create(args,X);
      }
    },

    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE(X) {
      var Y = (X || this.Y).sub({ data: this });
      this.extractViews();
      return this.Element.create(null, Y.sub({controllerMode: 'ro'}))
        .style({ display: 'flex', 'flex-grow': 1, 'flex-direction': 'column' })
        .add(this.CitationOnlyDAOController.create({
          name: this.description,
          data: this.dao,
          rowView: this.contentRowE || this.contentRowView,
          innerEditView: this.contentDetailE || this.contentDetailView,
        }, Y))
    },
    function toCitationE(X) {
      var Y = X || this.Y;
      this.extractViews();
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
