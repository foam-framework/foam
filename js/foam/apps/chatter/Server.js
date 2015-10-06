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
  name: 'Server',
  imports: [
    'exportDAO'
  ],
  requires: [
    'foam.apps.chatter.Message',
    'foam.apps.chatter.Channel',
    'foam.dao.EasyDAO'
  ],
  properties: [
    {
      name: 'messageDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Message,
          guid: true,
          dedup: true,
          daoType: 'MDAO',
          isServer: true
        });
      }
    },
    {
      name: 'channelDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Channel,
          guid: true,
          dedup: true,
          daoType: 'MDAO',
          isServer: true
        })
      }
    }
  ],
  methods: [
    function execute() {
      this.exportDAO(this.messageDAO);
      this.exportDAO(this.channelDAO);
    }
  ]
});
