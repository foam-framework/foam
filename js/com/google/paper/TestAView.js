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
  package: 'com.google.paper',
  name: 'TestAView',

  requires: [
    'com.google.paper.QRView',
    'com.google.paper.VideoCaptureView',
  ],

  extends: 'foam.ui.md.DetailView',

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %> >
        $$source
        $$label
        $$dataURL{ model_: 'com.google.paper.VideoCaptureView' }
        $$reinflated
        $$qr{ model_: 'com.google.paper.QRView' }
      </div>
    */},
    function CSS() {/*
      svg {
        max-width: 500px;
      }
    */},

  ],

});


