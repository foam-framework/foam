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
    'foam.dao.EasyDAO',
    'foam.ui.MultiLineStringArrayView',
    'foam.ui.TableView',
    'foam.ui.polymer.gen.Component',
    'foam.ui.polymer.gen.ComponentBuilder',
    'foam.ui.polymer.gen.ComponentProperty',
    'foam.ui.polymer.gen.PolymerPrototype',
    'foam.ui.polymer.gen.PolymerPrototypeBuilder'
  ],

  exports: [
    'componentDAO',
    'propertyDAO',
    'prototypeDAO',
    'parser',
    'canonicalizeURL',
    'shortenURL',
    'filterNodes',
    'getNodeAttribute',
    'ELLIPSIS'
  ],

  imports: [
    'document'
  ],

  properties: [
    {
      type: 'StringArray',
      name: 'componentsToRegister',
      view: 'foam.ui.MultiLineStringArrayView',
      factory: function() {
        return [
          '../bower_components/paper-button/paper-button.html',
          '../bower_components/paper-checkbox/paper-checkbox.html'
        ];
      }
    },
    {
      name: 'componentDAOConfig',
      factory: function() {
        return {
          daoType: 'MDAO',
          model: this.Component
        };
      },
      hidden: true
    },
    {
      name: 'componentDAO',
      label: 'Registered Components',
      view: 'foam.ui.TableView',
      factory: function() {
        return this.EasyDAO.create(this.componentDAOConfig);
      }
    },
    {
      name: 'propertyDAOConfig',
      factory: function() {
        return {
          daoType: 'MDAO',
          model: this.ComponentProperty
        };
      },
      hidden: true
    },
    {
      name: 'propertyDAO',
      label: 'Registered Component Properties',
      view: 'foam.ui.TableView',
      factory: function() {
        return this.EasyDAO.create(this.propertyDAOConfig);
      }
    },
    {
      name: 'prototypeDAOConfig',
      factory: function() {
        return {
          daoType: 'MDAO',
          model: this.PolymerPrototype
        };
      },
      hidden: true
    },
    {
      name: 'prototypeDAO',
      label: 'Component Prototypes',
      view: 'foam.ui.TableView',
      factory: function() {
        return this.EasyDAO.create(this.prototypeDAOConfig);
      }
    },
    {
      name: 'polymerPrototypeBuilder',
      type: 'foam.ui.polymer.gen.PolymerPrototypeBuilder',
      factory: function() {
        return this.PolymerPrototypeBuilder.create();
      },
      hidden: true
    },
    {
      type: 'HTMLParser',
      name: 'parser',
      factory: function() { return HTMLParser.create(); },
      hidden: true
    },
    {
      type: 'Function',
      name: 'canonicalizeURL',
      factory: function() {
        return function(url) {
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
        };
      },
      hidden: true
    },
    {
      type: 'Function',
      name: 'shortenURL',
      factory: function() {
        return function(url) {
          var firstIdx = url.indexOf('/');
          var lastIdx  = url.lastIndexOf('/');
          if ( firstIdx !== lastIdx )
          return this.ELLIPSIS + url.slice(lastIdx);
          else
          return url;
        };
      },
      hidden: true
    },
    {
      type: 'Function',
      name: 'filterNodes',
      factory: function() {
        return function(node, fltr, opt_acc) {
          var acc = opt_acc || [];
          if ( fltr(node) ) acc.push(node);
          node.children.forEach(function(child) {
            this.filterNodes(child, fltr, acc);
          }.bind(this));
          return acc;
        };
      },
      hidden: true
    },
    {
      type: 'Function',
      name: 'getNodeAttribute',
      factory: function() {
        return function(node, attrName) {
          var attr = node.attributes.filter(function(attr) {
            return attr.name === attrName;
          })[0];
          if ( attr ) return attr.value;
          else        return undefined;
        };
      },
      hidden: true
    },
    {
      type: 'String',
      name: 'ELLIPSIS',
      defaultValue: '\u2026',
      todo: function() {/*
        TODO(markdittmer): This should be a constant, but we want to export it,
        and exporting constants isn't supported (yet).
      */},
      hidden: true
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        var ret = this.SUPER();
        window.propertyDAO = this.propertyDAO;
        return ret;
      }
    },
    {
      name: 'registerComponent',
      code: function(rawURL) {
        var url = this.canonicalizeURL(rawURL);
        this.componentDAO.find(url, {
          error: function(url) {
            this.ComponentBuilder.create(
                {},
                this.Y.sub({
                  controller: this,
                  comp: this.Component.create({ url: url })
                }));
            this.loadComponent(url);
          }.bind(this, url)
        });
      }
    },
    {
      name: 'loadComponent',
      code: function(url) {
        if (  this.document.querySelector('link[href="' + url + '"]') ) return;
        var link = this.document.createElement('link');
        link.setAttribute('rel', 'import');
        link.setAttribute('href', url);
        document.head.appendChild(link);
      }
    }
  ],

  actions: [
    {
      name: 'registerComponents',
      code: function() {
        this.componentsToRegister.forEach(this.registerComponent.bind(this));
        this.componentsToRegister = [];
      }
    }
  ]
});
