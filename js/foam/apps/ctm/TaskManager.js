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
    'foam.dao.EasyDAO',
    'foam.apps.ctm.TaskManagerDetailView'
  ],
  exports: [ 'selection$' ],

  constants: {
    WORDS: [
      'Browser',
      'Extension',
      'Tab',
      'App',
      'Plugin',
      'Google',
      'GMail',
      'Calendar',
      'Docs',
      'Ads',
      'Todo',
      'Meta'
    ],
    RANDOM_TASK: (function() {
      var nextId = 1;
      return function() {
        return this.Task.create({
          id: nextId++,
          name: this.WORDS[Math.floor(Math.random() * this.WORDS.length)] + ' ' +
              this.WORDS[Math.floor(Math.random() * this.WORDS.length)] + ' ' +
              this.WORDS[Math.floor(Math.random() * this.WORDS.length)],
          memory: Math.random() * 500,
          cpu: Math.random() * 10,
          network: Math.random() * 10 > 7 ? Math.floor(Math.random() * 500) : 0,
          processId: Math.floor(Math.random() * 10000)
        });
      };
    })()
  },

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
      postSet: function() { console.log('Setting selection'); },
      defaultValue: null
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'tasks_',
      lazyFactory: function() {
        var dao = this.EasyDAO.create({
          daoType: 'MDAO',
          model: 'foam.apps.ctm.Task'
        });
        for ( var i = 0; i < 50; ++i ) {
          dao.put(this.RANDOM_TASK());
        }
        return dao;
      }
    },
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
    }
  ]
});
