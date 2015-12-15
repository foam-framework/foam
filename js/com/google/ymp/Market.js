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
  traits: [ 'foam.core.dao.SyncTrait' ],
  
  requires: [ 'com.google.ymp.geo.Location' ],

  properties: [
    {
      type: 'String',
      name: 'name',
    },
    {
      subType: 'com.google.ymp.geo.Location',
      name: 'location',
      lazyFactory: function() { return this.Location.create(); },
    },
    {
      type: 'Reference',
      name: 'image',
      subType: 'com.google.ymp.DynamicImage',
      subKey: 'imageID',
      defaultValue: '',
    },
  ],
});
