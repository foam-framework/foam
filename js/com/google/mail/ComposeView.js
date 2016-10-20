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
   "package": "com.google.mail",
   "name": "ComposeView",
   "extends": "foam.ui.md.UpdateDetailView",
  properties: [
    {
      name: 'title',
      dynamicValue: null,
      value: 'Compose'
    },
    {
      name: 'leftActions_',
      lazyFactory: function() {
        return [
          this.ToolbarAction.create({
            data: this,
            action: this.model_.getAction('back')
          })
        ]
      }
    },
    {
      name: 'rightActions_',
      lazyFactory: function() {
        return [
          this.ToolbarAction.create({
            data: this,
            action: this.model_.getAction('save')
          }),
          this.ToolbarAction.create({
            data: this,
            action: this.model_.getAction('send')
          })
        ]
      }
    }
  ],
  actions: [
    {
      name: 'send',
      iconUrl: 'images/send.png',
      code: function() {
        this.data.messageSent = true;
        var self = this;
        this.dao.put(this.data, {
          put: function() {
            self.stack.popView();
          }
        });
      }
    }
  ]
});
