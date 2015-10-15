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
  name: 'NewDAOWizard',
  extends: 'foam.apps.builder.wizard.NewDAOWizard',

  requires: [
    'foam.apps.builder.questionnaire.NewOrExistingModelWizard',
    'foam.apps.builder.questionnaire.DAOWizard',
  ],

  properties: [
    {
      name: 'nextViewWithConfig',
      defaultValue: {
        factory_: 'foam.apps.builder.questionnaire.DAOWizard',
      },
    },
    {
      name: 'nextViewNoConfig',
      defaultValue: null,
      // {
//         factory_: 'foam.apps.builder.questionnaire.NewOrExistingModelWizard',
//},
    },
    {
      name: 'title',
      defaultValue: 'Choose type of Data Source',
    },
  ],

  templates: [

    function instructionHTML() {/*
        <p>The data source is where your App will store its data.
        This could be local - inside the tablet the user is holding, in the cloud with Google Drive, or
        on another device on your network.
        </p>
    */},

  ],


});
