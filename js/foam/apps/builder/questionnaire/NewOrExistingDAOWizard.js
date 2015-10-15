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
  package: 'foam.apps.builder.questionnaire',
  name: 'NewOrExistingDAOWizard',
  extends: 'foam.apps.builder.wizard.NewOrExistingDAOWizard',

  requires: [
    'foam.apps.builder.questionnaire.DAOWizard',
    'foam.apps.builder.questionnaire.NewOrExistingModelWizard',
  ],

  properties: [
    {
      name: 'newViewFactory',
      defaultValue: { factory_: 'foam.apps.builder.questionnaire.NewDAOWizard' },
    },
    {
      name: 'existingViewFactory',
      defaultValue: null,
      // defaultValue: {
//         factory_: 'foam.apps.builder.questionnaire.NewOrExistingModelWizard',
//       },
    },
    {
      name: 'title',
      defaultValue: 'Choose a Data Source',
    },
  ],

  templates: [

    function instructionHTML() {/*
        <p>When a user completes their Questionnaire, it will
        be saved into a Data Source. This could be inside the tablet the user is holding,
        in the cloud with Google Drive, or on another device on your network.
        You can create a new Data Source, or share
        an existing one with your other Apps. Typically you can re-use an existing Data
        Source if you have several questionnaires used in the same office, or want
        a centralized store of all the results.
        </p>
    */},
  ],

});
