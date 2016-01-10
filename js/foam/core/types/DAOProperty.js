/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  package: 'foam.core.types',

  name: 'DAOProperty',

  extends: 'Property',

  requires: ['foam.dao.FutureDAO', 'foam.dao.ProxyDAO'],
  imports: ['console'],

  help: "Describes a DAO property.",

  properties: [
    {
      name: 'type',
      defaultValue: 'DAO',
      help: 'The FOAM type of this property.'
    },
    {
      type: 'Model',
      name: 'model',
      help: 'The model for objects stored in the DAO.'
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.DAOListView'
    },
    {
//      type: 'Function',
      name: 'onDAOUpdate'
    },
    {
      name: 'install',
      defaultValue: function(prop) {
        defineLazyProperty(this, prop.name + '$Proxy', function() {
          if ( ! this[prop.name] ) {
            var future = afuture();
            var delegate = prop.FutureDAO.create({
              future: future.get
            });
          } else
            delegate = this[prop.name];

          var proxy = prop.ProxyDAO.create({delegate: delegate});

          this.addPropertyListener(prop.name, function(_, __, ___, dao) {
            if ( future ) {
              future.set(dao);
              future = null;
              return;
            }
            proxy.delegate = dao;
          });

          return {
            get: function() { return proxy; },
            configurable: true
          };
        });
      }
    },
    {
      name: 'fromElement_',
      defaultValue: function(e, p, model) {
          var children = e.children;
          for ( var i = 0 ; i < children.length ; i++ ) {
            this[p.name].put(model.create(null, this.Y).fromElement(
                children[i], p));
          }
      }
    },
    {
      name: 'fromElement',
      defaultValue: function(e, p) {
        var model = e.getAttribute('model') ||
            (this[p.name] && this[p.name].model) || p.model || '';
        if ( ! model ) {
          this.console.warn('Attempt to load DAO from element without model');
          return;
        }
        if ( typeof model === 'string' ) {
          this.X.arequire(model)(function(model) {
            p.fromElement_.call(this, e, p, model);
          }.bind(this));
        } else {
          p.fromElement_.call(this, e, p, model);
        }
      }
    }
  ]
});
