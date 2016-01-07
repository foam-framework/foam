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
  package: 'com.google.ymp.controllers',
  name: 'DAOController',
  extends: 'foam.u2.DAOController',

  requires: [
    'com.google.ymp.controllers.DAOUpdateController',
    'foam.u2.ScrollView',
    'foam.u2.md.Toolbar',
    'foam.u2.md.ToolbarAction',
  ],
  imports: [
    'document',
    'postDAO',
    'postId$',
  ],

  properties: [
    {
      type: 'ViewFactory',
      name: 'rowView',
      defaultValue: function(args, X) { return args.data.toRowE(X); },
    },
    {
      type: 'ViewFactory',
      name: 'listViewFactory',
      defaultValue: 'foam.u2.ScrollView',
    },
    {
      type: 'String',
      name: 'postId',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.postId$.addListener(this.onSetPost);
      if ( this.postId )
        this.onSetPost(this, ['property', 'postId'], '', this.postId);
    },
  ],

  listeners: [
    {
      name: 'rowClick',
      documentation: 'Arguments: receiver, topic, value',
      code: function(_, __, obj) {
        this.postId = obj.id;
      },
    },
    {
      name: 'onSetPost',
      documentation: 'Arguments: receiver, topic, oldValue, newValue',
      code: function(_, __, ___, objId) {
        if ( ! objId ) return;
        this.postDAO.find(objId, { put: this.onGetPost });
      },
    },
    {
      name: 'onGetPost',
      documentation: 'Arguments: obj (from put)',
      code: function(obj) {
        var Y = this.Y.sub({ data: obj });
        var title = obj.title || obj.name;
        var daoUpdateController = this.DAOUpdateController.create({
          model: this.model,
          data: obj,
          myControllerMode: 'view',
          title: title,
        }, Y);
        var toolbar = this.Toolbar.create({ title: title }, Y);
        toolbar.addLeftActions([
          this.ToolbarAction.create({
            data: daoUpdateController,
            action: daoUpdateController.BACK,
          }),
        ]);
        daoUpdateController.toolbar_ = toolbar;
        this.X.stack.pushView(daoUpdateController);
      },
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
    */},
  ],
});
