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
  package: 'foam.apps.builder',
  name: 'AppConfigModelOwnerTrait',

  requires: [
    'Model',
    'BooleanProperty',
    'StringProperty',
    'IntProperty',
    'FloatProperty',
    'DateProperty',
    'foam.ui.md.DetailView',
    'foam.ui.TableView',
  ],

  imports: [
    'modelDAO',
  ],

  properties: [
    {
      name: 'baseModelId',
      help: 'The model name of the base type for models this trait owns.',
    },
    {
      name: 'appName',
      preSet: function(old, nu) {
        // preset-postset split to allow both DAO and model to update this.dao before writing
        if ( nu && old !== nu ) {
          // primary key change for the model
          this.modelDAO.remove(this.model);
          this.model.name = capitalize(camelize(this.appName));
          if ( this.dao ) this.dao.modelType = this.model.id;
        }        
      },
      postSet: function(old, nu) {
        if ( nu && old !== nu ) {
          this.modelDAO.put(this.model);
        }
      } 
    },
    {
      model_: 'BooleanProperty',
      name: 'defaultModel_',
      hidden: true,
      transient: true,
      documentation: 'Indicates that .model is still not saved, and the name can be changed.',
    },
    {
      name: 'model',
      view: 'foam.ui.md.DetailView',
      lazyFactory: function() {
        this.resetModel();
      },
      preSet: function(old,nu) {
        if ( ! nu ) return old;
        if ( old ) this.defaultModel_ = false; // it's been set at least once
        return nu;
      },
      postSet: function(old,nu) {
        if ( old ) old.removeListener(this.modelChange);
        if ( nu ) nu.addListener(this.modelChange);
        this.modelChange();
      },
   },

  ],

  listeners: [
    {
      name: 'modelChange',
      code: function() {
        this.propertyChange('model', null, this.model);
      }
    }
  ],

  methods: [
    function resetModel() {
      this.model = this.Model.create({
        extendsModel: this.baseModelId,
        name: capitalize(camelize(this.appName)),
      });
      this.defaultModel_ = true;
    },
  ],

});