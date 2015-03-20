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
  name: 'SourceCode',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  properties: [
    {
      model_: 'IntProperty',
      name: 'id',
      defaultValue: 0
    },
    {
      model_: 'StringProperty',
      name: 'data'
    },
    {
      model_: 'StringProperty',
      name: 'code',
      defaultValue: 'console.log("Hello world!");'
    },
    {
      model_: 'StringProperty',
      name: 'language',
      defaultValue: 'javascript'
    }
  ],

  templates: [
    function toInnerHTML() {/*$$code*/},
    function CSS() {/*
      source-code {
        display: block;
        position: relative;
        max-height: 20em;
        flex-grow: 1;
        padding-left: 4px;
        font: 14px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
        white-space: pre;
        overflow: auto;
      }
    */}
  ]
});
