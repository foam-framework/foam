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
  name: 'AppConfigDAOOwnerTrait',

  requires: [
    'foam.apps.builder.dao.LocalDAOFactory',
  ],

  imports: [
    'daoConfigDAO',
  ],

  properties: [
    {
      name: 'dao',
      view: 'foam.ui.md.DetailView',
      label: 'Data storage',
      lazyFactory: function() {
        return this.LocalDAOFactory.create({
          name: this.appName,
          label: this.appName,
          modelType: this.model.id,
        });
      },
      postSet: function(old,nu) {
        if ( ! nu ) debugger;
      }
    },
    {
      name: 'appName',
      preSet: function(old, nu) {
        if ( nu && old !== nu ) {
          // name change is primary key change for the DAOFactory
          //this.daoConfigDAO && this.daoConfigDAO.remove(this.dao);
          this.dao.label = nu;
        }
        return nu;
      },
      postSet: function(old, nu) {
        if ( nu && old !== nu ) {
          this.daoConfigDAO && this.daoConfigDAO.put(this.dao);
        }
      }
    },
  ],

  methods: [
    function resetDAO() {
      this.dao = this.LocalDAOFactory.create({
        name: this.appName,
        modelType: this.model.id,
      });
    }
  ],


});