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
  package: 'com.google.ow.ui',
  name: 'SingleStreamView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.ow.model.Envelope',
    'foam.u2.DAOListView',
  ],
  imports: [
    'streamDAO'
  ],

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO',
      lazyFactory: function() {
        return this.streamDAO.where(EQ(this.Envelope.SID, this.data.substream))
            .orderBy(this.Envelope.TIMESTAMP);
      },
    },
  ],

  methods: [
    function initE() {
      return this.add(this.DAOListView.create({
        data: this.filteredDAO,
      }));
    },
  ],

  templates: [
    function CSS() {/* single-stream { display: block; } */},
  ],
});
