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
  package: 'foam.apps.builder.events',
  name: 'EventsController',

  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.md.DetailView',
    'foam.apps.builder.events.Event',
    'foam.apps.builder.events.EventsDetailView',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
  ],

  exports: [
    'dao'
  ],

  properties: [
    {
      name: 'appConfig',
      help: 'The configuration for app parameters, data store location, etc.',
    },
    {
      name: 'dao',
      help: 'The store of events.',
      lazyFactory: function() {
        return this.appConfig.dao.factory(this.appConfig.appId, this.Event, this.Y);
      },
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.apps.builder.events.EventsDetailView'
      }
    },
//     {
//       name: 'content',
//       help: 'The current event being edited',
//       view: 'foam.apps.builder.events.EventsDetailView',
//       lazyFactory: function() {
//         return this.appConfig.model.create({}, this.Y);
//       }
//     },
  ],

  listeners: [
    {
      name: 'configChange',
      code: function(obj, topic, old, nu) {
        this.updateHTML();
      }
    },
  ],

  actions: [

  ],

  templates: [
    function toHTML() {/*
      <app-body id="%%id" <%= this.cssClassAttr() %>>
        $$dao
      </app-body>
    */},
    function CSS() {/*
      app-body {
        overflow-y: auto;
      }
    */},
  ]
});
