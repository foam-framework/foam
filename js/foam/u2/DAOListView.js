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
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.DetailView'
  ],
  properties: [
    {
      name: 'data'
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
    function init() {
      this.SUPER();

      this.cls('foam-u2-DAOListView');
      this.data.pipe(this.daoListener_);
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
            obj.toE() :
            this.DetailView.create({ data: obj });
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
      }
    }
  ]
});
