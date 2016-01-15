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
  name: 'LocalDAOFactory',
  package: 'foam.apps.builder.dao',

  extends: 'foam.apps.builder.dao.DAOFactory',

  label: 'Simple local storage on your device',

  requires: [
    'foam.dao.IDBDAO',
    'foam.dao.EasyDAO',
  ],

  documentation: "Holds a serializable description of a local DAO, typically stored in the web browser.",

  properties: [
    {
      name: 'name',
    },
    {
      name: 'label',
    },
    {
      type: 'Factory',
      hidden: true,
      name: 'factory', //TODO(jacksonic): Should be named .create, but can't until Model.create is moved
      defaultValue: function(name, model, X) {
        model.getPrototype();
        return this.EasyDAO.create({
          model: model,
          name: name,
          daoType: this.IDBDAO,
          cache: true,
          seqNo: true,
          logging: true,
        });
      },
    }
  ],

});