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
  package: 'foam.node.handlers',
  name: 'OnDemandDAOHandler',
  extends: 'foam.node.handlers.DAOHandler',
  requires: [
    'foam.node.dao.JSONFileDAO',
    'foam.dao.EasyDAO',
    'foam.dao.FutureDAO',
  ],
  properties: [
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'crypto'
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'nodePath',
      moduleName: 'path'
    },
    {
      name: 'dataDir',
      type: 'String',
      defaultValueFn: function() {
        return global.FOAM_BOOT_DIR + this.nodePath.sep + '../dao_data';
      }
    }
  ],
  methods: [
    function getDAO(subject) {
      if ( ! this.daoMap[subject] ) {
        var future = afuture();

        this.daoMap[subject] = this.FutureDAO.create({
          future: future.get
        });


        this.X.arequire(subject.substring(0, subject.length - 3))(function(m) {
          future.set(this.EasyDAO.create({
            model: m,
            daoType: this.JSONFileDAO.xbind({
              model: m,
              filename: this.dataDir +
                this.nodePath.sep +
                this.crypto.createHash('sha256').update(m.id).digest('hex') +
                '.json'
            }),
            isServer: true,
            guid: true,
            cloning: true,
            contextualize: true
          }));
        }.bind(this));
      }

      return this.daoMap[subject];
    }
  ]
});
