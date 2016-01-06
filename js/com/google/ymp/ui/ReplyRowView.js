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
      <div class="^">
        <div class="^flex-row">
          <div class="^author"><:author /></div>
          <div class="^date">{{ this.data.creationTime.toLocaleString() }}</div>
        </div>
        <div class="^content">{{this.data.content}}</div>
      </div>
    */},
    function CSS() {/*
      ^ {
        display: flex;
        flex-direction: column;
        background-color: rgba(240,240,255, 0.25);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
        border-radius: 3px;
        max-height: 96px;
        overflow: hidden;
        padding: 8px;
        margin-bottom: 8px;
      }
      ^content {
        margin: 8px;
      }
      ^author {
        border-radius: 8px;
        background-color: rgba(0,0,0,0.1);
        padding: 4px;
      }
      ^date {
        font-size: 14px;
        color: rgba(0,0,0,0.54);
      }
      ^flex-row {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        justify-content: space-between;
      }
    */},

  ]
});
