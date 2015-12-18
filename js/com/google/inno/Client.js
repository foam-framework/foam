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
  package: 'com.google.inno',
  name: 'Client',
  extends: 'foam.u2.View',
  requires: [
    'foam.dao.EasyDAO',
    'foam.u2.md.TextField',
    'com.google.inno.MessageListView',
    'com.google.inno.Message'
  ],
  exports: [
    'name',
    'bucket'
  ],
  properties: [
    {
      name: 'messageDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Message,
          daoType: 'MDAO',
          syncWithServer: true,
          sockets: true,
          guid: true,
          contextualize: true,
          cloning: true
        });
      }
    },
    {
      name: 'bucket',
      type: 'String',
      defaultValue: 'lobby'
    },
    {
      name: 'name',
      type: 'String',
      defaultValue: 'Anonymoose'
    }
  ],
  methods: [
    function init() {
      this.SUPER();
      this.Y.registerModel(this.TextField, 'foam.u2.TextField');
    },
    function initE() {
      this.x({ data: this })
        .cls(this.myCls())
        .start('div')
          .cls(this.myCls('left-panel'))
          .start('iframe')
            .attrs({
              src: "https://www.youtube.com/embed/y60wDzZt8yg?autoplay=1",
            })
          .end()
        .end()
        .start('div')
          .cls(this.myCls('right-panel'))
          .x({ data: this.messageDAO })
          .add(this.MessageListView.create())
        .end()
    }
  ],
  templates: [
    { name: 'CSS' }
  ]
});
