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
  name: 'SummaryView',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.apps.builder.wizard.WizardStackView',
  ],

  actions: [
    {
      name: 'edit',
      label: 'Change',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAZ0lEQVR4AdXOrQ2AMBRF4bMc/zOUOSrYoYI5cQQwpAieQDW3qQBO7Xebxx8bWAk5/CASmRHzRHtB+d0Bkw0W5ZiT0SYbFcl6u/2eeJHbxIHOhWO6Er6/y9syXpMul5PLefAGKZ1/rwtTimwbWLpiCgAAAABJRU5ErkJggg==',
      ligature: 'edit',
      code: function() {
        var view = this.WizardStackView.create({
              firstPage: {
                factory_: this.wizardStartPageName,
                data$: this.data$,
          }});
        view.open();
      }
    },
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old,nu) {
        if ( old ) old.removeListener(this.refresh);
        if ( nu ) nu.addListener(this.refresh);
      }
    },
    {
      type: 'String',
      name: 'wizardStartPageName',
    },
    {
      name: 'className',
      defaultValue: 'md-summary-view',
    },
    {
      type: 'ViewFactory',
      name: 'citationViewFactory',
    },
    {
      type: 'ViewFactory',
      name: 'icon',
      defaultValue: {
        factory_: 'foam.ui.Icon',
        ligature: 'widgets',
        color: 'white',
        fontSize: '48',
        width: 48,
        height: 48,
      },
    },
  ],

  listeners: [
    {
      name: 'refresh',
      code: function() { this.updateHTML(); },
    }
  ],

  methods: [
    function shouldDestroy() { return true; },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-summary-view-name">
          %%icon()
          %%citationViewFactory()
          $$edit{ color: 'white' }
        </div>
      </div>
    */},
    function CSS() {/*
      .md-summary-view {
        margin: 16px;
        padding: 8px;
        background: #888;
        box-shadow: 0px 2px 4px #999;
        color: white;
      }
      @media (max-width: 600px) {
        .md-summary-view {
          margin-left: 0px;
          margin-right: 0px;
        }
      }

      .md-summary-view-name {
        align-items: baseline;
        display: flex;
        flex-direction: row;
      }
      .md-summary-view-name .md-button {
        margin: 0px;
      }
      .md-summary-view-name > :nth-child(1){ margin: 8px; align-self: center;  flex-grow: 0;}
      .md-summary-view-name > :nth-child(2){ min-width: 12em; flex-grow: 1; }
      .md-summary-view-name > :nth-child(3){ flex-grow: 0; align-self: center; }
    */},
  ],

});
