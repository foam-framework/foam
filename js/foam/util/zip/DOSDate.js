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
  package: 'foam.util.zip',
  name: 'DOSDate',

  // See http://stackoverflow.com/questions/15763259/unix-timestamp-to-fat-timestamp?answertab=votes#tab-top.
  constants: {
    YEAR: {
      F: function(d) { return d.getFullYear() - 1980; },
      SHIFT: 25,
      MASK: (0xFE000000 | 0),
    },
    MONTH: {
      F: function(d) { return d.getMonth() + 1; },
      SHIFT: 21,
      MASK: (0x01E00000 | 0),
    },
    DAY: {
      F: function(d) { return d.getDate(); },
      SHIFT: 16,
      MASK: (0x001F0000 | 0),
    },
    HOUR: {
      F: function(d) { return d.getHours(); },
      SHIFT: 11,
      MASK: (0x0000F800 | 0),
    },
    MINUTE: {
      F: function(d) { return d.getMinutes(); },
      SHIFT: 5,
      MASK: (0x000007E0 | 0),
    },
    SECOND: {
      F: function(d) { return d.getSeconds() >>> 1; },
      SHIFT: 0,
      MASK: (0x0000001F | 0),
    },
  },

  properties: [
    {
      type: 'DateTime',
      name: 'date',
      factory: function() {
        return new Date();
      },
    }
  ],

  methods: [
    function getPart(name) {
      return (this[name].F(this.date) << this[name].SHIFT) & this[name].MASK;
    },
    function toNumber() {
      var f = this.getPart.bind(this);
      return f('YEAR') | f('MONTH') | f('DAY') | f('HOUR') | f('MINUTE') |
          f('SECOND');
    },
  ],
});
