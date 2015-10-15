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
  name: 'ModelWizard',
  extends: 'foam.apps.builder.wizard.ModelWizard',

  properties: [
    {
      name: 'title',
      defaultValue: 'Edit your Questions',
    },
  ],

  templates: [

    function instructionHTML() {/*
        <div>
          <p>Add new questions with the red
          '+' button, click the sandwich to re-order a question, or
          click the pencil to edit the details.
          </p>
          <p>You can't change the name of a
          question, but you can change the label that users see.
          </p>
        </div>
        <div class="md-card-heading-content-spacer"></div>
    */},

  ],


});
