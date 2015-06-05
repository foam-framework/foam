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
  name: 'TaskManagerDetailView',
  package: 'foam.apps.ctm',
  extendsModel: 'foam.ui.DetailView',

  requires: [
    'foam.apps.ctm.Task',
    'foam.apps.ctm.TaskPieGraph',
    'foam.ui.ActionButton'
  ],

  properties: [
    {
      model_: 'IntProperty',
      name: 'numHistoryItems',
      defaultValue: 64
    },
    {
      model_: 'BooleanProperty',
      name: 'showActions',
      defaultValue: false,
      preSet: function() { return false; }
    }
  ],

  templates: [
    function toHTML() {/*
      <task-manager>
        <tm-header>
          <label>Search:</label>$$search
        </tm-header>
        <tm-body>
          $$tasks{
            editColumnsEnabled: true,
            properties$: this.data.tableColumns$
          }
        </tm-body>
        <tm-footer>
          <stats>
            <global-stats>
              $$tasks{ model_: this.TaskPieGraph, property: this.Task.MEMORY }
              $$tasks{ model_: this.TaskPieGraph, property: this.Task.CPU }
              $$tasks{ model_: this.TaskPieGraph, property: this.Task.NETWORK }
            </global-stats>
            <local-stats id="<%= this.setClass('hidden', function() { return !this.data || !this.data.selection; }.bind(this)) %>">
              $$memory{ width: 100, height: 50 }
              $$cpu{ width: 100, height: 50 }
              $$network{ width: 100, height: 50 }
            </local-stats>
          </stats>
          <actions>
            <a target="_blank" href="chrome://memory-redirect">Stats for nerds</a>
            $$kill
          </actions>
        </tm-footer>
      </task-manager>
    */},
    function CSS() {/*
      body, task-manager {
        width: 100%;
        height: 100%;
      }
      task-manager {
        display: flex;
        flex-direction: column;
      }
      task-manager .tableView:focus { outline: none; }
      task-manager tm-header,
      task-manager tm-body,
      task-manager tm-footer {
        display: block;
      }
      task-manager tm-header,
      task-manager tm-body,
      task-manager tm-footer {
        padding: 20px;
      }
      task-manager tm-footer global-stats,
      task-manager tm-footer local-stats,
      task-manager tm-footer actions {
        padding: 5px;
      }
      task-manager tm-header, task-manager tm-footer {
        flex-grow: 0;
        flex-shrink: 0;
      }
      task-manager tm-header label {
        padding: 0px 5px 0px 0px;
      }
      task-manager tm-body {
        flex-grow: 1;
        overflow: auto;
      }
      task-manager tm-footer stats,
      task-manager tm-footer stats global-stats,
      task-manager tm-footer stats local-stats {
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
      task-manager tm-footer stats {
        flex-wrap: wrap;
      }
      task-manager tm-footer stats global-stats,
      task-manager tm-footer stats local-stats {
        flex-grow: 1;
      }
      task-manager tm-footer stats local-stats.hidden {
        visibility: hidden;
      }
      task-manager tm-footer actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    */}
  ]
});
