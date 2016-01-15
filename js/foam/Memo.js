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

// TODO(mark?): Document what this Model does.
CLASS({
  package: 'foam',
  name: 'Memo',

  constants: {
    IDENTITY: function() {
      var args = argsToArray(arguments);
      return JSON.stringify(args.map(function(a) {
        return (typeof a === 'object' ? a.$UID : a.toString());
      }));
    },
    MODEL_IDENTITY: function() {
      var args = argsToArray(arguments);
      return JSON.stringify(args.map(function(a) {
        return (a.model_ ? a.$UID : a.toString());
      }));
    },
    DEEP_VALUE: function() {
      var args = argsToArray(arguments);
      return JSON.stringify(args.map(function(a) {
        return (a.model_ ? JSONUtil.stringify(a) : a);
      }));
    }
  },

  properties: [
    {
      type: 'Function',
      name: 'f',
      required: true
    },
    {
      type: 'Function',
      name: 'f_',
      transient: true
    },
    {
      type: 'Function',
      name: 'hashFunction',
      defaultValueFn: function() { return this.IDENTITY; }
    },
    {
      name: 'memos',
      factory: function() { return {}; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER.apply(this, arguments);
      var self = this;
      this.f_ = function() {
        var hash = self.hashFunction.apply(self, arguments);
        if ( self.memos[hash] ) return self.memos[hash];
        self.memos[hash] = self.f.apply(this, arguments);
        return self.memos[hash];
      };
    },
    get: function() { return this.f_; }
  }
});
