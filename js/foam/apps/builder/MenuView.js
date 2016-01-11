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
  name: 'MenuView',
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.DAOListView',
    'foam.ui.ImageView',
    'foam.ui.md.FlatButton',
  ],

  properties: [
    {
      name: 'data',
    },
    {
      type: 'ViewFactory',
      name: 'selectionList',
    },
    {
      type: 'ViewFactory',
      name: 'accountList',
    },
    {
      type: 'ViewFactory',
      name: 'viewList',
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id">
        <logo>
          <content>
            <icons>
              <wrench><i class="material-icons-extended" style="font-size: 90px;color:#fff;">build</i></wrench>
              <display><i class="material-icons-extended" style="font-size: 225px;color:#000">campaign_show</i></display>
              <dot></dot>
            </icons>
          </content>
        </logo>
        %%selectionList()
        <% if ( this.accountList ) { %>
          <hr />
          %%accountList()
          <div class="flush-right">
            $$addAccount{
              model_: 'foam.ui.md.FlatButton',
              displayMode: 'ICON_ONLY',
            }
          </div>
        <% } %>
        <% if ( this.viewList ) { %>
          <hr />
          %%viewList()
        <% } %>
      </div>
    */},
    function CSS() {/*
      logo {
        display: block;
        position: relative;
        width: 100%;
      }
      logo:before {
        content: "";
        display: block;
        padding-top: 80%;
      }
      logo content {
        display: block;
        position:  absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        overflow: hidden;
        background-color: #ff3f80;
      }
      logo icons {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
      }
      logo wrench {
        display: block;
        position: absolute;
        transform: rotate(180deg);
        transform-origin: 15px 15px;
        animation: torque 600ms ease 3s 2;
        top: 55px;
        left: 55px;
      }
      @keyframes torque {
        0% { transform: rotate(180deg); }
        50% { transform: rotate(120deg); }
        100% { transform: rotate(180deg); }
      }

      logo dot {
        display: block;
        position: absolute;
        top: 62px;
        left: 62px;
        width: 16px;
        height: 16px;
        border-radius: 8px;
        background: grey;

      }

      logo display {
        display: block;
        padding-top: 8px;
        padding-left: 32px;
      }

      .flush-right {
        display: flex;
        justify-content: flex-end;
        color: #02A8F3;
      }

      .profile-image { border-radius: 50%; }
    */},
  ],
});
