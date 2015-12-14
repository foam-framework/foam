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
  name: 'LocationBase',

  methods: [
    function sanitizeLocation(location) {
      // Fix up a location in-place. If it's out of bounds put it "just barely
      // in bounds", but close to the described location.
      if ( location.longitude < -180 )
        location.longitude = -180 + (Math.random() / 1000);
      if ( location.longitude > 180 )
        location.longitude = 180 - (Math.random() / 1000);
      if ( location.latitude < -90 )
        location.longitude = -90 + (Math.random() / 1000);
      if ( location.latitude > 90 )
        location.longitude = 90 - (Math.random() / 1000);
      return location;
    },
  ],
});
