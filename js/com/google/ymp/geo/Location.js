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
  name: 'Location',
  extends: 'com.google.ymp.GuidIDBase',

  properties: [
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
      type: 'String',
      name: 'locality',
      defaultValue: 'Kitchener',
    },
    {
      type: 'String',
      name: 'region',
      defaultValue: 'Ontario',
    },
    {
      type: 'String',
      name: 'country',
      defaultValue: 'Canada',
    },
  ],
});
