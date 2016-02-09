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
  package: 'com.google.watlobby',
  name: 'TopicDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'com.google.watlobby.Topic',
    'foam.dao.EasyDAO'
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'clientMode',
      defaultValue: true
    },
    {
      name: 'delegate',
      factory: function() {
        var dao = this.EasyDAO.create({
          daoType:        'MDAO',
          model:          this.Topic,
          cloning:        true,
          contextualize:  true,
          guid:           true,
          sockets:        true,
          syncWithServer: this.clientMode
        });

        if ( ! this.clientMode ) {
          axhr('js/com/google/watlobby/topics.json')(function(topics) {
            JSONUtil.arrayToObjArray(this.X, topics, this.Topic).select(dao);
          }.bind(this));
        }

        return dao;
      }
    }
  ]
});
