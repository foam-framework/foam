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
  package: 'foam.core.dao',
  name: 'DelayedPutDAO',
  extends: 'foam.dao.ProxyDAO',

  help: function() {/*
   Apply this decorator to a DAO to enforce a delay between put operations.
  */},

  requires: [
    'foam.util.Queue',
  ],

  properties: [
    {
      type: 'Int',
      name: 'rowDelay',
      defaultValue: 500,
    },
    {
      type: 'Function',
      name: 'onPut',
      defaultValue: function() {
        throw 'DelayedPutDAO: Put before merged listener initialized';
      },
    },
    {
      type: 'foam.util.Queue',
      name: 'q',
      lazyFactory: function() {
        return this.Queue.create();
      },
    },
  ],

  methods: [
    function init() {
      this.X.dynamicFn(
          function() { this.rowDelay; }.bind(this),
          function() {
            this.onPut = EventService.merged(
                this.onPut_.bind(this),
                this.rowDelay,
                this.X);
          }.bind(this));
    },
    function put(o, sink) {
      this.q.push([o, sink]);
      this.onPut();
    },
    function onPut_() {
      var put = this.q.pop();
      this.delegate && this.delegate.put(put[0], put[1]);
      if ( ! this.q.isEmpty() ) this.onPut();
    },
  ],
});
