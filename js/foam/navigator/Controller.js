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
  name: 'Controller',
  package: 'foam.navigator',
  extendsModel: 'View',
  requires: [
    'EasyDAO',
    'FutureDAO',
    'TableView',
    'TextFieldView',
    'ToolbarView',
    'foam.navigator.BrowserConfig',
    'foam.navigator.FOAMlet',
    'foam.navigator.views.OverlayView',
    'foam.navigator.views.SelectTypeView',
    'foam.navigator.dao.MultiDAO'
  ],
  exports: [
    'dao',
    'overlay'
  ],

  constants: [
    {
      name: 'FOAMLET_MODELS',
      value: [
        'foam.navigator.types.Todo'
      ]
    }
  ],

  properties: [
    {
      name: 'config',
      documentation: 'Sets up the default BrowserConfig, which loads FOAMlets.',
      factory: function() {
        // The BrowserConfig DAO we'll be passing to the MultiDAO that drives
        // the FOAMlet system.
        var configDAO = this.EasyDAO.create({
          model: this.BrowserConfig,
          cache: true
        });

        // The future DAO handed temporarily to the MultiDAO to buy time while
        // we check if we need to populate an empty configDAO.
        var future = afuture();
        var futureDAO = this.FutureDAO.create({
          future: future.get
        });

        // Check if the configDAO is empty, and populate it with the default
        // types if it is.
        configDAO.select(COUNT())(function(c) {
          if (c.count > 0) future.set(configDAO);
          else {
            [
              this.BrowserConfig.create({ model: 'foam.navigator.types.Todo' })
            ].dao.select(configDAO)(function() {
              future.set(configDAO);
            });
          }
        }.bind(this));

        return this.BrowserConfig.create({
          model: this.FOAMlet,
          dao: this.MultiDAO.create({
            configDAO: futureDAO
          })
        });
      }
    },
    {
      name: 'dao',
      factory: function() {
        return this.config.dao;
      }
    },
    {
      name: 'queryParser',
      factory: function() {
        // Constructs and returns our query parser. This parser is
        // model-agnostic and simply turns any "foo:bar" into an axis search.
        // TODO(braden): Actually implement the sophisticated parsing here.
        return function(q) {
          return this.config.queryParser;
        };
      }
    },
    {
      name: 'q',
      view: {
        factory_: 'TextFieldView',
        name: 'search',
        type: 'search',
        onKeyMode: true,
        displayWidth: 95
      }
    },
    {
      name: 'count',
      view: {
        factory_: 'TextFieldView',
        name: 'count',
        mode: 'read-only',
        displayWidth: 10
      }
    },
    {
      name: 'table',
      factory: function() {
        return this.TableView.create({
          model: this.config.model,
          dao: this.dao,
          scrollEnabed: true,
          rows: 20
        });
      },
      postSet: function(old, nu) {
        if (old) Events.unlink(old.scrollbar.value$, this.count$);
        Events.link(nu.scrollbar.value$, this.count$);
      }
    },
    {
      name: 'selection',
      postSet: function(old, nu) {
        this.toolbar.actions = nu.model_.actions;
      }
    },
    {
      name: 'toolbar',
      factory: function() {
        return this.ToolbarView.create({
          actions: this.config.model.actions,
          value$: this.table.selection$
        });
      }
    },
    {
      name: 'overlay',
      factory: function() {
        return this.OverlayView.create();
      }
    },
  ],

  actions: [
    {
      name: 'newItem',
      label: 'Create...',
      action: function() {
        var models = this.FOAMLET_MODELS.map(function(fullName) {
          return this[fullName.split('.').pop()];
        }.bind(this));
        this.overlay.open(this.SelectTypeView.create({
          dao: models.dao
        }));
      }
    }
  ],

  templates: [
    function CSS() {/*
    */},
    function toInnerHTML() {/*
      %%overlay
      Search: $$q
      Count: $$count
      $$newItem
      %%toolbar
      %%table
    */}
  ]
});
