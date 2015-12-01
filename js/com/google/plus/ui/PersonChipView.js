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
  package: 'com.google.plus.ui',
  name: 'PersonChipView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.plus.ui.ChipListView',
    'foam.ui.ReferenceListResolver',
  ],

  imports: [
    'data',
    'personDAO',
  ],
  exports: [ 'data' ],

  properties: [ [ 'nodeName', 'PLUS-PERSON-CHIP' ] ],

  methods: [
    function initE() {
      return this.cls('md-body')
        .add(this.ChipListView.create({}, this.Y.sub({
          data: this.ReferenceListResolver.create({
            dao: this.personDAO,
            subType: 'com.google.plus.Person',
            subKey: 'ID',
            data: [this.data],
          }).resolvedData
        })));
    }
  ]
});
