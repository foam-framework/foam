/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2',
  name: 'DialogDAOCreateController',
  extends: 'foam.u2.View',

  documentation: 'Opens a $$DOC{ref:"foam.u2.Dialog"} for creating an item.',
  requires: [
    'foam.u2.EasyDialog',
    'foam.u2.md.DetailView',
  ],

  exports: [
    'myControllerMode as controllerMode',
  ],

  properties: [
    ['myControllerMode', 'create'],
    {
      name: 'model',
      lazyFactory: function() { return this.dao.model; }
    },
    {
      name: 'data',
      factory: function() {
        return this.model.create();
      }
    },
    {
      name: 'dao',
      factory: function() {
        return this.X[daoize(this.model.name)];
      }
    },
    {
      name: 'title',
      factory: function() {
        return 'New ' + this.model.name;
      }
    },
    {
      name: 'body_',
      factory: function() {
        return this.Y.E('div').cls(this.myCls('body')).add(this.DetailView.create({
          data$: this.data$
        }));
      }
    },
    {
      name: 'dialog_',
      factory: function() {
        return this.EasyDialog.create({
          title: this.title,
          body: this.body_,
          buttons: [
            [this.onSave, 'Save'],
            [this.onCancel, 'Cancel'],
          ],
        });
      }
    },
  ],

  listeners: [
    function onCancel() {
      this.dialog_.remove();
      this.remove();
    },
    function onSave() {
      this.dao.put(this.data, {
        put: this.onCancel,
        error: this.onCancel
      });
    },
  ],

  methods: [
    function initE() {
      // Do nothing.
    },
    function open() {
      this.dialog_.open();
    },
  ],
  templates: [
    function CSS() {/*
      ^body {
        overflow-x: hidden;
        overflow-y: auto;
      }
    */}
  ]
});
