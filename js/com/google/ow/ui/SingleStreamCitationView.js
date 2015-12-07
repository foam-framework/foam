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
  package: 'com.google.ow.ui',
  name: 'SingleStreamCitationView',
  extends: 'com.google.ow.ui.SingleStreamView',

  imports: [
    'dynamic',
    'envelope',
    'streamDAO'
  ],
  exports: [ 'data' ],

  properties: [
    [ 'nodeName', 'SINGLE-STREAM-CITATION' ],
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO',
      lazyFactory: function() {
        return this.streamDAO.where(EQ(this.Envelope.SID, this.data.substream))
            .orderBy(DESC(this.Envelope.TIMESTAMP));
      },
    },
    'message'
  ],

  methods: [
    function init() {
      // Get the latest message.
      var sink = {
        put: function(env) {
          this.message = env.data;
          // HACK(markdittmer): Re-put the same envelope with a newer timestamp.
          // This will will bump the UpdateStream in the user's stream view.
          if ( env.timestamp.getTime() > this.envelope.timestamp.getTime() ) {
            this.envelope.timestamp = env.timestamp;
            this.streamDAO.put(this.envelope);
          }
        }.bind(this)
      };
      this.streamDAO.where(EQ(this.Envelope.SID, this.data.substream))
          .orderBy(DESC(this.Envelope.TIMESTAMP)).limit(1).select(sink)(
              function() { this.filteredDAO.listen(sink); }.bind(this));

      this.SUPER();
    },
    function initE() {
      return this
          .add(this.dynamic(function(message) {
            return this.message ?
                (this.message.toE ? this.message.toE(this.Y) : this.message) :
            '';
          }.bind(this), this.message$));
    },
  ],

  templates: [
    function CSS() {/*
      single-steram-citation { display: block; }
    */},
  ],
});
