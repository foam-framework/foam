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
  name: 'Client',
  package: 'foam.demos.serverdaobreak',
  requires: [
    'foam.demos.serverdaobreak.SomeModel',
    'foam.dao.EasyDAO',
  ],
  properties: [
    {
      name: 'dao',
      model_: 'foam.core.types.DAOProperty',
      view: 'foam.ui.SimpleDAOController',
      lazyFactory: function() {
        return this.EasyDAO.create({
          autoIndex: true,
          cache: true,
          cloning: true,
          contextualize: true,
          daoType: 'MDAO',
          dedup: true,
          guid: true,
          model: this.SomeModel,
          serverUri: 'http://localhost:8081/api',
          sockets: true,
          syncWithServer: true,
        });
      },
    },
    {
      name: 'numRowsToPut',
      type: 'Int',
      defaultValue: 10000,
    }, 
  ],
  actions: [
    {
      name: 'putRows',
      code: function() {
        var randomString = function() {
          return Math.random().toString(36).substring(10);
        };
        for ( var i = 0; i < this.numRowsToPut; i++ ) {
          this.dao.put(this.SomeModel.create({
            from: i,
            body: randomString(),
            subject: randomString(),
          }));
        }
      },
    },
  ],
});
