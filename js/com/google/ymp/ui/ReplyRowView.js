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
  name: 'ReplyRowView',
  extends: 'foam.u2.View',
  templates: [
    function initE() {/*#U2
      <div class="$">
        {{this.data.content}}
      </div>
    */},
    function CSS() {/*
      $ {
        display: flex;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
        margin: 10px;
        border-radius: 3px;
        max-height: 96px;
        overflow: hidden;
        padding: 8px;
      }
    */},

  ]
});