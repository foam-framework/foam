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
  name: 'NewDAOWizard',
  extendsModel: 'foam.apps.builder.WizardPage',

  requires: [
    'foam.apps.builder.questionnaire.ModelWizard',
    'foam.apps.builder.questionnaire.DAOWizard',
    'foam.meta.descriptor.DAOFactoryMetaDescriptor',
    'foam.meta.descriptor.MetaDescriptorView',
  ],

  imports: [
    'daoConfigDAO',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: {
        factory_: 'foam.apps.builder.questionnaire.ModelWizard',
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
        if ( this.daoFactory.requiresUserConfiguration ) {
          this.nextViewFactory = { factory_: 'foam.apps.builder.questionnaire.DAOWizard' };
        } else {
          this.nextViewFactory = { factory_: 'foam.apps.builder.questionnaire.ModelWizard' };          
        }
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
          return 'Next: Data Source Settings';
        return 'Next: Create the Questions';
      },
    }
  ],

  templates: [
    function contentHTML() {/*
        <p class="md-style-trait-standard md-title">Choose what kind of Data Source to use</p>
        <p class="md-style-trait-standard">The data source is where your App will store its data.
        This could be inside the device where it is running, in the cloud with Google Drive, or
        on another device on your network.
        </p>
        $$daoDescriptor
    */},
  ],


});
