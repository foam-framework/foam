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
  package: 'foam.apps.ctml',
  name: 'TaskManager',

  requires: [
    'Binding',
    'PersistentContext',
    'foam.apps.ctml.Task',
    'foam.apps.ctml.TaskController',
    'foam.apps.ctml.TaskManagerContext',
    'foam.apps.ctml.TaskManagerDetailView',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.ui.md.ActionLabel',
    'foam.ui.md.SharedStyles',
    'foam.ui.md.FlexTableView'
  ],
  exports: [
    'clock$',
    'hardSelection$',
    'softSelection$',
    'tasks'
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'clock'
    },
    {
      name: 'persistentContext',
      transient: true,
      lazyFactory: function() {
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({ model: this.Binding }),
          predicate: NOT_TRANSIENT,
          context: this
        });
      }
    },
    {
      // type: 'foam.apps.ctml.TaskManagerContext',
      name: 'ctx',
      transient: true,
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) Events.unlink(old.tableColumns$, this.tableColumns$);
        if ( nu ) Events.link(nu.tableColumns$, this.tableColumns$);
      }
    },
    {
      type: 'StringArray',
      name: 'tableColumns',
      lazyFactory: function() { return this.Task.tableProperties; }
    },
    {
      name: 'hardSelection',
      defaultValue: null,
      transient: true
    },
    {
      name: 'softSelection',
      defaultValue: null,
      transient: true
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'tasks',
      transient: true,
      view: { factory_: 'foam.ui.md.FlexTableView' },
      lazyFactory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          model: 'foam.apps.ctml.Task'
        });
      }
    },
    {
      name: 'taskControllers_',
      transient: true,
      factory: function() { return {}; }
    }
  ],

  methods: [
    function init() {
      this.SUPER.apply(this, arguments);

      this.X.registerModel(this.TaskManagerDetailView, 'foam.ui.TaskManagerDetailView');

      this.persistentContext.bindObject(
          'ctx', this.TaskManagerContext, undefined, 1);

      var dao = this.tasks;
      for ( var i = 0; i < 50; ++i ) {
        var controller = this.TaskController.create();
        this.taskControllers_[controller.task.id] = controller;
        dao.put(controller.task);
      }

      this.SharedStyles.create();

      this.tick();
    },
    function getController(id) {
      return this.taskControllers_[id] || null;
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: 2000,
      code: function() { this.clock = ! this.clock; this.tick(); }
    }
  ]
});
