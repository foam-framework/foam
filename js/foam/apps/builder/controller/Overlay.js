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
  name: 'Overlay',
  extends: 'foam.ui.SimpleView',

  properties: [ 'view' ],

  templates: [
    function toHTML() {/*
      <div id="%%id" class="stackview-overlay-container">
        <div id="%%id-overlay" class="stackview-overlay"></div>
        %%view
      </div>
    */},
    function CSS() {/*
      .stackview-overlay-container, .stackview-overlay {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      .stackview-overlay {
        background: #000;
        opacity: 0.7;
      }
    */},
  ],
});
