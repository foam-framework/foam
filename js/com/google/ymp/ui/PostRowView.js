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
  name: 'PostRowView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.ymp.ui.ColorPicker',
    'com.google.ymp.ui.DynamicImagePreView',
  ],
  imports: [
    'personDAO',
  ],

  properties: [
    {
      name: 'authorName',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( ! nu ) {
          this.imgBGColor = '#fff';
          return;
        }
        this.ColorPicker.create().pickColorFromStr(function(color) {
          this.imgBGColor = color;
        }.bind(this), nu);
      },
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        var self = this;
        self.personDAO.find(nu.author, {
          put: function(person) {
            self.authorName = person.name;
          },
        });
      },
    },
    {
      type: 'String',
      name: 'imgBGColor',
      defaultValue: '#fff',
    },
  ],

  templates: [
    function initE() {/*#U2
      <div class="$">
        (( this.Y.registerModel(this.DynamicImagePreView, 'com.google.ymp.ui.DynamicImageView'); ))
        <div class="$-img" style="background-color:{{this.imgBGColor$}}"><:image maxLOD="8" /></div>
        <div class="$-flex-col">
          <div class="$-title">{{this.data.title}}</div>
          <div class="$-author">Posted by<span>&nbsp;</span>{{this.authorName$}}</div>
          <div class="$-desc">{{this.data.content}}</div>
          </div>
        </div>
      </div>
    */},
    function CSS() {/*
      $ {
        display: flex;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
        margin: 10px;
        border-radius: 3px;
        max-height: 96px;
        overflow: hidden;
      }
      $-flex-col {
        display: flex;
        flex-direction: column;
        padding: 16px;
        overflow: hidden;
      }
      $-title {
        font-size: 20px;
        color: argb(0,0,0,0.75);
        margin-bottom: 8px;
      }
      $-author {
        margin-bottom: 4px;
        opacity: 0.54;
      }
      $-title, $-author, $-desc, $-title *, $-author *, $-desc * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      $-img {
        flex-grow: 0;
        flex-shrink: 0;
        overflow: hidden;
        max-width: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 4px;
      }
      $-img img {
       height: 100%;
      }
    */},
  ]
});
