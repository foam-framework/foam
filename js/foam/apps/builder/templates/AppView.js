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
  name: 'AppView',
  extends: 'foam.ui.SimpleView',

  exports: [
    'previewSelectionGuard as selection',
  ],

  properties: [
    'data',
    {
      type: 'ViewFactory',
      name: 'delegate',
    },
    {
      name: 'delegateView',
      defaultValue: null,
    },
    {
      name: 'previewSelectionGuard',
      defaultValue: '',
    },
  ],

  templates: [
    function toHTML() {/*
      <preview-frame id="%%id" %%cssClassAttr()>
        <% this.toInnerHTML(out); %>
      </preview-frame>
    */},
    function toInnerHTML() {/*
      <% this.delegateView = this.delegate({ data$: this.data$ }, this.Y); %>
      <%= this.delegateView %>
    */},
    function CSS() {/*
      preview-frame {
        position: relative;
        margin: 16px;
        border: 16px solid grey;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        box-shadow: 0px 3px 4px #444;
        overflow-y: auto;
        min-height: 400px;
        max-height: 100%;
        height: 600px;
      }
      builder preview-frame .md-update-detail-view-body {
        overflow-y: auto;
      }

      @media (max-width: 600px) {
        preview-frame {
          margin: 0px;
          border: 8px solid grey;
          border-radius: 8px;
        }
      }
    */}
  ]
});
