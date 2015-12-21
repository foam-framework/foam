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
  name: 'DynamicImage',
  extends: 'com.google.ymp.GuidIDBase',
  traits: [ 'foam.core.dao.SyncTrait' ],

  constants: {
    LOD_FULL_SIZE: 512, // these approximate KiB sizes, but are not intended to be exact.
    LOD_HIGH: 256, // decent phone display sized
    LOD_MEDIUM: 128, // tile/preview sized
    LOD_LOW: 8, // icon sized
    LOD_TINY: 1, // tiny vector images only
    LOD_LIST: [ 512, 256, 128, 8 ],
  },

  properties: [
    {
      type: 'Int',
      name: 'levelOfDetail',
      defaultValue: 512, // LOD_FULL_SIZE
    },
    {
      type: 'String',
      name: 'imageID',
      help: 'The ID of the image. Multiple DynamicImage instances will share this ID, each representing a different level of detail.',
    },
    {
      type: 'Image',
      name: 'image',
      help: 'The image data in data:url format',
    },
    { type: 'Int', name: 'width'  },
    { type: 'Int', name: 'height' },
    {
      type: 'Reference',
      subType: 'com.google.ymp.Market',
      name: 'market',
    },
  ],
});
