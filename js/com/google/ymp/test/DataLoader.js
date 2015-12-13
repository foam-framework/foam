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
  name: 'DataLoader',
  package: 'com.google.ymp.test',

  requires: [
    'com.google.ow.IdGenerator',
    'com.google.plus.Person',
  ],
  imports: [
    'console',
  ],

  constants: {
    DATA_PATHS: [
      global.FOAM_BOOT_DIR + '/../js/com/google/ymp/test/',
    ],
  },

  properties: [
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    },
    {
      name: 'util',
      lazyFactory: function() { return require('util'); },
    },
    {
      name: 'idGenerator',
      lazyFactory: function() {
        return this.IdGenerator.create(null, this.Y);
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      
      this.populateData("market");
      this.populateData("person");
      this.populateData("post");
      this.populateData("reply");
      this.populateData("dynamicImage");
    },
    
    function populateData(daoName) {
      var dao = this.X[daoName+"DAO_"];
      var model = dao.model;
      
      var dataPaths = this.DATA_PATHS.map(function(p) {
        return p + daoName + '.json';
      });
      for ( var i = 0; i < dataPaths.length; ++i ) {
        try {
          var result = this.fs.readFileSync(dataPaths[i]);
          if ( result ) {
            JSONUtil.arrayToObjArray(this.Y, eval('(' + result + ')'), model).select(dao);
            break;
          }
        } catch (e) {}
      }

      return dao;
    },
  ],
});
