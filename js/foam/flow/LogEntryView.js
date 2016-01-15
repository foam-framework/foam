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
  name: 'LogEntryView',
  package: 'foam.flow',
  extends: 'foam.flow.Element',

  constants: { ELEMENT_NAME: 'log-entry' },

  properties: [
    {
      name: 'data',
      // type: 'foam.flow.LogEntry'
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <num>{{this.data.id}}</num><{{{this.data.mode}}}>{{this.data.contents}}</{{{this.data.mode}}}>
    */},
    function CSS() {/*
      log-entry {
        display: flex;
      }
      log-entry > num {
        min-width: 35px;
        max-width: 35px;
        display: inline-block;
        text-align: right;
        padding-right: 13px;
        font-weight: bold;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background: #E0E0E0;
      }
      log-entry > log, log-entry > warn, log-entry > error {
        padding-left: 4px;
        white-space: pre-wrap;
      }
      log-entry > log {
        color: #333;
      }
      log-entry > warn {
        color: #CC9900;
      }
      log-entry > error {
        color: #C00;
      }
    */}
  ]
});
