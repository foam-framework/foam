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
  package: 'foam.util',
  name: 'Queue',

  models: [
    {
      name: 'Node',
      properties: [
        { name: 'prev', defaultValue: null },
        { name: 'next', defaultValue: null },
        { name: 'data', defaultValue: null },
      ],
    },
  ],

  properties: [
    { name: 'head', defaultValue: null },
    { name: 'tail', defaultValue: null },
  ],

  methods: [
    function push(data) {
      if ( ! this.tail ) {
        this.head = this.tail = this.Node.create({ data: data });
        return;
      }
      this.tail.next = this.Node.create({
        data: data,
        prev: this.tail,
      });
      this.tail = this.tail.next;
    },
    function pop() {
      if ( ! this.head ) return null;
      var data = this.head.data;
      if ( this.head === this.tail ) {
        this.head = this.tail = null;
        return data;
      }
      this.head = this.head.next;
      this.head.prev = null;
      return data;
    },
    function isEmpty() { return ! this.head; },
  ],
});
