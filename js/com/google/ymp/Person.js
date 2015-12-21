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
  name: 'Person',
  extends: 'com.google.ymp.GuidIDBase',
  traits: [
    'foam.core.dao.SyncTrait',
    'com.google.ymp.CreationTimeTrait',
  ],

  properties: [
    {
      type: 'String',
      name: 'name',
    },
    {
      type: 'Reference',
      subType: 'com.google.ymp.DynamicImage',
      name: 'image',
    },
    {
      type: 'Reference',
      subType: 'com.google.ymp.bb.ContactProfile',
      name: 'defaultContactProfile',
    },
    {
      type: 'Int',
      name: 'defaultImageLOD',
      defaultValue: 8,
    },
    {
      type: 'ReferenceArray',
      name: 'subscribedMarkets',
      subType: 'com.google.ymp.Market',
      help: 'The marketplaces full of posts that should be synched',
    },
  ],
});
