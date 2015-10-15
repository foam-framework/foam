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
  package: 'foam.apps.builder.events',
  name: 'AppWizard',
  extends: 'foam.apps.builder.wizard.WizardPage',

  imports: [
    'selection$',
    'wizardStack',
  ],

  requires: [
    'foam.apps.builder.events.NewDAOWizard',
    'foam.apps.builder.events.NewOrExistingDAOWizard',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: {
        factory_: 'foam.apps.builder.events.NewOrExistingDAOWizard',
      },
    },
    {
      name: 'title',
      defaultValue: 'Name your Event',
    },
  ],

  methods: [
    function onNext() {
      this.SUPER(); // puts the app into the main dao
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
      <p>Choose a name for your new Event Calendar. The name should
        be a few words to indicate the purpose, such as &quot;lobby display&quot;
        or &quot;online public calendar&quot;
      </p>
    */},

    function contentHTML() {/*
      $$appName
    */},
  ],


});
