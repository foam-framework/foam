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
  name: 'Server',
  requires: [
    'com.google.watlobby.Topic',
    'foam.dao.EasyDAO',
    'foam.node.dao.JSONFileDAO'
  ],
  imports: [
    'exportDAO'
  ],
  properties: [
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    },
    {
      name: 'topicDAO',
      factory: function() {
	var dao = foam.dao.EasyDAO.create({
	  daoType: this.JSONFileDAO.xbind({
            filename: global.FOAM_BOOT_DIR + '/../js/com/google/watlobby/topics_dao.json'
          }),
	  model:     this.Topic,
	  guid:      true,
	  dedup:     true,
          autoIndex: true,
          isServer:  true
	});

        dao.select(COUNT())(function(c) {
          if ( c.count ) return;

	  var result = this.fs.readFileSync(global.FOAM_BOOT_DIR + '/../js/com/google/watlobby/topics.json');
          if ( result ) JSONUtil.arrayToObjArray(this.X, eval('(' + result + ')'), this.Topic).select(dao);
        }.bind(this));

        return dao;
      }
    }
  ],
  methods: [
    function execute() { this.exportDAO(this.topicDAO); }
  ]
});
