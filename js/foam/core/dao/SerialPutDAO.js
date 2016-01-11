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
  name: 'SerialPutDAO',
  extends: 'foam.dao.ProxyDAO',

  help: function() {/*
   Apply this decorator to a DAO to make it wait for a callback on each put
   before executing subsequent puts.
  */},

  requires: [
    'foam.util.Queue',
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'busy',
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
    function put(o, sink) {
      this.q.push([o, sink]);
      if ( ! this.busy ) {
        this.putNext();
      }
    },
    function putNext() {
      this.busy = true;
      var put = this.q.pop();
      var o = put[0];
      var sink = put[1];
      this.delegate && this.delegate.put(put[0], {
        put: function(obj) {
          this.busy = false;
          sink && sink.put && sink.put(obj);
          if ( ! this.q.isEmpty() ) this.putNext();
        }.bind(this),
        error: function(err) {
          this.busy = false;
          sink && sink.error && sink.error(err);
          if ( ! this.q.isEmpty() ) this.putNext();
        }.bind(this),
      });
    },
  ],
});
