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
  extends: 'foam.apps.builder.wizard.WizardPage',

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
      defaultValue: null,
    },
    {
      name: 'title',
      defaultValue: 'Data Source Settings',
    },
    {
      name: 'daoFactory',
      getter: function() { return this.data.getDataConfig().dao; }
    },
  ],


  methods: [
    function onNext() {
      this.daoConfigDAO && this.daoConfigDAO.put(this.daoFactory);
      this.SUPER();
    }
  ],

  templates: [

    function instructionHTML() {/*
        <p>Set the following options for your Data Source:
        </p>
    */},
    function contentHTML() {/*
        <div class="md-card-heading-content-spacer"></div>
        $$daoFactory{ model_: 'foam.apps.builder.dao.EditView', model: this.daoFactory.model_ }
    */},
  ],


});
