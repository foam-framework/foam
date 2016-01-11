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
  name: 'SettingsView',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.apps.builder.AppBuilderContext',
    'foam.ui.md.CheckboxView',
  ],
  imports: [
    'appBuilderAnalyticsEnabled$ as analyticsEnabled$',
    'popup',
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'analyticsEnabled',
      label: 'Send app usage data from my apps to the App Builder team ' +
          'to help make App Builder better<br><a href="#">Learn more</a>',
      defaultValue: true,
    },
  ],

  actions: [
    {
      name: 'closePopup',
      label: 'Close',
      code: function() { this.popup && this.popup.close(); },
    },
  ],

  templates: [
    function toHTML() {/*
      <settings-page id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-card-heading"><p class="md-title">Settings</p></div>
        <div class="md-card-heading-content-spacer"></div>
        <div class="md-card-content">
          $$analyticsEnabled{
            model_: 'foam.ui.md.CheckboxView',
            extraClassName: 'analyticsEnabled',
          }
        </div>
        <div class="md-card-content-footer-spacer"></div>
        <div class="md-actions md-card-footer horizontal">
          $$closePopup
        </div>
      </settings-page>
    */},
    function CSS() {/*
      settings-page {
        display: flex;
        flex-direction: column;
      }
      settings-page .analyticsEnabled .md-grey {
        opacity: 1.0;
      }
    */},
  ]
});
