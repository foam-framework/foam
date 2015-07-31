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
  extendsModel: 'foam.dao.ProxyDAO',

  imports: [
    'window',
  ],

  properties: [
    {
      model_: 'IntProperty',
      name: 'rowDelay',
      defaultValue: 500,
    },
    {
      name: 'head_',
      defaultValue: null,
    },
    {
      name: 'tail_',
      defaultValue: null,
    },
    {
      model_: 'FunctionProperty',
      name: 'onPut',
    },
  ],

  methods: [
    function init() {
      this.X.dynamic(
          function() { this.rowDelay; }.bind(this),
          function() {
            this.onPut = EventService.merged(
                this.onPut_.bind(this),
                this.rowDelay,
                this.X);
          }.bind(this));
    },
    function push(o) {
      if ( ! this.tail_ ) {
        this.head_ = this.tail_ = {
          o: o,
          prev: null,
          next: null,
        };
      }
      this.tail_.next = {
        o: o,
        prev: this.tail_,
        next: null,
      };
      this.tail_ = this.tail_.next;
    },
    function pop() {
      if ( ! this.head_ ) return null;
      var o = this.head_.o;
      if ( this.head_ === this.tail_ ) {
        this.head_ = this.tail_ = null;
        return o;
      }
      this.head_ = this.head_.next;
      this.head_.prev = null;
      return o;
    },
    function isEmpty() { return ! this.head_; },
    function put(o, sink) {
      this.push([o, sink]);
      this.onPut();
    },
    function onPut_() {
      var put = this.pop();
      this.delegate && this.delegate.put(put[0], put[1]);
      if ( ! this.isEmpty() ) this.onPut();
    },
  ],
});
