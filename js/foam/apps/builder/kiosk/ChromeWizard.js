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
  package: 'foam.apps.builder.kiosk',
  name: 'ChromeWizard',
  extends: 'foam.apps.builder.wizard.WizardPage',

  requires: [
    'foam.apps.builder.kiosk.ChromeView',
    'foam.apps.builder.kiosk.DeviceInfoWizard',
    'foam.ui.md.FlatButton',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: 'foam.apps.builder.kiosk.DeviceInfoWizard',
    },
    {
      name: 'title',
      defaultValue: 'Navigation Settings',
    },
  ],

  templates: [
    function instructionHTML() {/*
      <span>
        Your kiosk will have a navigation bar that appears above the web
        content. Use the settings below to customize the navigation bar
        controls. A preview of what the navigation bar looks like is shown
        below:
      </span>
    */},
    function contentHTML() {/*
      <% var chromeViewX = this.Y.sub();
         chromeViewX.registerModel(this.FlatButton.xbind({
           displayMode: 'ICON_ONLY',
           height: 24,
           width: 24,
           color: 'black'
         }), 'foam.ui.ActionButton'); %>
      $$data{
        model_: 'foam.apps.builder.kiosk.ChromeView',
        X: chromeViewX,
      }
      $$enableNavBttns
      $$enableHomeBttn
      $$enableReloadBttn
      $$enableLogoutBttn
      $$enableNavBar
    */},
  ],
});
