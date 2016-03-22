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
    'as daoController',
    'as data',
  ],

  properties: [
    ['myControllerMode', 'create'],
    {
      name: 'model',
      lazyFactory: function() { return this.dao.model; }
    },
    {
      type: 'Boolean',
      name: 'valid',
      defaultValue: true
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
        return 'New ' + this.model.label;
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
            this.SAVE,
            this.CANCEL,
          ],
        });
      }
    },
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function() {
        return this.valid;
      },
      code: function() {
        this.dao.put(this.data, {
          put: this.close.bind(this),
          error: this.close.bind(this),
        });
      },
    },
    {
      name: 'cancel',
      code: function() {
        this.close();
      }
    },
  ],

  methods: [
    function initE() {
      // Do nothing.
    },
    function open() {
      this.dialog_.open();
    },
    function close() {
      this.dialog_.remove();
      this.remove();
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
