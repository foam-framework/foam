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
  name: 'ChangeDAOWizard',
  extends: 'foam.apps.builder.wizard.ChangeDAOWizard',

  requires: [
    'foam.apps.builder.events.NewDAOWizard',
    'foam.apps.builder.events.DAOWizard',
  ],

  properties: [
    {
      name: 'newViewFactory',
      defaultValue: { factory_: 'foam.apps.builder.events.NewDAOWizard' },
    },
    {
      name: 'editViewFactory',
      defaultValue: { factory_: 'foam.apps.builder.events.DAOWizard' },
    },
    {
      name: 'title',
      defaultValue: 'Change the Data Source',
    },
  ],

  templates: [

    function instructionHTML() {/*
        <p>Edit the current Data Source,
        Create a new one, or share
        an existing Data Srouce with one of your other Events Calendar Apps.
        If you pick an existing Data Source, changes to the settings will
        also show up in the other apps that use that source.
        </p>
    */},

  ],



});
