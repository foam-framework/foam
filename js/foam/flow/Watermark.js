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
  name: 'Watermark',
  package: 'foam.flow',
  extends: 'foam.flow.Element',

  properties: [
    {
      name: 'text',
      defaultValue: 'watermark'
    }
  ],

  templates: [
    function toInnerHTML() {/* <text>{{{this.text}}}</text> */},
    function CSS() {/*
      watermark {
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        z-index: -1;
        color: #f3f3f3;
        font-size: 100px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      watermark > text {
        text-transform: uppercase;
        transform: rotate(45deg);
      }
    */}
  ]
});
