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
  name: 'BasicInfoWizard',
  extends: 'foam.apps.builder.wizard.WizardPage',

  imports: [
    'selection$',
  ],

  requires: [
    'foam.apps.builder.kiosk.ChromeWizard',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: 'foam.apps.builder.kiosk.ChromeWizard',
    },
    {
      name: 'title',
      defaultValue: 'Basic Info',
    },
  ],

  methods: [
    function onNext() {
      this.SUPER();
      this.selection = this.data; // Imported selection from browser's main list.
    }
  ],

  templates: [
    function instructionHTML() {/*
      <span>
        Every kiosk app needs a name and a homepage. App Builder can keep track
        of multiple kiosk apps, so choose a unique name for this app. Your
        homepage should include "http://" or "https://". Note that App Builder
        will only keep track of the latest version of each app. If you want to
        keep track of multiple version of your app, be sure to download each
        version you wish to keep.
      </span>
    */},
    function contentHTML() {/*
      $$appName
      $$version
      $$homepage
    */},
  ],
});
