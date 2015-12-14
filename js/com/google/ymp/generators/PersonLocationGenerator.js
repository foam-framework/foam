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
  package: 'com.google.ymp.generators',
  name: 'PersonLocationGenerator',
  extends: 'com.google.ymp.generators.LocationBase',

  documentation: function() {/*
    Auto-generate a location not far from some markets.

    Assumptions:
    - marketDAO_ already contains a stable collection markets;
    - marketDAO_ will produce a count on-init() before generate() is invoked.
  */},

  requires: [
    'com.google.ymp.geo.Location',
  ],
  imports: [
    'marketDAO_',
  ],

  properties: [
    {
      type: 'Int',
      name: 'count',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.marketDAO_.select(COUNT())(function(res) {
        this.count = res.count;
      }.bind(this));
    },
    function generate(ret) {
      this.marketDAO_.skip(Math.floor(Math.random() * this.count)).limit(1)
          .select({ put: this.generate_.bind(this, ret) });
    },
    function generate_(ret, market) {
      var newLocation = market.location.clone();
      newLocation.id = createGUID();
      newLocation.locality = newLocation.region = newLocation.country = '';
      var xMul = Math.random() >= 0.5 ? 1 : -1;
      var yMul = Math.random() >= 0.5 ? 1 : -1;
      newLocation.longitude += (xMul * (Math.random() / 10));
      newLocation.latitude += (yMul * (Math.random() / 10));

      ret(this.sanitizeLocation(newLocation));
    },
  ]
});
