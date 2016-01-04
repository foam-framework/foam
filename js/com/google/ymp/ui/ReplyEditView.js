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
  package: 'com.google.ymp.ui',
  name: 'ReplyEditView',
  extends: 'foam.u2.View',

  imports: [
    'currentUser',
  ],

  templates: [
    function initE() {/*#U2
      <div class="^">
        <p>Public Reply as &nbsp;{{ this.currentUser.name }} </p>
        <:content displayHeight="4" />
      </div>
    */},
    function CSS() {/*
      ^ {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 8px;
      }
    */},
  ]
});
