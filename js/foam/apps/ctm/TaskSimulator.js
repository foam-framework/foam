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
  name: 'TaskSimulator',

  imports: [ 'clock$' ],

  properties: [
    {
      // type: 'foam.apps.ctm.Task',
      name: 'task',
      required: true
    },
    {
      type: 'Function',
      name: 'onTaskUpdate',
      defaultValue: function() {}
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.clock$.addListener(this.tick);
    }
  ],

  listeners: [
    {
      name: 'tick',
      code: function() {
        // Memory.
        if ( Math.random() > 0.8 ) {
          if ( Math.random() > 0.5 ) {
            this.task.memory = Math.min(this.task.memory + Math.random() * 500, 2000);
          } else {
            this.task.memory = Math.max(this.task.memory - Math.random() * 500, 10);
          }
        } else {
          this.task.memory = this.task.memory;
        }
        // CPU.
        if ( Math.random() > 0.1 ) {
          if ( Math.random() > 0.7 ) {
            this.task.cpu = Math.min(this.task.cpu + Math.random() * 30, 100);
          } else {
            this.task.cpu = Math.max(this.task.cpu - Math.random() * 30, 0);
          }
        } else {
          this.task.cpu = this.task.cpu;
        }
        // Network.
        if ( Math.random() > 0.1 ) {
          if ( Math.random() > 0.9 ) {
            this.task.network = Math.min(this.task.network + Math.random() * 1000, 2000);
          } else {
            this.task.network = Math.max(this.task.network - Math.random() * 1000, 0);
          }
        } else {
          this.task.network = this.task.network;
        }

        this.onTaskUpdate(this.task);
      }
    }
  ]
});
