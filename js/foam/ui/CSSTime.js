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
  package: 'foam.ui',
  name: 'CSSTime',

  constants: {
    REG_EX_STR: '([0-9]+([.][0-9]*)?|[.][0-9]+)(m?s)',
  },

  properties: [
    {
      type: 'Float',
      name: 'time',
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'units',
      choices: [
        ['s', 'Seconds'],
        ['ms', 'Millisecondes'],
      ],
    },
  ],

  methods: [
    function fromString(s) {
      if ( ! s ) return null;
      var match = this.fromString_(s);
      if ( ! match ) return null;
      var num = parseFloat(match[1]);
      var units = match[3];
      if ( Number.isNaN(num) || ! units ) return null;
      this.time = num;
      this.units = units.toLowerCase();
      return this;
    },
    function fromString_(s) {
      var re = new RegExp('^' + this.REG_EX_STR + '$', 'gi');
      return re.exec(s);
    },
    function toString() {
      return this.time + this.units;
    },
  ],
});
