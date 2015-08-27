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
  package: 'foam.apps.builder.wizard',
  name: 'DAOWizard',
  extendsModel: 'foam.apps.builder.wizard.WizardPage',

  requires: [
    'foam.apps.builder.wizard.NewOrExistingModelWizard',
    'foam.apps.builder.dao.DAOFactoryEditView',
    'foam.apps.builder.dao.IDBDAOFactoryEditView',
    'foam.apps.builder.dao.GoogleDriveDAOFactoryEditView'
  ],

  imports: [
    'daoConfigDAO',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: {
        factory_: 'foam.apps.builder.wizard.NewOrExistingModelWizard',
      },
    },
  ],

  actions: [
    {
      name: 'next',
      label: 'Next: The Questions',
    }
  ],

  methods: [
    function onNext() {
      this.daoConfigDAO && this.daoConfigDAO.put(this.data.dao);
      this.SUPER();
    }
  ],

  templates: [
    function titleHTML() {/*
        <p class="md-style-trait-standard md-title">Data Source Settings</p>
    */},
    function instructionHTML() {/*
        <p class="md-style-trait-standard">Set the following options for your Data Source:
        </p>
    */},
    function contentHTML() {/*
        $$dao{ model_: 'foam.apps.builder.dao.EditView', model: this.data.dao.model_ }
    */},
  ],


});
