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
  name: 'PostView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.ymp.ui.ColorPicker',
    'com.google.ymp.ui.DynamicImageLoader',
  ],

  templates: [
    function initE() {/*#U2
      <div class="$">
        <div class="$-flex-col">
          <:image width="100%" />
          <:content showLabel="false" />
          <div class="$-author">Posted by&nbsp;<:author /></div>
          <div class="$-separator"></div>
          <div><:contact /></div>
        </div>
      </div>
    */},
    function CSS() {/*
      $-flex-col {
        display: flex;
        flex-direction: column;
        padding: 16px;
      }
      $-author {
        text-align: right;
        margin-bottom: 4px;
        opacity: 0.54;
      }
      $-separator {
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 4px;
      }
    */},
  ]
});