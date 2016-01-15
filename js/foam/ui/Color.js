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
  name: 'Color',

  properties: [
    {
      type: 'Int',
      name: 'red',
      preSet: function(_, v) { return Math.max(0, Math.min(255, v)); },
    },
    {
      type: 'Int',
      name: 'green',
      preSet: function(_, v) { return Math.max(0, Math.min(255, v)); },
    },
    {
      type: 'Int',
      name: 'blue',
      preSet: function(_, v) { return Math.max(0, Math.min(255, v)); },
    },
    {
      type: 'Float',
      name: 'alpha',
      preSet: function(_, v) { return Math.max(0.0, Math.min(1.0, v)); },
    },
  ],

  methods: [
    function toString() {
      return 'rgba(' + this.red + ',' + this.green + ',' + this.blue + ',' +
          this.alpha + ')';
    },
  ],
});
