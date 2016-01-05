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
    'com.google.plus.Person',
    'com.google.ymp.generators.MarketGenerator',
  ],
  imports: [
    'console',
  ],

  constants: {
    DATA_PATHS: [
      global.FOAM_BOOT_DIR + '/../js/com/google/ymp/local/',
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
  ],

  methods: [
    function loadServerData() {

      // Pick one.
      // (a) Generate markets from locations.
      this.populateAppData("location");
      // this.generateMarkets();
      // (b) Load markets from file.
      this.populateAppData("market");

      this.populateAppData("contactProfile");
      this.populateAppData("person");
      this.populateAppData("post");
      this.populateAppData("reply");
      this.populateAppData("dynamicImage");
    },

    function populateAppData(daoName) {
      var dao = this.X[daoName+"DAO_"];
      var model = dao.model;
      this.loadData(daoName, dao, model);
    },

    function loadData(baseName, dao, model, opt_ret) {
      var ret = opt_ret || nop;
      var dataPaths = this.DATA_PATHS.map(function(p) {
        return p + baseName + '.json';
      });
      var found = false;
      for ( var i = 0; i < dataPaths.length; ++i ) {
        try {
          var result = this.fs.readFileSync(dataPaths[i]);
          if ( result ) {
            JSONUtil.arrayToObjArray(this.Y, eval('(' + result + ')'), model).select(dao)(ret);
            found = true;
            break;
          }
        } catch (e) { this.console.log(e); }
      }

      if ( ! found ) ret(null);

      return dao;
    },

    function saveData(baseName, data) {
      var dataPath = this.DATA_PATHS[0] + baseName + '.json';
      this.fs.writeFileSync(dataPath, data);
    },

    function generateMarkets() {
      var count = 0;
      var dao = [];
      var generator = this.MarketGenerator.create();
      var handleMarket = function(market) {
        if ( ! market ) {
          this.console.log(count, 'markets generated');
          this.saveData('market', JSONUtil.stringify(dao));
          return;
        }
        ++count;
        dao.put(market);
        generator.generate(handleMarket);
      }.bind(this);
      generator.generate(handleMarket);
    },
  ],
});
