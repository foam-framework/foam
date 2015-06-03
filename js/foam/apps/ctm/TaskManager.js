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
  name: 'TaskManager',
  package: 'foam.apps.ctm',

  requires: [
    'foam.apps.ctm.Task',
    'foam.apps.ctm.TaskController',
    'foam.apps.ctm.TaskManagerDetailView',
    'foam.dao.EasyDAO',
    'foam.util.Timer'
  ],
  exports: [
    'selection$',
    'timer',
    'tasks_ as tasks'
  ],

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'tasks',
      dynamicValue: function() {
        return this.tasks_.where(CONTAINS_IC(this.Task.NAME, this.search));
      },
      view: 'foam.ui.TableView'
    },
    {
      model_: 'StringProperty',
      name: 'search',
      view: { factory_: 'foam.ui.TextFieldView', onKeyMode: true }
    },
    {
      name: 'selection',
      defaultValue: null,
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
      view: 'foam.apps.ctm.TaskHistoryGraph'
    },
    {
      model_: 'ArrayProperty',
      name: 'cpu',
      view: 'foam.apps.ctm.TaskHistoryGraph'
    },
    {
      model_: 'ArrayProperty',
      name: 'network',
      view: 'foam.apps.ctm.TaskHistoryGraph'
    },
    {
      type: 'foam.util.Timer',
      name: 'timer',
      factory: function() {
        var timer = this.Timer.create();
        timer.start();
        return timer;
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'tasks_',
      lazyFactory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          model: 'foam.apps.ctm.Task'
        });
      }
    },
    {
      name: 'taskControllers_',
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
