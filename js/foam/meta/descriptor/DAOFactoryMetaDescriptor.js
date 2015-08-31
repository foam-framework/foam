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
    'foam.apps.builder.dao.IDBDAOFactory',
  ],

  label: 'Data Store',

  documentation: function() {/* Describes a DAOFactory type. Instances of
    $$DOC{ref:'foam.meta.descriptor.PropertyMetaDescriptor'} may be edited
    and then used to create a corresponding
    $$DOC{ref:'foam.apps.builder.dao.DAOFactory'} instance.
  */},

  properties: [
    {
      label: 'The Type of the DAO',
      name: 'model',
      defaultValueFn: function() { return this.LocalDAOFactory.id; },
      view: function(args, opt_X) {
        var X = opt_X || this.X;
        var v = X.lookup('foam.ui.ChoiceView').create(args, X);
        v.objToChoice = function(obj) { 
          return [obj.id, obj.label]; 
        };
        v.dao = [
          X.lookup('foam.apps.builder.dao.LocalDAOFactory'),
          X.lookup('foam.apps.builder.dao.GoogleDriveDAOFactory'),
          X.lookup('foam.apps.builder.dao.IDBDAOFactory'),
        ];
        return v;
      },
    },
    {
      label: 'The name of the new DAO',
      name: 'name',
      preSet: function(old,nu) {
        return capitalize(camelize(nu));
      }
    },
  ],

});
