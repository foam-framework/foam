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
    'foam.apps.ctm.TaskHistoriesView',
    'foam.apps.ctm.TaskHistoryGraph',
    'foam.apps.ctm.TaskManagerContext',
    'foam.apps.ctm.TaskManagerDetailView',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.ui.md.ActionLabel',
    'foam.ui.md.SharedStyles',
    'foam.ui.md.FlexTableView'
  ],
  exports: [
    'clock',
    'hardSelection',
    'softSelection',
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
      // type: 'foam.apps.ctm.TaskManagerContext',
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
      name: 'queryParser',
      factory: function() { return QueryParserFactory(this.Task, true); }
    },
    {
      type: 'String',
      name: 'search',
      transient: true,
      view: {
        factory_: 'foam.ui.TextFieldView',
        placeholder: 'Search',
        onKeyMode: true
      }
    },
    {
      name: 'hardSelection',
      defaultValue: null,
      transient: true,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu ) {
          var controller = this.getController(nu.id);
          this.memory = controller.memory.history;
          this.cpu = controller.cpu.history;
          this.network = controller.network.history;
        } else {
          this.memory = [];
          this.cpu =  [];
          this.network =  [];
        }
      }
    },
    {
      name: 'softSelection',
      defaultValue: null,
      transient: true
    },
    {
      type: 'Array',
      name: 'memory',
      transient: true,
      view: 'foam.apps.ctm.TaskHistoryGraph'
    },
    {
      type: 'Array',
      name: 'cpu',
      transient: true,
      view: 'foam.apps.ctm.TaskHistoryGraph'
    },
    {
      type: 'Array',
      name: 'network',
      transient: true,
      view: 'foam.apps.ctm.TaskHistoryGraph'
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'tasks',
      transient: true,
      lazyFactory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          model: 'foam.apps.ctm.Task'
        });
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredTasks',
      view: { factory_: 'foam.ui.md.FlexTableView' },
      onDAOUpdate: function() {
        this.updateFilteredCount();
      }
    },
    {
      type: 'Int',
      name: 'filteredCount'
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

      Events.dynamicFn(
        function() { this.search; this.tasks; }.bind(this),
        function() {
          this.filteredTasks = this.tasks.where(
            this.search ?
              (this.queryParser.parseString(this.search) || TRUE) :
              TRUE);
        }.bind(this));

      var dao = this.filteredTasks;
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
    },
    {
      name: 'updateFilteredCount',
      isFramed: true,
      code: function() {
        this.filteredTasks.select(COUNT())(this.updateFilteredCount_);
      }
    },
    {
      name: 'updateFilteredCount_',
      isFramed: true,
      code: function(c) { this.filteredCount = c.count; }
    }
  ]
});
