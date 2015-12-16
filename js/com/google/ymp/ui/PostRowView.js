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
  name: 'PostRowView',
  extends: 'foam.u2.View',
  templates: [
    function initE() {/*#U2
      <div class="$">
        <div class="$-flex-col">
          <div class="$-md-heading">{{this.data.title}}</div>
        </div>
      </div>
    */},
    function CSS() {/*
      $-flex-col {
        display: flex;
        flex-direction: column;
        padding: 16px;
      }
      $-md-heading {
        font-size: 20px;
        color: argb(0,0,0,0.75);
        margin-bottom: 8px;
      }
    */},
  ]
});