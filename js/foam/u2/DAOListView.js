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
    'foam.u2.md.CitationView'
  ],

  constants: {
    ROW_CLICK: ['row-click']
  },

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'data',
      postSet: function(_, d) { this.dao = d; }
    },
    {
      // Separate from data so it can be a DAOProperty.
      model_: 'foam.core.types.DAOProperty',
      name: 'dao'
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
      type: 'ViewFactory',
      name: 'rowView'
    },
    {
      name: 'rows',
      factory: function() {
        return {};
      }
    },
    ['nodeName', 'div']
  ],

  methods: [
    function initE() {
      this.dao$Proxy.pipe(this.daoListener_);
      this.cls(this.myCls());
    }
  ],

  listeners: [
    function onDAOPut(obj) {
      if ( this.rows[obj.id] ) {
        this.rows[obj.id].data = obj;
        return;
      }
      
      var Y = this.Y.sub({ data: obj });
      
      var child = this.rowView ?
        this.rowView({ data: obj }, Y) :
        obj.toRowE ? obj.toRowE(Y) :
        obj.toE ? obj.toE(Y) :
        this.CitationView.create({ data: obj }, Y);
      
      child.on('click', function() {
        this.publish(this.ROW_CLICK, obj);
      }.bind(this));

      this.rows[obj.id] = child;
      this.add(child);
    },
    function onDAORemove(obj) {
      if ( this.rows[obj.id] ) {
        this.removeChild(this.rows[obj.id]);
        delete this.rows[obj.id];
      }
    },
    function onDAOReset(obj) {
      this.removeAllChildren();
      this.rows = {};
      this.dao.select(this.daoListener_);
    }
  ]
});
