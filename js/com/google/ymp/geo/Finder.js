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
  package: 'com.google.ymp.geo',
  name: 'Finder',

  requires: [
    'MDAO',
    'com.google.ymp.Market',
    'com.google.ymp.geo.Location',
    'foam.mlang.PropertySequence',
  ],

  models: [
    {
      name: 'RelativeLocation',

      requires: [
        'com.google.ymp.geo.Location',
      ],

      properties: [
        'id',
        {
          subType: 'com.google.ymp.geo.Location',
          name: 'basis',
          lazyFactory: function() { return this.Location.create(); },
        },
        {
          subType: 'com.google.ymp.geo.Location',
          name: 'location',
          lazyFactory: function() { return this.Location.create(); },
        },
        {
          type: 'Float',
          name: 'distance',
          dynamicValue: function() {
            return Math.sqrt(
                Math.pow(this.basis.longitude - this.location.longitude, 2) +
                Math.pow(this.basis.latitude - this.location.latitude, 2));
          },
        },
      ],
    },
  ],

  properties: [
    {
      type: 'foam.core.types.DAO',
      name: 'dao',
    },
    {
      subType: 'Property',
      documentation: 'The longitude property of objects in $$DOC{ref:".dao"}',
      name: 'longitudeProperty',
      lazyFactory: function() {
        return this.Market.LONGITUDE;
        // For when PropertySequence and index MDAO get along:
        // return this.Market.LOCATION.dot(this.Location.LONGITUDE);
      },
    },
    {
      subType: 'Property',
      name: 'latitudeProperty',
      documentation: 'The latitude property of objects in $$DOC{ref:".dao"}',
      lazyFactory: function() {
        return this.Market.LATITUDE;
        // For when PropertySequence and index MDAO get along:
        // return this.Market.LOCATION.dot(this.Location.LATITUDE);
      },
    },
  ],

  methods: [
    function findNearby(ret, location) {
      var rLoc = this.RelativeLocation.create({ basis: location });
      var dao = this.MDAO.create({ model: this.RelativeLocation });

      var putRLoc = function(location) {
        var newRLoc = rLoc.clone();
        newRLoc.id = location.id;
        newRLoc.location = location;
        dao.put(newRLoc);
      };

      var par = [
        this.dao.where(GTE(this.longitudeProperty, location.longitude))
            .orderBy(this.longitudeProperty).limit(4).select({ put: putRLoc }),
        this.dao.where(LT(this.longitudeProperty, location.longitude))
            .orderBy(DESC(this.longitudeProperty)).limit(4).select({ put: putRLoc }),
        this.dao.where(GTE(this.latitudeProperty, location.latitude))
            .orderBy(this.latitudeProperty).limit(4).select({ put: putRLoc }),
        this.dao.where(LT(this.latitudeProperty, location.latitude))
            .orderBy(DESC(this.latitudeProperty)).limit(4).select({ put: putRLoc }),
      ];
      apar.apply(null, par)(this.findNearby_.bind(this, ret, dao));
    },
    function findNearby_(ret, dao) {
      var arr = [];
      dao.orderBy(this.RelativeLocation.DISTANCE).select({
        put: function(rLoc) {
          arr.push(rLoc.location);
        },
      })(function() { ret(arr); });
    },
  ],
});
