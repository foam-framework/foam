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
  package: 'foam.u2',
  name: 'DAOListView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.DetailView'
  ],
  imports: [
    'selection$',
  ],

  constants: {
    ROW_CLICK: ['row-click'],
  },

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'data',
      postSet: function(old, nu) {
        this.dao = nu;
      },
    },
    {
      // Separate from data so it can be a DAOProperty.
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
    },
    {
      name: 'daoListener_',
      lazyFactory: function() {
        return {
          put: this.onDAOPut,
          remove: this.onDAORemove,
          reset: this.onDAOReset
        };
      }
    },
    {
      name: 'rowView',
      defaultValue: function(args, opt_X) {
        return this.DetailView.create(args, opt_X || this.Y);
      }
    },
    {
      name: 'rows',
      factory: function() {
        return {};
      }
    },
    ['nodeName', 'div']
  ],
  templates: [
    function CSS() {/*
      .foam-u2-DAOListView {
      }
    */}
  ],
  methods: [
    function initE() {
      this.dao$Proxy.pipe(this.daoListener_);
      this.cls('foam-u2-DAOListView');
    },
  ],
  listeners: [
    {
      name: 'onDAOPut',
      code: function(obj) {
        if ( this.rows[obj.id] ) {
          this.rows[obj.id].data = obj;
          return;
        }

        var child = obj.toE ?
            obj.toE(this.Y) :
            obj.toRowE ? obj.toRowE(this.Y) :
            this.rowView({ data: obj });

        child.on('click', function() {
          this.publish(this.ROW_CLICK);
          this.selection = obj;
        }.bind(this));

        this.rows[obj.id] = child;
        this.add(child);
      }
    },
    {
      name: 'onDAORemove',
      code: function(obj) {
        if ( this.rows[obj.id] ) {
          this.removeChild(this.rows[obj.id]);
          delete this.rows[obj.id];
        }
      }
    },
    {
      name: 'onDAOReset',
      code: function(obj) {
        this.removeAllChildren();
        this.rows = {};
        this.dao.select(this.daoListener_);
      }
    }
  ]
});
