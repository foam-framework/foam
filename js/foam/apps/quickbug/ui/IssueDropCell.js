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
  name: 'IssueDropCell',
  package: 'foam.apps.quickbug.ui',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'data'
    },
    {
      name: 'dao',
      hidden: true
    },
    {
      type: 'Array',
      name: 'props'
    },
    {
      type: 'Array',
      name: 'values'
    }
  ],

  methods: {
    toHTML: function() {
      this.on('dragenter', this.onDragEnter, this.id);
      this.on('dragover', this.onDragEnter, this.id);
      this.on('drop', this.onDrop, this.id);
      return '<td id="' + this.id + '">' +
        (this.data ? (this.data.toHTML ? this.data.toHTML() : this.data) : '') + '</td>';
    },
    initHTML: function() {
      this.SUPER();
      this.data && this.data.initHTML && this.data.initHTML();
    },
    put: function(obj) {
      this.data.put(obj);
    }
  },

  listeners: [
    {
      name: 'onDragEnter',
      code: function(e) {
        for ( var i = 0; i < e.dataTransfer.types.length; i++ ) {
          if ( e.dataTransfer.types[i] === 'application/x-foam-id' ) {
            e.dataTransfer.dropEffect = "move";
            e.preventDefault();
            return;
          }
        }
      }
    },
    {
      name: 'onDrop',
      code: function(e) {
        var data = e.dataTransfer.getData('application/x-foam-id');
        if ( ! data ) return;

        e.preventDefault();

        var props = this.props;
        var values = this.values;
        var dao = this.dao;
        dao.find(data, {
          put: function(obj) {
            obj = obj.clone();
            for ( var i = 0; i < props.length; i++ ) {
              var p = props[i];
              var v = values[i];
              obj[p.name] = v;
            }
            dao.put(obj);
          }
        });
      }
    }
  ]
});
