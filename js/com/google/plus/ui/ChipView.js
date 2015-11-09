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
  name: 'ChipView',
  extends: 'foam.u2.View',

  properties: [ [ 'nodeName', 'PLUS-CHIP' ] ],

  methods: [
    function initE() {
      return this.add(this.data.displayName$);
    },
  ],

  templates: [
    function CSS() {/*
      plus-chip {
        display: inline-block;
        padding: 3px 8px;
        margin: 3px;
        white-space: pre-line;
        cursor: pointer;
        border-radius: 8px;
        flex-grow: 0;
        flex-shrink: 0;
        line-height: 12px;
        background-color: grey;
        color: white;
        box-shadow: 0 1px 1px rgba(0,0,0,.25);
      }
      .chip-historical plus-chip {
        background-color: transparent;
        color: grey;
      }
    */},
  ],
});
