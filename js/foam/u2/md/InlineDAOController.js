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
  package: 'foam.u2.md',
  name: 'InlineDAOController',
  extends: 'foam.u2.View',
  documentation: 'A DAOController designed to go into a DetailView.',

  requires: [
    'foam.u2.DAOController',
    'foam.u2.DialogDAOCreateController',
    'foam.u2.DialogDAOUpdateController',
  ],

  imports: [
    'stack',
  ],

  properties: [
    'data',
    {
      name: 'model',
      defaultValueFn: function() { return this.data.model; },
    },
    'listViewFactory',
    'listView',
    'rowView',
    {
      name: 'title',
      lazyFactory: function() {
        return this.data.model.plural;
      }
    },
    ['showAdd', true],
  ],

  methods: [
    function init() {
      this.SUPER();
      this.Y.registerModel(this.DialogDAOUpdateController, 'foam.u2.DAOUpdateController');
    },
    function initE() {
      this.myCls();

      var addY = this.Y.sub({
        data: this
      });

      this.start()
          .cls(this.myCls('header'))
          .start().cls(this.myCls('title')).add(this.title$).end()
          .add(this.ADD_ITEM.toE(addY))
          .end();

      var args = { data: this.data };
      if ( this.listViewFactory ) args.listViewFactory = this.listViewFactory;
      if ( this.listView ) args.listView = this.listView;
      if ( this.rowView ) args.rowView = this.rowView;
      this.add(this.DAOController.create(args));
    },
  ],

  actions: [
    {
      name: 'addItem',
      ligature: 'add',
      isAvailable: function() { return this.showAdd; },
      code: function() {
        this.stack.pushView(this.DialogDAOCreateController.create({
          dao: this.data,
          model: this.model,
        }));
      }
    },
  ],

  templates: [
    function CSS() {/*
      ^header {
        align-items: center;
        display: flex;
      }

      ^title {
        flex-grow: 1;
        font-size: 16px;
        font-weight: lighter;
        margin: 0 16px;
      }
    */},
  ]
});
