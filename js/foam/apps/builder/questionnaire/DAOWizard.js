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
  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.apps.builder.questionnaire.ModelWizard',
  ],

  imports: [ 'stack' ],

  actions: [
    {
      name: 'next',
      label: 'Next: Create the Questions',
      action: function() {
        this.stack.replaceView(
          this.ModelWizard.create({ data: this.data })
        );
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <wizard id="%%id" <%= this.cssClassAttr() %>>
      <div class="wizard-content">
        <p class="md-style-trait-standard">Choose a data source, where your App will store its data.
        </p>
        $$dao{ model_: 'foam.apps.builder.dao.DAOPickerView', baseModel: this.data.baseModelId }
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
