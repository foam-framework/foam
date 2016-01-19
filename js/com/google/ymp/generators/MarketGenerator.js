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
  name: 'MarketGenerator',
  extends: 'com.google.ymp.generators.LocationBase',

  documentation: function() {/*
    Auto-generate four markets (west, north, east, and south) for each location
    available in imported locationDAO_. The generator iterates over directions,
    then locations (sorted by ID). When no more locations are found, generator
    returns null.

    Assumptions:
    - locationDAO_ already contains a stable collection of locations;
    - location.id is unique.
  */},

  requires: [
    'com.google.ymp.Market',
    'com.google.ymp.geo.Location',
  ],
  imports: [
    'process',
    'locationDAO_',
  ],

  properties: [
    {
      type: 'foam.core.types.StringEnum',
      name: 'direction',
      defaultValue: 'W',
      choices: [
        ['W', 'West'],
        ['N', 'North'],
        ['E', 'East'],
        ['S', 'South'],
      ],
    },
    {
      subType: 'com.google.ymp.geo.Location',
      name: 'location',
      defaultValue: '',
    },
    {
      type: 'Int',
      name: 'count',
      defaultValue: 0,
    },
  ],

  methods: [
    function generate(ret) {
      if ( (this.count % 64) === 0 ) this.process.nextTick(this.generate_.bind(this, ret), 0);
      else                           this.generate_(ret);
    },
    function generate_(ret) {
      if ( this.direction === 'W' ) this.nextLocation(this.generate__.bind(this, ret));
      else this.generate__(ret, this.location);
    },
    function generate__(ret, location) {
      if ( ! location ) {
        ret(null);
        return;
      }

      var newLocation = location.clone();
      newLocation.id = createGUID();
      var name = location.locality;
      // Choose appropriate market name, fudge location in some direction,
      // update generator direction.
      if ( this.direction === 'W' ) {
        name = 'West ' + newLocation.locality + ' Market';
        newLocation.longitude -= (Math.random() / 1000);
        this.direction = 'N';
      } else if ( this.direction === 'E' ) {
        name = 'East ' + newLocation.locality + ' Market';
        newLocation.longitude += (Math.random() / 1000);
        this.direction = 'S';
      } else if ( this.direction === 'S' ) {
        name = 'South ' + newLocation.locality + ' Market';
        newLocation.latitude -= (Math.random() / 1000);
        this.direction = 'W';
      } else if ( this.direction === 'N' ) {
        name = 'North ' + newLocation.locality + ' Market';
        newLocation.latitude += (Math.random() / 1000);
        this.direction = 'E';
      }

      ret(this.Market.create({
        name: name,
        location: this.sanitizeLocation(newLocation),
      }));
    },
    function nextLocation(ret) {
      var id = this.location.id;
      var dao = this.locationDAO_;
      if ( id ) dao = dao.where(GT(this.Location.ID, id));
      dao = dao.orderBy(this.Location.ID).limit(1);

      dao.select({
        put: this.nextLocation_.bind(this, ret),
        error: this.errorOrEOF.bind(this, ret, this.count),
        eof: this.errorOrEOF.bind(this, ret, this.count),
      });
    },
    function nextLocation_(ret, location) {
      ++this.count;
      this.location = location;
      ret(location);
    },
    function errorOrEOF(ret, count) {
      if ( count === this.count ) ret(null);
    },
  ],
});
