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
  package: 'foam.apps.chatter',
  name: 'Client',
  requires: [
    'foam.dao.EasyDAO',
    'foam.apps.chatter.Message',
    'foam.ui.TableView'
  ],
  properties: [
    {
      name: 'messageDAO',
      label: 'Messages',
      view: 'foam.ui.DAOListView',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          model: this.Message,
          guid: true,
          dedup: true,
          syncWithServer: true
        }).orderBy(this.Message.TIMESTAMP);
      }
    },
    {
      model_: 'StringProperty',
      name: 'nick',
      defaultValue: 'Anonymous'
    },
    {
      model_: 'StringProperty',
      name: 'message',
      postSet: function(_, message) {
        if ( message && this.nick ) {
          this.messageDAO.put(
            this.Message.create({
              from: this.nick,
              content: message
            }));
          this.message = '';
        }
      }
    }
  ]
});
