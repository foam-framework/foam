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

  documentation: 'View decorator that wraps the view in an overlay.',

  imports: [ 'stack' ],

  properties: [ 'view' ],

  templates: [
    function toHTML() {/*
      <stackview-overlay-container id="%%id" %%cssClassAttr()>
        <stackview-overlay id="%%id-overlay"></stackview-overlay>
        %%view
      </div>
      <% this.on('click', function() {
           this.stack.popView();
         }.bind(this), this.id + '-overlay'); %>
    */},
    function CSS() {/*
      stackview-overlay-container, stackview-overlay {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      stackview-overlay-container {
        z-index: 1000;
        overflow: hidden;
      }
      stackview-overlay {
        background: #000;
        opacity: 0.7;
      }
    */},
  ],
});
