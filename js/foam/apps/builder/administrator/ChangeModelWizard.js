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
  name: 'ChangeModelWizard',
  extendsModel: 'foam.apps.builder.wizard.ChangeModelWizard',

  requires: [
    'foam.apps.builder.administrator.NewModelWizard',
    'foam.apps.builder.administrator.ModelWizard',
    'foam.apps.builder.administrator.ModelPreviewWizard',
  ],

  properties: [
    {
      name: 'newViewFactory',
      label: 'Create a new Question Set',
      defaultValue: { factory_: 'foam.apps.builder.administrator.NewModelWizard' },
    },
    {
      name: 'editViewFactory',
      label: 'Edit current Question Set',
      defaultValue: { factory_: 'foam.apps.builder.administrator.ModelWizard' },
    },
    {
      name: 'existingViewFactory',
      label: 'Copy existing Question Set',
      defaultValue: null, //function() { },
    },
    {
      name: 'editView',
      defaultValue: { factory_: 'foam.apps.builder.administrator.ModelPreviewWizard' },
    },
    {
      name: 'title',
      defaultValue: 'Change the Question Set',
    },
  ],

  templates: [

    function instructionHTML() {/*
        <p>Edit the current set of questions,
        Create a new set, or share
        an existing set of questions with one of your other Admin Apps.
        If you pick an existing set of questions, changes to the questions will
        also show up in the other apps that use that set.
        </p>
    */},

  ],



});
