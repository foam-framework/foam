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
  name: 'FOAMletBrowserConfig',
  package: 'foam.navigator',
  extends: 'foam.navigator.BrowserConfig',
  requires: [
    'foam.dao.CachingDAO',
    'foam.dao.FutureDAO',
    'foam.dao.IDBDAO',
    'MDAO',
    'foam.navigator.dao.MultiDAO',
    'foam.navigator.BrowserConfig',
    'foam.navigator.FOAMlet',
    'foam.navigator.types.Todo',
    'foam.navigator.types.Audio',
    'foam.navigator.views.SelectTypeView'
  ],

  imports: [
    'overlay'
  ],

  properties: [
    {
      name: 'name',
      defaultValue: 'FOAMletBrowser'
    },
    {
      name: 'model',
      defaultValueFn: function() { return this.FOAMlet; }
    },
    {
      name: 'configDAO',
      factory: function() {
        // The BrowserConfig DAO we'll be passing to the MultiDAO that drives
        // the FOAMlet system.
        // TODO(braden): This needs to arequire the model of incoming
        // BrowserConfigs and delay the put until that's done. AsyncAdapterDAO?
        // Doesn't exist yet, but it needs to exist soon.
        var configDAO = this.CachingDAO.create({
          cache: this.MDAO.create({ model: this.BrowserConfig }),
          src: this.IDBDAO.create({
            useSimpleSerialization: false,
            name: 'FOAMletBrowserConfigs',
            model: this.BrowserConfig
          })
        });

        var future = afuture();
        var futureDAO = this.FutureDAO.create({
          future: future.get
        });

        configDAO.select(COUNT())(function(c) {
          if (c.count > 0) future.set(configDAO);
          else {
            [
              this.BrowserConfig.create({ model: 'foam.navigator.types.Todo' }),
              this.BrowserConfig.create({ model: 'foam.navigator.types.Audio' })
            ].dao.select(configDAO)(function() {
              future.set(configDAO);
            });
          }
        }.bind(this));

        return futureDAO;
      }
    },
    {
      name: 'dao',
      lazyFactory: function() {
        return this.MultiDAO.create({
          configDAO: this.configDAO
        });
      }
    }
  ],

  actions: [
    {
      name: 'newItem',
      label: 'Create...',
      code: function() {
        var self = this;
        this.configDAO.select([])(function(configs) {
          this.overlay.open(this.SelectTypeView.create({
            dao: configs.map(function(c) { return c.model; }).dao
          }));
        }.bind(this));
      }
    }
  ]
});
