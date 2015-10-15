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
  package: 'foam.apps.builder',
  name: 'MenuItemCitationView',
  extends: 'foam.ui.View',

  requires: [
    'foam.ui.md.HaloView'
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'menu-item-citation',
    },
    {
      name: 'halo',
      lazyFactory: function() {
        return this.HaloView.create({
          className: 'halo',
          recentering: false,
          pressedAlpha: 0.2,
          startAlpha: 0.2,
          finishAlpha: 0
        }, this.Y);
      }
    },
  ],

  templates: [
    function CSS() {/*
      .menu-item-citation {
        position: relative;
        align-items: center;
        display: flex;
        font-size: 16px;
        height: 42px;
        line-height: 42px;
        padding: 8px 16px;
      }
      .menu-item-citation .halo {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
      }
      .menu-item-citation img {
        flex-grow: 0;
        flex-shrink: 0;
        height: 24px;
        margin-right: 25px;
        opacity: 0.6;
        width: 24px;
      }
      .browser-label {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        %%halo
        <% if ( this.data.iconUrl ) { %>
          $$iconUrl
        <% } %>
        $$label{ mode: 'read-only', extraClassName: 'browser-label' }
      </div>
    */},
  ]
});
