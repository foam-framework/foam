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
    'foam.u2.DAOUpdateController',
    'foam.u2.md.Toolbar',
    'foam.u2.md.ToolbarAction',
  ],

  listeners: [
    {
      name: 'rowClick',
      code: function(_, __, obj) {
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
        this.stack.pushView(daoUpdateController);
      },
    },
  ],
});
