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
  package: 'com.google.ymp.bb',
  name: 'PostFilter',
  extends: 'com.google.ymp.GuidIDBase',
  traits: ['foam.core.dao.SyncTrait'],

  documentation: function() {/* A labeled (user, post) binding that can be used
    by views for filtering (e.g., dismissed, starred, etc.). */},

  properties: [
    {
      type: 'Reference',
      subType: 'com.google.ymp.Person',
      name: 'person',
      documentation: 'ID of the user for whom the filter applies',
    },
    {
      type: 'Reference',
      subType: 'com.google.ymp.bb.Post',
      name: 'post',
      documentation: 'ID of the post against which the filter is applied',
    },
    {
      type: 'foam.core.types.StringEnum',
      name: 'type',
      documentation: 'A label indicating the type of filter applied',
      defaultValue: 'STARRED',
      choices: [
        ['STARRED', 'Starred'],
        ['DISMISSED', 'Dismissed'],
      ],
    },
  ],
});
