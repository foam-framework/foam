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
  name: 'NewOrExistingDAOWizard',
  extends: 'foam.apps.builder.wizard.NewOrExistingDAOWizard',

  requires: [
    'foam.apps.builder.events.DAOWizard',
  ],

  properties: [
    {
      name: 'newViewFactory',
      defaultValue: { factory_: 'foam.apps.builder.events.NewDAOWizard' },
    },
    {
      name: 'existingViewFactory',
      defaultValue: null,
    },
    {
      name: 'title',
      defaultValue: 'Choose a Data Source',
    },
  ],

  templates: [
    function instructionHTML() {/*
        <p>Events are loaded from a Data Source. This could be inside the tablet
        the user is holding,
        in the cloud with Google Drive, or on another device on your network.
        You can create a new Data Source, or share
        an existing one with your other Apps. Typically you can re-use an existing Data
        Source if you have several Events Calendars used in the same office, or
        apps displaying the same calendar in different ways.
        </p>
    */},
  ],

});
