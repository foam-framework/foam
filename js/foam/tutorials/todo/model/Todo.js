/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
CLASS({
  package: 'foam.tutorials.todo.model',
  name: 'Todo',
  // TODO(braden): Remove once non-Views get their CSS installed.
  traits: ['foam.ui.CSSLoaderTrait'],

  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'title',
    },
    {
      type: 'Boolean',
      name: 'isCompleted',
      label: 'Completed',
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        align-items: center;
        border-bottom: 1px solid #eee;
        display: flex;
        min-height: 48px;
      }
    */},
    function toRowE() {/*#U2
      <div class="^">
        <:isCompleted showLabel="false"/>
        {{this.title$}}
      </div>
    */},
  ]
});
