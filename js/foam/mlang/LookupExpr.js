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
  name: 'LookupExpr',
  extends: 'UNARY',

  exports: [ 'LOOKUP' ],

  requires: [
    'foam.core.types.PropertySequence',
  ],

  constants: {
    // Runs from a context object containing LookupExpr, PropertySequence.
    LOOKUP: function(/* vargs: Property objects */) {
      if ( arguments.length === 1 ) return arguments[0];
      return this.PropertySequence.xbind({
        next_: this.LOOKUP.apply(this, Array.prototype.slice.call(arguments, 1)),
      }).create(arguments[0], this);
    },
  },

  methods: [
    function exportToContext(X) {
      X.PropertySequence = this.PropertySequence;
      X.LookupExpr = this.model_;
      X.LOOKUP = this.LOOKUP.bind(X);
    },

    // TODO(markdittmer): Convert to actual *QL.
    function toSQL() { return this.arg1.join('.'); },
    function toMQL() { return this.arg1.join('.'); },
    function toBQL() { return this.arg1.join('.'); },

    function f(obj) { return this.arg1.f(obj); },
  ],
});
