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
  name: 'ContactRowView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.ymp.ui.ContactRow',
    'foam.ui.Icon',
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old,nu) {
        if ( nu ) {
          var icon;
          switch (nu.type) {
          case 'phone':
            icon = 'phone';
            break;
          case 'email':
            icon = 'mail';
            break;
          case 'facebook': // TODO: Already have facebook icon somewhere?
          case 'twitter': // TODO: Already have twitter icon somewhere?
          default:
            icon = 'lens'; // for anything else just show a circle
          }
          this.iconValue = icon;
        }
      }
    },
    {
      type: 'String',
      name: 'iconValue',
    },
  ],

  templates: [
    function initE() {/*#U2
        <div class="^flex-row">
          <i class="material-icons-extended ^icon" style="font-size: 30px; color: currentColor">{{ this.iconValue$ }}</i>
          <span class="^detail">{{ this.data.rawContact$ }}</span>
        </div>
    */},
    function CSS() {/*
      ^flex-row {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      ^detail {
        margin: 8px;
      }
      ^icon {
        margin: 8px;
      }
    */},

  ]
});