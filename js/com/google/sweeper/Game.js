/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'com.google.sweeper',
  name: 'Game',
  extends: 'foam.u2.Element',

  requires: [ 'com.google.sweeper.Board' ],

  properties: [
    {
      type: 'Int',
      name: 'time'
    },
    {
      name: 'board',
      factory: function() { return this.Board.create(); }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.add(this.time$).tag('br').add(this.board);
      this.tick();
    }
  },

  listeners: [
    {
      name: 'tick',
      isMerged: 1000,
      code: function() { this.time++; this.tick(); }
    }
  ]
});
