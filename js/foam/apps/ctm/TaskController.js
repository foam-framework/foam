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
  name: 'TaskController',

  requires: [
    'foam.apps.ctm.History',
    'foam.apps.ctm.Task',
    'foam.apps.ctm.TaskSimulator'
  ],
  imports: [ 'tasks' ],

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
    RANDOM_TASK: function() {
      var selfFn = arguments.callee;
      var nextId = selfFn.nextId = (selfFn.nextId || 0) + 1;
      var task = this.Task.create({
        id: nextId,
        name: this.WORDS[Math.floor(Math.random() * this.WORDS.length)] + ' ' +
            this.WORDS[Math.floor(Math.random() * this.WORDS.length)] + ' ' +
            this.WORDS[Math.floor(Math.random() * this.WORDS.length)],
        memory: Math.random() * 500,
        cpu: Math.random() * 10,
        network: Math.random() * 10 > 7 ? Math.floor(Math.random() * 500) : 0,
        processId: Math.floor(Math.random() * 10000)
      });
      return task;
    }
  },

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'tasks'
    },
    {
      // type: 'foam.apps.ctm.Task',
      name: 'task',
      factory: function() {
        return this.RANDOM_TASK();
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.simulator.task = nu;
      }
    },
    {
      type: 'Int',
      name: 'numHistoryItems',
      hidden: true,
      defaultValue: 64
    },
    {
      // type: 'foam.apps.ctm.TaskSimulator',
      name: 'simulator',
      factory: function() {
        return this.TaskSimulator.create({
          task: this.task,
          onTaskUpdate: this.onTaskUpdate
        }, this.Y);
      }
    },
    {
      // type: 'foam.apps.ctm.History',
      name: 'memory',
      factory: function() {
        return this.History.create({
          property: this.Task.MEMORY,
          data: this.task,
          numItems: this.numHistoryItems
        }, this.Y);
      }
    },
    {
      // type: 'foam.apps.ctm.History',
      name: 'cpu',
      factory: function() {
        return this.History.create({
          property: this.Task.CPU,
          data: this.task,
          numItems: this.numHistoryItems
        }, this.Y);
      }
    },
    {
      // type: 'foam.apps.ctm.History',
      name: 'network',
      factory: function() {
        return this.History.create({
          property: this.Task.NETWORK,
          data: this.task,
          numItems: this.numHistoryItems
        }, this.Y);
      }
    }
  ],

  listeners: [
    {
      name: 'onTaskUpdate',
      code: function() { this.tasks && this.tasks.put(this.task); }
    }
  ]
});
