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
  package: 'foam.apps.builder.datamodels',
  name: 'ModelPickerView',
  extendsModel: 'foam.apps.builder.PickerView',

  requires: [
    'foam.meta.types.ModelEditView',
    'Model',
  ],

  imports: [
    'modelDAO',
  ],

  properties: [
    {
      model_: 'ModelProperty',
      name: 'baseModel',
      help: 'The list is filtered to only include models that extend baseModel.',
      postSet: function() {
        if ( this.modelDAO ) {
          this.filteredDAO = this.modelDAO.where(EQ(Model.EXTENDS_MODEL, this.baseModel.id));
        }
      }
    },
    {
      name: 'modelLabel',
      defaultValueFn: function() { return this.baseModel.label; }
    },
    {
      name: 'modelName',
      postSet: function() {
        if ( this.modelName !== this.data.id ) {
          this.modelDAO.where(EQ(Model.ID, this.modelName)).select({
            put: function(m) {
              if ( m ) {
                this.data = m;
              }
            }.bind(this)
          });
        }
      }
    },
    {
      name: 'modelDAO',
      postSet: function(old,nu) {
        if ( this.baseModel ) {
          this.filteredDAO = this.modelDAO.where(EQ(Model.EXTENDS_MODEL, this.baseModel.id));
        }
      },
    },
  ],

  actions: [
    {
      name: 'edit',
      label: 'Edit the Questionnaire',
    }
  ],


});
