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
  name: 'Reply',
  extends: 'com.google.ymp.GuidIDBase',
  traits: [
    'foam.core.dao.SyncTrait',
    'com.google.ymp.CreationTimeTrait',
  ],
  requires: [
    'com.google.ymp.ui.ReplyRowView',
    'com.google.ymp.ui.ReplyView',
    'com.google.ymp.ui.ReplyEditView',
  ],

  properties: [
    {
      name: 'content',
      defaultValue: '',
      displayHeight: 4,
    },
    {
      type: 'Reference',
      name: 'author',
      subType: 'com.google.ymp.Person',
      toPropertyE: 'com.google.ymp.ui.PersonChipView',
    },
    {
      type: 'Reference',
      name: 'parentPost',
      subType: 'com.google.ymp.Post',
    },
    {
      type: 'Reference',
      subType: 'com.google.ymp.Market',
      name: 'market',
    },
  ],

  methods: [
    function toE(X) {
      return (X.controllerMode == 'view') ?
        X.lookup('com.google.ymp.ui.ReplyView').create({ data: this }, X) :
        X.lookup('com.google.ymp.ui.ReplyEditView').create({ data: this }, X);
    },
    function toRowE(X) {
      return X.lookup('com.google.ymp.ui.ReplyRowView').create({ data: this }, X);
    },
  ]
});
