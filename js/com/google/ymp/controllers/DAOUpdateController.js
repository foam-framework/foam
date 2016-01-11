/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'com.google.ymp.controllers',
  name: 'DAOUpdateController',
  extends: 'foam.u2.DAOUpdateController',

  imports: [
    'postId$',
  ],

  properties: [
    {
      type: 'String',
      name: 'postId',
    },
  ],

  listeners: [
    {
      name: 'doBack',
      framed: true,
      code: function() {
        this.postId = '';
        this.X.stack.popView();
      },
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        flex-direction: column;
        display: flex;
        flex-grow: 1;
        overflow: hidden;
      }
      ^body {
        overflow-x: hidden;
        overflow-y: auto;
        flex-shrink: 1;
      }
    */},
  ],
});
