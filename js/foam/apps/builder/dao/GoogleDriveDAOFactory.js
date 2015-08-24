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
  name: 'GoogleDriveDAOFactory',
  package: 'foam.apps.builder.dao',

  extendsModel: 'foam.apps.builder.dao.DAOFactory',

  requires: [
    'com.google.drive.FileDAO',
    'foam.dao.EasyDAO',
  ],

  properties: [
    {
      name: 'name',
    },
    {
      name: 'label',
    },
    {
      model_: 'FactoryProperty',
      hidden: true,
      name: 'factory', //TODO(jacksonic): Should be named .create, but can't until Model.create is moved
      defaultValue: function() {
        return this.EasyDAO.create({
          model: this.X.lookup(this.modelType),
          name: this.name,
          daoType: this.FileDAO,
          cache: true,
          guid: true,
          logging: true
        });
      },
    }
  ],

});
