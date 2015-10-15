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
  name: 'NewDAOWizard',
  extends: 'foam.apps.builder.wizard.WizardPage',

  requires: [
    'foam.apps.builder.wizard.NewOrExistingModelWizard',
    'foam.apps.builder.wizard.DAOWizard',
    'foam.apps.builder.datamodels.meta.descriptor.DAOFactoryMetaDescriptor',
    'foam.apps.builder.datamodels.meta.descriptor.MetaDescriptorView',
  ],

  imports: [
    'daoConfigDAO',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      lazyFactory: function() { return this.nextViewNoConfig; },
    },
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'nextViewWithConfig',
      defaultValue: {
        factory_: 'foam.apps.builder.wizard.DAOWizard',
      },
    },
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'nextViewNoConfig',
      defaultValue: null,
      // {
      //   factory_: 'foam.apps.builder.wizard.NewOrExistingModelWizard',
      //},
    },
    {
      name: 'daoDescriptor',
      view: 'foam.apps.builder.datamodels.meta.descriptor.MetaDescriptorView',
      help: 'The type of DAOFactory to create',
      lazyFactory: function() {
         var ret = this.DAOFactoryMetaDescriptor.create();
         var dc = this.data.getDataConfig();
         if ( dc ) {
           ret.name = dc.dao.name;
           ret.modelType = dc.dao.model_.id;
         }
         return ret;
       },
       postSet: function(old, nu) {
         this.daoDescriptorChange();
         if ( old ) old.removeListener(this.daoDescriptorChange);
         if ( nu ) nu.addListener(this.daoDescriptorChange);
       }
    },
    {
      name: 'daoFactory',
      postSet: function() {
        this.nextViewFactory = ( this.daoFactory.requiresUserConfiguration ) ?
          this.nextViewWithConfig : this.nextViewNoConfig;
      }
    },
    {
      name: 'title',
      defaultValue: 'Choose the type of Data Source',
    },
    {
      name: 'scrollContent',
      defaultValue: true,
    }
  ],

  listeners: [
    {
      name: 'daoDescriptorChange',
      code: function() {
        this.daoFactory = this.daoDescriptor.createModel();
      }
    }
  ],

  methods: [
    function onNext() {
      this.data.getDataConfig().dao = this.daoFactory;
      this.daoConfigDAO.put(this.data.getDataConfig().dao);

      this.SUPER();
    },

  ],

  templates: [

    function instructionHTML() {/*
        <p>The data source is where your App will store its data.
        This could be inside the device where it is running, in the cloud with Google Drive, or
        on another device on your network.
        </p>
    */},

    function contentHTML() {/*
      <div class="md-card-heading-content-spacer"></div>
      $$daoDescriptor
    */},
  ],


});
