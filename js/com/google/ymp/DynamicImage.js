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
    LOD_HIGH: 512, // these approximate pixel sizes, but are not intended to be exact. 
    LOD_MEDIUM: 128,
    LOD_LOW: 32,
    LOD_TINY: 0, // tiny vector images only
  },

  properties: [
    {
      type: 'Int',
      name: 'levelOfDetail',
      defaultValue: 512,
    },
    {
      type: 'String',
      name: 'imageID',
      help: 'The ID of the image. Multiple DynamicImage instances will share this ID, each representing a different leve of detail.',
    }
    {
      type: 'Image',
      help: 'The image data in data:url format',
    },
    { type: 'Int', name: 'width'  },
    { type: 'Int', name: 'height' },
  ],
});
