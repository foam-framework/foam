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
  package: 'foam.node.server',
  name: 'ServerConfig',
  requires: [
    'foam.dao.EasyDAO',
    'foam.node.dao.JSONFileDAO',
  ],

  documentation: function() {/*
    <p>
      This is the server-side counterpart to
      $$DOC{ref:"foam.browser.BrowserConfig"}. It hopes to make configuring
      a Node.js server easy. Specifying only $$DOC{ref:".models"} is enough
      to get started: it results in a memory-cached JSON file DAO named after
      each model. You can customize the DAOs by providing $$DOC{ref:".daos"}.
    </p>
    <p>
      Specify $$DOC{ref:".staticFiles"} and $$DOC{ref:".staticDirs"} to tell
      the server which files and directories to serve. The entries in these
      arrays can be either strings or [URL prefix, filesystem path] pairs.
      A string is used as both prefix and (relative) path.
    </p>
  */},

  properties: [
    {
      model_: 'ArrayProperty',
      name: 'daos',
      lazyFactory: function() {
        if (!this.models) {
          console.warn('Neither models nor daos was provided to ServerConfig.');
          return [];
        }

        var daos = [];
        for (var i = 0; i < this.models.length; i++) {
          daos.push(this.EasyDAO.create({
            model: this.models[i],
            cache: true,
            seqNo: true,
            daoType: this.JSONFileDAO
          }));
        }
        return daos;
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'models',
      documentation: 'An Array of $$DOC{ref:"Model", plural:true} to store. ' +
          'Ignored if $$DOC{ref:".daos"} is provided.',
    },
    {
      model_: 'IntProperty',
      name: 'port',
      help: 'Port on which to run the server. Defaults to 8080.',
      adapt: function(_, v) {
        return typeof v === 'string' ? parseInt(v) : v;
      },
      defaultValue: 8080
    },
    {
      model_: 'ArrayProperty',
      name: 'staticDirs',
      documentation: '[URL prefix, dir path] pairs. Strings are used for ' +
          'both parts of the pair.',
      adapt: function(old, nu) {
        if (!nu) return nu;
        for (var i = 0; i < nu.length; i++) {
          if (typeof nu[i] === 'string') {
            nu[i] = ['/' + nu[i], nu[i]];
          }
        }
        return nu;
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'staticFiles',
      documentation: '[URL, file path] pairs. Strings are used for ' +
          'both parts of the pair.',
      adapt: function(old, nu) {
        for (var i = 0; i < nu.length; i++) {
          if (typeof nu[i] === 'string') {
            nu[i] = ['/' + nu[i], nu[i]];
          }
        }
        return nu;
      }
    }
  ]
});
