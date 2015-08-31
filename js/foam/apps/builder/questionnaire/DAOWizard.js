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
  name: 'DAOWizard',
  extendsModel: 'foam.apps.builder.wizard.DAOWizard',

  requires: [
    'foam.apps.builder.questionnaire.NewOrExistingModelWizard',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: null,
      // {
//         factory_: 'foam.apps.builder.questionnaire.NewOrExistingModelWizard',
//       },
    },
    {
      name: 'title',
      defaultValue: 'Data Source Settings',
    },
  ],


  templates: [

    function instructionHTML() {/*
        <p class="md-style-trait-standard">Set the following options for your Data Source:
        </p>
    */},
  ],


});
