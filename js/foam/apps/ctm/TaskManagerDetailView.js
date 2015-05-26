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

  properties: [
    {
      model_: 'BooleanProperty',
      name: 'showActions',
      defaultValue: false
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
            editColumnsEnabled: true
          }
        </tm-body>
        <tm-footer>
          <a target="_blank" href="chrome://memory-redirect">Stats for nerds</a>
          $$kill
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
      task-manager tm-header,
      task-manager tm-body,
      task-manager tm-footer {
        display: block;
        padding: 20px;
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
      task-manager tm-footer {
        display: flex;
        justify-content: space-between;
      }
    */}
  ]
});
