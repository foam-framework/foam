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
  extendsModel: 'foam.ui.md.DetailView',


  imports: [ 'stack' ],

  actions: [
    {
      name: 'next',
      label: 'Finish',
      action: function() {
        this.stack.popView();
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <wizard id="%%id" <%= this.cssClassAttr() %>>
      <div class="wizard-content">
        <p class="md-style-trait-standard">Choose a your questions. You can create a new set, or re-use an existing
        set of questions.
        </p>
        $$model{ model_: 'foam.apps.builder.datamodels.ModelPickerView', baseModel: this.data.baseModelId }
        </div>
        <div class="wizard-footer">
          $$next{ model_: 'foam.ui.md.FlatButton' }
        </div>
    </wizard>
    */},
    function CSS() {/*
    */},
  ],


});
