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
    'envelope',
    'streamDAO',
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
      var substreams = this.envelope.substreams;
      var sink = {
        put: function(o) {
          var arr = this.versions.slice();
          arr.push(o);
          this.versions = arr;
        }.bind(this),
      };
      for ( var i = 0; i < substreams.length; ++i ) {
        var substream = substreams[i];
        var filteredDAO = this.streamDAO.where(EQ(this.Envelope.SID, substream));
        // TODO(markdittmer): Add date-based ordering and limit(1).
        filteredDAO.select(sink)(function() { filteredDAO.listen(sink); });
      }
      this.SUPER();
    },
  ],
});
