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
  name: 'DeviceInfoWizard',
  extends: 'foam.apps.builder.wizard.WizardPage',

  requires: [
    'foam.apps.builder.kiosk.AdvancedInfoWizard',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: 'foam.apps.builder.kiosk.AdvancedInfoWizard',
    },
    {
      name: 'title',
      defaultValue: 'Device Info',
    },
  ],

  templates: [
    function instructionHTML() {/*
      <span>
        In order to load your app properly, you'll need to configure some basic
        device-level info. For example, if users shouldn't be able to switch
        apps (i.e., this is the only app that runs on the device), then you want
        the device to run in "Kiosk mode". You can also select device
        orientaiton according to how your kiosk device is mounted.
      </span>
    */},
    function contentHTML() {/*
      $$kioskEnabled
      $$virtualKeyboardEnabled
      $$rotation
      $$defaultWindowWidth
      $$defaultWindowHeight
      $$minWindowWidth
      $$minWindowHeight
    */},
  ],
});
