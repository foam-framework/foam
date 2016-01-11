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
  package: 'com.google.ow.stream',
  name: 'StreamFilterDAO',
  extends: 'FilteredDAO_',

  requires: [ 'com.google.ow.model.Envelope' ],

  properties: [
    {
      type: 'String',
      name: 'tag',
      lazyFactory: function() { return createGUID(); },
    },
    {
      type: 'StringArray',
      name: 'substreams',
      required: true,
      postSet: function(_, nu) {
        if ( ! nu ) debugger;
      },
    },
    {
      name: 'query',
      getter: function() {
        // Filter = on my stream, but not put by me
        //        = not my tag, SID matches one of my substreams
        return AND(
            NEQ(this.Envelope.TAG, this.tag),
            this.substreams.map(function(sid) {
              return EQ(this.Envelope.SID, sid);
            }.bind(this)).reduce(function(acc, expr) {
              return OR(expr, acc);
            }, FALSE));
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( ! this.substreams ) debugger;
    },
    function put(env, sink) {
      var i;
      // Do not put envelopes already seen.
      for ( i = 0; i < env.tags.length; ++i ) {
        if ( env.tags[i] === this.tag ) {
          sink && sink.error && sink.error();
          return;
        }
      }

      // Only put when substream matches.
      for ( i = 0; i < this.substreams.length; ++i ) {
        if ( env.sid === this.substreams[i] ) {
          this.SUPER(env, sink);
          return;
        }
      }
      sink && sink.error && sink.error();
    },
  ],
});
