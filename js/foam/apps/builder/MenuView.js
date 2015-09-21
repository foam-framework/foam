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
  extendsModel: 'foam.ui.SimpleView',
  traits: [
  ],

  requires: [
    'foam.ui.DAOListView',
  ],
  imports: [
  ],
  exports: [
  ],

  properties: [
    {
      model_:'ViewFactoryProperty',
      name: 'list',
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id">
        <logo>
          <content>
            <icons>
              <wrench><i class="material-icons-extended" style="font-size: 90px;color:#fff;">build</i></wrench>
              <display><i class="material-icons-extended" style="font-size: 225px;color:#000">campaign_display</i></display>
            </icons>
          </content>
        </logo>
        %%list()
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
        top: -10px;
        left: -10px;
      }
      logo display {
        display: block;
        padding-top: 4px;
        padding-left: 25px;
      }
    */},
  ],
});
