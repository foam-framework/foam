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
  name: 'Post',
  extends: 'com.google.ymp.GuidIDBase',
  traits: [
    'foam.core.dao.SyncTrait',
    'com.google.ymp.CreationTimeTrait',
  ],
  requires: [
    'com.google.ymp.ui.ContactProfileView',
    'com.google.ymp.ui.MarketChipView',
    'com.google.ymp.ui.PostRowView',
    'com.google.ymp.ui.PostView',
    'com.google.ymp.ui.PostEditView',
    'com.google.ymp.ui.PersonChipView',
    'foam.u2.md.DetailView',
    'com.google.ymp.ui.DynamicImageView',
  ],

  properties: [
    {
      type: 'String',
      name: 'title',
    },
    {
      type: 'Reference',
      subType: 'com.google.ymp.Market',
      name: 'market',
      toPropertyE: 'com.google.ymp.ui.MarketChipView',
    },
    {
      type: 'Reference',
      name: 'author',
      subType: 'com.google.ymp.Person',
      toPropertyE: 'com.google.ymp.ui.PersonChipView',
    },
    {
      type: 'Reference',
      name: 'image',
      subType: 'com.google.ymp.DynamicImage',
      subKey: 'imageID',
      toPropertyE: 'com.google.ymp.ui.DynamicImageView',
    },
    {
      type: 'Reference',
      name: 'contact',
      subType: 'com.google.ymp.bb.ContactProfile',
      toPropertyE: 'com.google.ymp.ui.ContactProfileView',
    },
    {
      type: 'String',
      name: 'content',
    },
  ],

  methods: [
    function toE(X) {
      // return this.DetailView.create({ data: this });
      // TODO(bruthig): Replace DetailView with PostView when PostView is implemented.
      return (X.controllerMode == 'view') ?
        X.lookup('com.google.ymp.ui.PostView').create({ data: this }, X) :
        X.lookup('com.google.ymp.ui.PostEditView').create({ data: this }, X);
    },
    function toRowE(X) {
      return X.lookup('com.google.ymp.ui.PostRowView').create({ data: this }, X);
    },
  ],
});
