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
  extendsModel: 'foam.meta.descriptor.MetaDescriptor',

  requires: [
    'foam.apps.builder.dao.LocalDAOFactory',
    'foam.apps.builder.dao.GoogleDriveDAOFactory',
    'foam.apps.builder.dao.EmbeddedDAOFactory',
    'foam.meta.descriptor.DAOFactoryCitationView',
  ],

  label: 'Data Store',

  documentation: function() {/* Describes a DAOFactory type. Instances of
    $$DOC{ref:'foam.meta.descriptor.PropertyMetaDescriptor'} may be edited
    and then used to create a corresponding
    $$DOC{ref:'foam.apps.builder.dao.DAOFactory'} instance.
  */},

  properties: [
    {
      name: 'selectionsDAO',
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.meta.descriptor.DAOFactoryCitationView',
      },
      defaultValueFn: function() { return [
          X.lookup('foam.apps.builder.dao.EmbeddedDAOFactory'),
          X.lookup('foam.apps.builder.dao.GoogleDriveDAOFactory'),
          X.lookup('foam.apps.builder.dao.LocalDAOFactory'),
        ];
      }
    },
    {
      name: 'model',
      defaultValue: 'foam.apps.builder.dao.LocalDAOFactory',
    },
  ],

});