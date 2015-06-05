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
  package: 'foam.apps.ctm',
  name: 'TaskManager',

  requires: [
    'Binding',
    'PersistentContext',
    'foam.apps.ctm.Task',
    'foam.apps.ctm.TaskController',
    'foam.apps.ctm.TaskHistoryGraph',
    'foam.apps.ctm.TaskManagerContext',
    'foam.apps.ctm.TaskManagerDetailView',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.ui.TableView',
    'foam.util.Timer'
  ],
  exports: [
    'selection$',
    'timer',
    'tasks_ as tasks'
  ],

  properties: [
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
      type: 'foam.apps.ctm.TaskManagerContext',
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
      model_: 'StringArrayProperty',
      name: 'tableColumns',
      lazyFactory: function() { return this.Task.tableProperties; }
    },
    {
      name: 'queryParser',
      factory: function() { return QueryParserFactory(this.Task, true); }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'tasks',
      dynamicValue: function() {
        return this.tasks_.where(
            this.search ?
                (this.queryParser.parseString(this.search) || TRUE) :
                TRUE);
      },
      view: 'foam.ui.TableView'
    },
    {
      model_: 'StringProperty',
      name: 'search',
      transient: true,
      view: { factory_: 'foam.ui.TextFieldView', onKeyMode: true }
    },
    {
      name: 'selection',
      defaultValue: null,
      transient: true,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu ) {
          var controller = this.getController(nu.id);
          this.memory = controller.memory.history;
          this.cpu = controller.cpu.history;
          this.network = controller.network.history;
        }
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'memory',
      transient: true,
      view: 'foam.apps.ctm.TaskHistoryGraph'
    },
    {
      model_: 'ArrayProperty',
      name: 'cpu',
      transient: true,
      view: 'foam.apps.ctm.TaskHistoryGraph'
    },
    {
      model_: 'ArrayProperty',
      name: 'network',
      transient: true,
      view: 'foam.apps.ctm.TaskHistoryGraph'
    },
    {
      type: 'foam.util.Timer',
      name: 'timer',
      transient: true,
      factory: function() {
        var timer = this.Timer.create();
        timer.start();
        return timer;
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'tasks_',
      transient: true,
      lazyFactory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          model: 'foam.apps.ctm.Task'
        });
      }
    },
    {
      name: 'taskControllers_',
      transient: true,
      factory: function() { return {}; }
    }
  ],

  actions: [
    {
      name: 'kill',
      label: 'End Process',
      isEnabled: function() { return !!this.selection; },
      action: function() { this.selection.kill(); }
    }
  ],

  methods: [
    function init() {
      this.SUPER.apply(this, arguments);

      var viewModel = this.TaskManagerDetailView;
      this.X.registerModel(viewModel, 'foam.ui.TaskManagerDetailView');

      this.persistentContext.bindObject(
          'ctx', this.TaskManagerContext, undefined, 1);

      var dao = this.tasks_;
      for ( var i = 0; i < 50; ++i ) {
        var controller = this.TaskController.create({}, this.Y);
        this.taskControllers_[controller.task.id] = controller;
        dao.put(controller.task);
      }

      X.timer = this.timer;
    },
    function getController(id) {
      return this.taskControllers_[id] || null;
    }
  ]
});
