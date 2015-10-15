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
  package: 'foam.apps.builder.templates',
  name: 'PanelView',
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.apps.builder.dao.DAOSummaryView',
    'foam.apps.builder.datamodels.ModelSummaryView',
  ],

  templates: [
    function toHTML() {/*
      <template-panel id="%%id" %%cssClassAttr()>
        <div class="flex-row">
          $$appName
          $$version
        </div>
        <div class="flex-row-wrap">
      <% if ( this.data && this.data.getDataConfig() && this.data.getDataConfig().model ) { %>
          $$data{ model_: 'foam.apps.builder.datamodels.ModelSummaryView' }
      <% } %>
      <% if ( this.data && this.data.getDataConfig() && this.data.getDataConfig().dao ) { %>
          $$data{ model_: 'foam.apps.builder.dao.DAOSummaryView' }
      <% } %>
        </div>
      </template-panel>
    */},
    function CSS() {/*
      template-panel { display: block; }
      template-panel .flex-row-wrap {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        flex-shrink: 0;
      }
      template-panel .flex-row-wrap > * {
        flex-grow: 1;
      }

      template-panel .flex-row {
        display: flex;
        flex-direction: row;
        flex-shrink: 0;
      }
      template-panel .flex-row :first-child {
        flex-grow: 1;
      }
    */}
  ]
});
