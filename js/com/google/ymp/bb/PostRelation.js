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
  name: 'PostRelation',
  traits: ['foam.core.dao.SyncTrait'],

  documentation: function() {/* A labeled (post 1, post 2) relation that can be
    used for recommendations and/or notifications. */},

  properties: [
    {
      name: 'id',
      documentation: 'Composite ID that will prevent duplication in DAOs',
      lazyFactory: function() {
        return this.market + ':' + this.post + ':' + this.related + ':' +
            this.type;
      },
    },
    {
      type: 'Reference',
      subType: 'com.google.ymp.Market',
      name: 'market',
      documentation: "ID of the market of $$DOC{ref:'.post'}",
    },
    {
      type: 'Reference',
      subType: 'com.google.ymp.bb.Post',
      name: 'post',
      documentation: 'ID of the post from which the relation was discovered',
    },
    {
      type: 'Reference',
      subType: 'com.google.ymp.bb.Post',
      name: 'related',
      documentation: 'ID of the post discovered to be related',
    },
    {
      type: 'foam.core.types.StringEnum',
      name: 'type',
      documentation: 'A label indicating the type of relation',
      defaultValue: 'REQ_TO_AD',
      choices: [
        ['REQ_TO_AD', 'Request has related ad'],
        ['REQ_TO_INFO', 'Request has related information'],
        ['AD_TO_REQ', 'Ad has related request'],
        ['AD_TO_INFO', 'Ad has related information'],
        ['INFO_TO_AD', 'Information has related ad'],
        ['INFO_TO_REQ', 'Information has related request'],
      ],
    },
  ],
});
