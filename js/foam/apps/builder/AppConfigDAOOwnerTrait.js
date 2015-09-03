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

  ],

  properties: [
    {
      name: 'dao',
      view: 'foam.ui.md.DetailView',
      label: 'Data storage',
      lazyFactory: function() {
        return this.LocalDAOFactory.create({
          name: 'newDAO',
          modelType: this.baseModelId,
        });
      },
      postSet: function(old,nu) {
        if ( ! nu ) debugger;
      }
   },
   {
     name: 'baseModelId',
     help: 'The model name of the base type for models this trait stores.',
   },

  ],

  methods: [
    function resetDAO() {
      this.dao = this.LocalDAOFactory.create({
        name: 'newDAO',
        modelType: this.baseModelId,
      });
    }
  ],


});
