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
  name: 'DialogDAOUpdateController',
  extends: 'foam.u2.View',

  documentation: 'Opens a $$DOC{ref:"foam.u2.Dialog"} for editing this item.',
  requires: [
    'foam.u2.EasyDialog',
    'foam.u2.md.DetailView',
  ],

  exports: [
    'myControllerMode as controllerMode',
  ],

  properties: [
    ['myControllerMode', 'update'],
    ['cloned_', false],
    {
      name: 'model',
      lazyFactory: function() { return this.dao.model; }
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        // Does a find(), regardless of whether it was passed a whole object or
        // a single value.
        this.dao.find(nu.id || nu, {
          put: function(obj) {
            obj = obj.clone();
            this.data_ = obj;
            this.body_.add( (obj && obj.toE ) ? obj.toE(this.Y) : this.DetailView.create({ data: obj }) );
          }.bind(this),
          error: function(err) {
            this.body_.add('Error fetching data: ' + err);
          }.bind(this)
        });
      },
    },
    {
      name: 'data_',
      documentation: 'The cloned, internal data.',
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
        return 'Edit ' + this.model.name;
      }
    },
    {
      name: 'body_',
      factory: function() {
        return this.Y.E('div').cls(this.myCls('body'));
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
      this.dao.put(this.data_, {
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
