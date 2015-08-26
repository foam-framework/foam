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
  name: 'ModelPreviewWizard',
  extendsModel: 'foam.apps.builder.wizard.ModelPreviewWizard',

  templates: [
    function titleHTML() {/*
        <p class="md-style-trait-standard md-title">Preview of Questions</p>
    */},
    function instructionHTML() {/*
        <p class="md-style-trait-standard">These questions in <%= this.data.name %>:
        </p>
    */},

  ],


});
