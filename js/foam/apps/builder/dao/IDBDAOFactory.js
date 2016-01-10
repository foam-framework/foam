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
  name: 'IDBDAOFactory',
  package: 'foam.apps.builder.dao',

  extends: 'foam.apps.builder.dao.DAOFactory',

  label: 'Specialized local storage in IndexedDB',

  requires: [
    'foam.dao.IDBDAO',
    'foam.dao.EasyDAO',
  ],

  documentation: "Holds a serializable description of a DAO type.",

  properties: [
    {
      type: 'Factory',
      hidden: true,
      name: 'factory',
      defaultValue: function(name, model, X) {
        return this.IDBDAO.create({
          name: name,
          model: model,
          useSimpleSerialization: ! this.storesModels,
        }, X);
      },
    },
    {
      name: 'requiresUserConfiguration',
      defaultValue: true,
      hidden: true,
    },
    {
      type: 'Boolean',
      name: 'storesModels',
      defaultValue: true,
      view: 'foam.ui.md.CheckboxView',
      label: 'This Data Store may hold Models'
    },
  ],

});