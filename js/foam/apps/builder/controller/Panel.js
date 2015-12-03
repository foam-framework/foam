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
  package: 'foam.apps.builder.controller',
  name: 'Panel',
  extends: 'foam.ui.SimpleView',

  documentation: 'View decorator that wraps the view in a full-height panel.',

  properties: [
    {
      name: 'className',
      defaultValue: 'stackview-panel',
    },
    'view'
  ],

  templates: [
    function toHTML() {/*
      <stackview-panel id="%%id" %%cssClassAttr()>
        %%view
      </stackview-panel>
    */},
    function CSS() {/*
      stackview-panel {
        background-color: #fff;
        height: 100%;
        position: absolute;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
    */},
  ],
});
