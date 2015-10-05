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
  name: 'AppController',

  extendsModel: 'foam.ui.md.DetailView',


  documentation: function() {/*
    Turns an AppConfig instance into a runtime app, creating the DAO
    instances specified in the AppConfig or other runtime objects needed.
    Implement a specialization of this model for your app.
    $$DOC{ref:'.data'} should be your AppConfig instance.
  */},

  requires: [
    'foam.apps.builder.AppConfig',
  ],

  exports: [
    'dao'
  ],

  properties: [
    {
      name: 'data',
      type: 'foam.apps.builder.AppConfig',
      help: 'The configuration for app parameters, data store location, etc.',
      postSet: function(old, nu) {
        // change the DAOs on this.Y
        this.exportDAOs();
        // re-render, which ensures children are reset and see the new this.Y
        this.updateHTML();
      },
    },
  ],

  methods: [
    function exportDAOs() {
      if ( ! this.data ) return;
      // create each DAO and update our outgoing context
      for (var i = 0; i < this.data.dataConfigs.length; ++i) {
        var dc = this.data.dataConfigs[i];
        this.Y.set(dc.name+"DAO", dc.createDAO());
      }
    },
  ],

});
