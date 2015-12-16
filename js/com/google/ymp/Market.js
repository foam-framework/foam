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
  package: 'com.google.ymp',
  name: 'Market',
  extends: 'com.google.ymp.GuidIDBase',
  traits: [ 'com.google.ymp.CreationTimeTrait' ],
  requires: [
    'com.google.ymp.geo.Location',
    'com.google.ymp.ui.MarketRowView',
    'com.google.ymp.ui.MarketView',
  ],

  properties: [
    {
      type: 'String',
      name: 'name',
    },
    {
      subType: 'com.google.ymp.geo.Location',
      name: 'location',
      lazyFactory: function() { return this.Location.create(); },
      preSet: function(_, nu) {
        if ( ! this.Location.isInstance(nu) ) {
          throw new Error('Invalid location');
        }
        return nu;
      },
    },
    // This is redundant, but it allows us to automatically create
    // indices over longitude and latitude.
    {
      type: 'Float',
      name: 'longitude',
      defaultValue: -80.499342,
    },
    {
      type: 'Float',
      name: 'latitude',
      defaultValue: 43.4541486,
    },
    {
      type: 'Reference',
      name: 'image',
      subType: 'com.google.ymp.DynamicImage',
      subKey: 'imageID',
      defaultValue: '',
    },
  ],

  methods: [
    function toE(X) {
      return X.lookup('com.google.ymp.ui.MarketView').create({ data: this }, X);
    },
    function toRowE(X) {
      return X.lookup('com.google.ymp.ui.MarketRowView').create({ data: this }, X);
    },
  ],
});
