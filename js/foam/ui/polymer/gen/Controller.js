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
  package: 'foam.ui.polymer.gen',

  requires: [
    'EasyDAO',
    'MultiLineStringArrayView',
    'TableView',
    'foam.ui.polymer.gen.Component',
    'foam.ui.polymer.gen.ComponentBuilder'
  ],
  exports: [
    'dao'
  ],

  properties: [
    {
      model_: 'StringArrayProperty',
      name: 'componentsToRegister',
      view: 'MultiLineStringArrayView',
      factory: function() {
        return [
          '../bower_components/paper-button/paper-button.html',
          '../bower_components/paper-checkbox/paper-checkbox.html'
        ];
      }
    },
    {
      name: 'daoConfig',
      factory: function() {
        return {
          daoType: 'MDAO',
          model: this.Component,
          logging: true
        };
      },
      hidden: true
    },
    {
      name: 'dao',
      label: 'Registered Components',
      view: 'TableView',
      factory: function() {
        return this.EasyDAO.create(this.daoConfig);
      }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        var ret = this.SUPER();
        return ret;
      }
    },
    {
      name: 'registerComponent',
      code: function(rawURL) {
        var url = this.canonicalizeURL(rawURL);
        this.dao.find(url, {
          error: function(url) {
            this.ComponentBuilder.create(
                {},
                this.X.sub({
                  controller: this,
                  canonicalizeURL: this.canonicalizeURL,
                  comp: this.Component.create({ url: url })
                }));
          }.bind(this, url)
        });
      }
    },
    {
      name: 'canonicalizeURL',
      code: function(url) {
        var parts = url.split('/').filter(function(part) {
          return part !== '.';
        });
        for ( var i = 1; i < parts.length; ++i ) {
          if ( i > 0 && parts[i] === '..' && parts[i - 1] !== '..' ) {
            parts = parts.slice(0, i - 1).concat(parts.slice(i + 1));
            i = i - 2;
          }
        }
        return parts.join('/');
     }
    }
  ],

  actions: [
    {
      name: 'registerComponents',
      action: function() {
        this.componentsToRegister.forEach(this.registerComponent.bind(this));
      }
    }
  ]});
