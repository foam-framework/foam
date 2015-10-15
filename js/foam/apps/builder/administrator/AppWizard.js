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
  package: 'foam.apps.builder.administrator',
  name: 'AppWizard',
  extends: 'foam.apps.builder.wizard.WizardPage',

  requires: [
    'foam.apps.builder.administrator.PickAppWizard',
  ],

  imports: [
    'wizardStack',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: { factory_: 'foam.apps.builder.administrator.PickAppWizard' },
    },
    {
      name: 'title',
      defaultValue: 'Name your Administration App',
    },
  ],

  methods: [
    function onNext() {
      //this.SUPER(); // puts the app into the main dao
    },
    function onCancel() {
      this.SUPER();
      // remove the unfinished app. The user must have backed out of
      // every other wizard page to get back here.
      this.dao && this.dao.remove(this.data);
    },
  ],

  templates: [
    function instructionHTML() {/*
      <p>An Administrator App is built specifically for one of your other existing
      apps. Use the Administrator app to browse the data that your app has created.
      For a Questionnaire, you can look at all the submissions filled out by users.
      For Events, you can add new event listings, change, or delete old ones. Some
      apps, such as Kiosk apps, don't have any data and can't be the target of an
      Administrator app.
      </p>
      <p>Pick a name to describe the group who will be using this app, such as
      'Reception Desk' or 'Calendar Event Planner'.</p>
    */},
    function contentHTML() {/*
      $$appName
    */},
  ],
});
