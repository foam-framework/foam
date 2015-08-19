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
  package: 'foam.meta.descriptor',
  name: 'DAOFactoryMetaDescriptor',

  label: 'Data Store',

  documentation: function() {/* Describes a DAOFactory type. Instances of
    $$DOC{ref:'foam.meta.descriptor.PropertyMetaDescriptor'} may be edited
    and then used to create a corresponding
    $$DOC{ref:'foam.apps.builder.dao.DAOFactory'} instance.
  */},

  properties: [
    {
      model_: 'StringProperty',
      label: 'The Type of the DAO',
      name: 'model',
      documentation: function() {/* The model id of the new property. */},
      defaultValue: 'StringProperty',
      view: {
         factory_: 'foam.ui.ChoiceView',
         choices: [
           ['foam.apps.builder.dao.LocalDAOFactory', 'Local IDB Data Store'],
           ['foam.apps.builder.dao.IDBDAOFactory', 'Specialized IDB Store'],
         ]
       },
    },
    {
      model_: 'StringProperty',
      label: 'The name of the new DAO',
      name: 'name',
      documentation: function() {/* The name of the new property. */},
      preSet: function(old,nu) {
        return capitalize(camelize(nu));
      }
    },
  ],

});
