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
  name: 'UpdateStreamView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.ow.model.Envelope',
  ],
  imports: [
    'streamDAO',
    'envelope',
  ],

  properties: [
    {
      model_: 'ArrayProperty',
      name: 'versions',
      lazyFactory: function() { return []; },
    },
  ],

  methods: [
    function init() {
      var listening = false;
      var sink = {
        put: function(env) {
          var arr = this.versions.slice();
          arr.push(env);
          this.versions = arr;
          // HACK(markdittmer): Re-put the same envelope with a newer timestamp.
          // This will will bump the UpdateStream in the user's stream view.
          if ( listening &&
              env.timestamp.getTime() > this.envelope.timestamp.getTime() ) {
            this.envelope.timestamp = env.timestamp;
            this.streamDAO.put(this.envelope);
          }
        }.bind(this),
        eof: function() {
          listening = true;
          if ( ! this.versions.length ) return;
          var env = this.versions[this.versions.length - 1];
          // HACK(markdittmer): Re-put the same envelope with a newer timestamp.
          // This will will bump the UpdateStream in the user's stream view.
          if ( env.timestamp.getTime() > this.envelope.timestamp.getTime() ) {
            this.envelope.timestamp = env.timestamp;
            this.streamDAO.put(this.envelope);
          }
        }.bind(this),
      };
      var substreams = this.data.substreams;
      for ( var i = 0; i < substreams.length; ++i ) {
        var filteredDAO = this.streamDAO.where(EQ(this.Envelope.SID, substreams[i]))
            .orderBy(this.Envelope.TIMESTAMP);
        // TODO(markdittmer): Add date-based ordering and limit(1).
        filteredDAO.select(sink)(function() { filteredDAO.listen(sink); });
      }
      this.SUPER();
    },
  ],
});
