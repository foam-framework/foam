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
  package: 'foam.mlang',
  name: 'PropertySequence',
  extends: 'Property',

  documentation: function() {/* A linked list-style sequence of
    $$DOC{ref:'Property',usePlural:true} that models
    <code>obj.prop1.prop2</code> lookup. Extends $$DOC{ref:'Property'} to look
    and act like a $$DOC{ref:'Property'}, but is really a <i>pseudo-property</i>
    for use as an mlang value. */},

  properties: [
    {
      name: 'id',
      getter: function() { this.getFullName('.'); },
    },
    {
      type: 'Property',
      name: 'next_',
      defaultValue: null,
    },
  ],

  methods: [
    function getFullName(sep) {
      return this.name + (this.next_ ? sep + this.next_.id : '');
    },
    function partialEval() { return this; },
    function f(obj) {
      var i;
      var p = this;
      while ( p.next_ ) {
        if ( ! obj ) return obj;
        obj = obj[p.name];
        p = p.next_;
      }
      if ( ! obj ) return obj;
      return obj[constantize(p.name)].f(obj);
    },
    function toSQL() { this.getFullName('_'); },
    function toMQL() { this.getFullName('_'); },
    function toBQL() { this.getFullName('_'); },
  ],
});
