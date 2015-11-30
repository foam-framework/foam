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
  name: 'ShareListView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.plus.ui.ChipListView',
    'foam.ui.ReferenceListResolver',
    'foam.ui.md.ToolbarAction'
  ],

  imports: [
    'circleDAO',
    'data',
    'mdToolbar',
    'personDAO'
  ],
  exports: [ 'data' ],

  properties: [ [ 'nodeName', 'PLUS-SHARE-LIST' ] ],

  methods: [
    function initE() {
      this.mdToolbar && this.mdToolbar.addRightAction(
        this.ToolbarAction.create({
          action: this.EDIT,
          data: this
        })
      );
      return this.cls('md-body').start('div').cls('history-section').cls('chip-historical')
        .add(this.ChipListView.create({}, this.Y.sub({
          data: this.data.history
        })))
      .end()
      .start('div').cls('circles-section')
        .add(this.ChipListView.create({}, this.Y.sub({
          data: this.ReferenceListResolver.create({
            dao: this.circleDAO,
            subType: 'com.google.plus.Circle',
            subKey: 'ID',
            data: this.data.circles,
          }).resolvedData
        })))
      .end()
      .start('div').cls('people-section')
        .add(this.ChipListView.create({}, this.Y.sub({
          data: this.ReferenceListResolver.create({
            dao: this.personDAO,
            subType: 'com.google.plus.Person',
            subKey: 'ID',
            data: this.data.people,
          }).resolvedData
        })))
      .end();
    },
  ],

  actions: [
    {
      name: 'edit',
      ligature: 'forward',
      isEnabled: function() { return true; },
      code: function() {
        console.log("Edit!");
      }
    }
  ],

  templates: [
    function CSS() {/*
      plus-share-list {
        display: flex;
        flex-direction: column;
        white-space: pre-line;
        cursor: pointer;
      }
      plus-share-list .history-section {
        display: flex;
        flex-direction: row;
      }
      plus-share-list .circles-section {
        display: flex;
        flex-direction: row;
      }
      plus-share-list .people-section {
        display: flex;
        flex-direction: row;
      }
    */}
  ]
});
