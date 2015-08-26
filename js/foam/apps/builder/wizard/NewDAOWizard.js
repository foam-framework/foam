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
  extendsModel: 'foam.apps.builder.wizard.WizardPage',

  requires: [
    'foam.apps.builder.wizard.NewOrExistingModelWizard',
    'foam.apps.builder.wizard.DAOWizard',
    'foam.meta.descriptor.DAOFactoryMetaDescriptor',
    'foam.meta.descriptor.MetaDescriptorView',
  ],

  imports: [
    'daoConfigDAO',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: function() { return this.nextViewNoConfig.apply(this, arguments); }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'nextViewWithConfig',
      label: 'Next: Data Source Settings',
      defaultValue: {
        factory_: 'foam.apps.builder.wizard.DAOWizard',
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'nextViewNoConfig',
      label: 'Next: Create the Data Model',
      defaultValue: {
        factory_: 'foam.apps.builder.wizard.NewOrExistingModelWizard',
      },
    },
    {
      name: 'daoDescriptor',
      view: 'foam.meta.descriptor.MetaDescriptorView',
      help: 'The type of DAOFactory to create',
      lazyFactory: function() {
         var ret = this.DAOFactoryMetaDescriptor.create();
         if ( this.data.dao ) {
           ret.name = this.data.dao.name;
           ret.modelType = this.data.dao.model_.id;
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
      this.data.dao = this.daoFactory;
      this.data.dao.modelType = this.data.baseModelId;
      this.daoConfigDAO.put(this.data.dao);

      this.SUPER();
    },

  ],

  actions: [
    {
      name: 'next',
      labelFn: function() {
        if ( this.daoFactory && this.daoFactory.requiresUserConfiguration )
          return this.model_.NEXT_VIEW_WITH_CONFIG.label;
        return this.model_.NEXT_VIEW_NO_CONFIG.label;
      },
    }
  ],

  templates: [
    function titleHTML() {/*
        <p class="md-style-trait-standard md-title">Choose what kind of Data Source to use</p>
    */},
    function instructionHTML() {/*
        <p class="md-style-trait-standard">The data source is where your App will store its data.
        This could be inside the device where it is running, in the cloud with Google Drive, or
        on another device on your network.
        </p>
    */},

    function contentHTML() {/*
        $$daoDescriptor
    */},
  ],


});
