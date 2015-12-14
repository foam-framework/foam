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
  name: 'ActualLocationGenerator',

  requires: [
    'com.google.ymp.geo.Location',
  ],
  imports: [
    'navigator',
  ],

  methods: [
    function generate(ret) {
      var n = this.navigator;
      if ( ! (n && n.geolocation && n.geolocation.getCurrentPosition) ) {
        ret(null);
        return;
      }

      n.geolocation.getCurrentPosition(this.generate_.bind(this, ret));
    },
    function generate_(ret, location) {
      ret(this.Location.create({
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      }));
    },
  ],
});
