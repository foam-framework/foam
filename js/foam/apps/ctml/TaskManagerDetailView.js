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
  name: 'TaskManagerDetailView',
  extends: 'foam.ui.DetailView',

  requires: [
    'foam.apps.ctml.Task',
    'foam.ui.ActionButton'
  ],

  properties: [
    'data',
    {
      name: 'hardSelection',
      defaultValue: null
    },
    {
      type: 'Boolean',
      name: 'showActions',
      defaultValue: false,
      preSet: function() { return false; }
    }
  ],

  templates: [
    function toHTML() {/*
      <task-manager id="%%id">
        <tm-body class="md-card-shell" style="display: flex; display: -webkit-flex">
          $$tasks{
            title: 'Tasks',
            editColumnsEnabled: true,
            properties$: this.data.tableColumns$
          }
        </tm-body>
        <a id="stats-for-nerds" target="_blank" href="chrome://memory-redirect">Stats for nerds</a>
      </task-manager>
    */},
    function CSS() {/*
      body, task-manager {
        color: rgba(0, 0, 0, 0.87);
        font-family: 'Roboto', sans-serif;
        font-size: 13px;
        font-weight: 400;
      }
      body > task-manager {
        width: 100%;
        height: 100%;
      }
      task-manager {
        overflow: hidden;
        background: rgb(238,238,238);
        flex-direction: column;
      }
      task-manager .tableView:focus,
      task-manager .mdTableView:focus {
        outline: none;
      }
      task-manager tm-body {
        flex-grow: 1;
        overflow: hidden;
      }
      task-manager,
      task-manager tm-body {
        display: flex;
      }
      task-manager .task-row-icon {
        margin-right: 4px;
        vertical-align: text-bottom;
      }
      #stats-for-nerds {
        flex-grow: 0;
        flex-shrink: 0;
        margin: 0px 10px 10px 10px;
      }
    */}
  ]
});
