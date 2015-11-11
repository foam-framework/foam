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
  package: 'foam.demos.olympics',
  name: 'Server',
  requires: [
    'foam.dao.EasyDAO',
    'foam.demos.olympics.Medal',
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
      name: 'medalDAO',
      factory: function() {
	var dao = foam.dao.EasyDAO.create({
	  daoType: 'MDAO',
	  model: this.Medal,
	  dedup: true,
	  seqNo: true,
	  autoIndex: true
	});

	var result = this.fs.readFileSync(global.FOAM_BOOT_DIR + '/../js/foam/demos/olympics/MedalData.json');
        if ( result ) JSONUtil.arrayToObjArray(this.X, eval("(" + result + ")"), this.Medal).select(dao);

        return dao;
      }
    }
  ],
  methods: [
    function execute() { this.exportDAO(this.medalDAO); }
  ]
});
