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
  package: 'foam.apps.builder.dao',
  name: 'DAOPickerView',
  extendsModel: 'foam.apps.builder.datamodels.PickerView',

  requires: [
    'foam.ui.md.DetailView',
    'Model',
    'foam.dao.ProxyDAO',
    'foam.apps.builder.dao.DAOFactory',
  ],

  imports: [
    'daoConfigDAO as modelDAO',
  ],

  properties: [
    {
      name: 'modelLabel',
      defaultValue: 'DAO'
    },
    {
      name: 'daoNameProperty',
      defaultValueFn: function() { return this.DAOFactory.NAME; }
    },
    {
      name: 'editViewType',
      defaultValue: 'foam.ui.md.DetailView',
    }
  ],

  actions: [
    {
      name: 'edit',
      label: 'Edit the Data Source',
    }
  ],
  

});
