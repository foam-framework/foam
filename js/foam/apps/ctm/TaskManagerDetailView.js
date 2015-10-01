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
  name: 'TaskManagerDetailView',
  extendsModel: 'foam.ui.DetailView',

  requires: [
    'foam.apps.ctm.Task',
    'foam.apps.ctm.TaskPieGraph',
    'foam.ui.Icon',
    'foam.ui.ActionButton'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old && old.filteredCount$ )
          old.filteredCount$.removeListener(this.onFilteredCountChange);
        if ( nu && nu.filteredCount$ )
          nu.filteredCount$.addListener(this.onFilteredCountChange);
      }
    },
    {
      name: 'hardSelection',
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        var taskLabel = this.$taskLabel;
        if ( taskLabel ) taskLabel.innerHTML = nu ? nu.name : 'Task';
      }
    },
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
    },
    {
      name: '$taskLabel',
      defaultValueFn: function() {
        return this.$ && this.$.querySelector('#' + this.id + '-task-label');
      }
    },
    {
      name: 'searchIcon',
      lazyFactory: function() {
        return this.Icon.create({
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAwElEQVQ4Ec3BMU7CYAAG0BfkHH8jZ5C4mGDirSBwjw7sBORIVEdhBibI50g6FOvGezy4D1sHVwef3v1haCkiIiJqQ3csxdFUMVCZOYlapw9x9OJm7CQmOmzFVNtcbHQ4iKLtWfzocBUDbU/iosNBVNpGYq/Dp5hpW4i1Du/iZOzm1Vm86VSLk7lnT0YWzmLljqFaRERErMS3yh0TGz8u9tbe8C2+VHqrfIlG0VulEY2it0ojdoreisZO8Q9F8bh+AdReVMyZp3KbAAAAAElFTkSuQmCC',
          ligature: 'search',
          color: 'rgba(0, 0, 0, 0.27)',
          width: 20,
          height: 20,
          fontSize: 20
        }, this.Y);
      }
    }
  ],

  listeners: [
    {
      name: 'onFilteredCountChange',
      isFramed: true,
      code: function(_, __, old, nu) {
        if ( ! this.filteredTasksView || old === nu ) return;
        this.filteredTasksView.title = nu + ' Tasks';
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <task-manager id="%%id">
        <tm-header class="md-card-shell">
          <header-text>Task Manager</header-text>
          <search-box>
            <chrome>
              %%searchIcon
            </chrome>
            $$search{ height: 30 }
          </search-box>
        </tm-header>
        <tm-body class="md-card-shell">
          $$filteredTasks{
            title: 'Tasks',
            editColumnsEnabled: true,
            properties$: this.data.tableColumns$
          }
        </tm-body>
        <tm-footer class="md-card">
          <stats>
            <global-stats>
              <label>System</label>
              <stats>
                <stat>
                  <label>Memory</label>
                  <stat-data>$$tasks{ model_: this.TaskPieGraph, property: this.Task.MEMORY }</stat-data>
                </stat>
                <stat>
                  <label>CPU</label>
                  <stat-data>$$tasks{ model_: this.TaskPieGraph, property: this.Task.CPU }</stat-data>
                </stat>
                <stat>
                  <label>Network</label>
                  <stat-data>$$tasks{ model_: this.TaskPieGraph, property: this.Task.NETWORK }</stat-data>
                </stat>
              </stats>
            </global-stats>
            <stats-separator id="<%= this.setClass('hidden', function() { return !this.data || !this.data.hardSelection; }.bind(this)) %>"></stats-separator>
            <local-stats id="<%= this.setClass('hidden', function() {
              // return !this.data || !this.data.hardSelection;
              return false;
            }.bind(this)) %>">
              <label id="%%id-task-label">Task</label>
              <stats>
                <stat>
                  <label>Memory</label>
                  <stat-data>$$memory{ width: 80, height: 40 }</stat-data>
                </stat>
                <stat>
                  <label>CPU</label>
                  <stat-data>$$cpu{ width: 80, height: 40 }</stat-data>
                </stat>
                <stat>
                  <label>Network</label>
                  <stat-data>$$network{ width: 100, height: 50 }</stat-data>
                </stat>
              </stats>
            </local-stats>
          </stats>
          <actions>
          </actions>
        </tm-footer>
        <a id="stats-for-nerds" target="_blank" href="chrome://memory-redirect">Stats for nerds</a>
      </task-manager>
    */},
    function CSS() {/*
      body, task-manager {
        width: 100%;
        height: 100%;
        color: rgba(0, 0, 0, 0.87);
        font-family: 'Roboto', sans-serif;
        font-size: 13px;
        font-weight: 400;
      }
      task-manager {
        background: rgb(238,238,238);
        flex-direction: column;
      }
      task-manager .tableView:focus,
      task-manager .mdTableView:focus {
        outline: none;
      }
      task-manager tm-footer {
        display: block;
      }
      task-manager tm-header,
      task-manager tm-footer {
        flex-grow: 0;
        flex-shrink: 0;
      }
      task-manager tm-header {
        height: 64px;
        padding: 0px 14px 0px 24px;
        justify-content: space-between;
        align-items: center;
      }
      task-manager tm-header header-text {
        font-size: 30px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }
      task-manager tm-header search-box {
        position: relative;
      }
      task-manager tm-header search-box input {
        color: rgba(0, 0, 0, 0.87);
        font-size: 13px;
        font-weight: 400;
        padding-left: 26px;
        height: 26px;
        border: 1px solid rgba(0, 0, 0, 0.27);
        border-radius: 2px;
      }
      task-manager tm-header search-box input:focus {
        border: 1px solid rgba(0, 0, 0, 0.54);
        outline: none;
      }
      task-manager tm-header search-box chrome {
        position: absolute;
        top: 2px;
        left: 4px;
      }
      task-manager tm-header search-box i,
      task-manager tm-header search-box i.material-icons {
        color: rgba(0, 0, 0, 0.27);
      }
      task-manager tm-header search-box i.material-icons {
        font-size: 20px;
      }
      task-manager tm-body {
        flex-grow: 1;
        overflow: hidden;
      }
      task-manager,
      task-manager tm-body, task-manager tm-body.md-card-shell,
      task-manager tm-header, task-manager tm-header.md-card-shell,
      task-manager tm-footer actions,
      task-manager tm-footer stats,
      task-manager tm-footer stats global-stats,
      task-manager tm-footer stats local-stats,
      task-manager tm-footer stats stats,
      task-manager tm-footer stats stats stat,
      task-manager tm-footer stats stats stat stat-data {
        display: flex;
      }
      task-manager tm-footer stats {
        align-items: stretch;
        justify-content: space-around;
      }
      task-manager tm-footer stats global-stats,
      task-manager tm-footer stats local-stats {
        align-items: stretch;
        justify-content: stretch;
      }
      task-manager tm-footer stats label {
        flex-grow: 0;
        padding: 5px;
        font-weight: bold;
        text-align: center;
      }
      task-manager tm-footer stats stats {
        flex-grow: 1;
      }
      task-manager tm-footer stats stats stat {
        flex-grow: 1;
        align-items: center;
        justify-content: stretch;
        flex-direction: column;
      }
      task-manager tm-footer stats stat label {
        flex-grow: 0;
        font-weight: normal;
      }
      task-manager tm-footer stats global-stats,
      task-manager tm-footer stats local-stats {
        flex-grow: 1;
        flex-direction: column;
        justify-content: stretch;
      }
      task-manager tm-footer stats stat stat-data {
        flex-grow: 1;
        flex-direction: column;
        justify-content: center;
      }
      task-manager tm-footer stats {
        flex-wrap: wrap;
      }
      task-manager tm-footer stats global-stats,
      task-manager tm-footer stats local-stats {
        flex-grow: 1;
      }
      task-manager tm-footer stats .hidden {
        display: none;
      }
      task-manager tm-footer stats stats-separator {
        display: block;
        flex-grow: 0;
        flex-shrink: 0;
        border-left: 1px solid rgba(0, 0, 0, 0.27);
        width: 0px;
      }
      task-manager tm-footer actions {
        justify-content: space-between;
        align-items: center;
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
