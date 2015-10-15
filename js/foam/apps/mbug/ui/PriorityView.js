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
  name: 'PriorityView',
  package: 'foam.apps.mbug.ui',
  extends: 'foam.ui.View',
  properties: [
    { name: 'data', postSet: function() { this.updateHTML(); } },
    {
      name: 'map',
      defaultValue: {
        'Low': 3,
        'Medium': 2,
        'High': 1,
        'Critical': 0
      }
    }
  ],
  methods: {
    dataToPriority: function(data) {
      var numeric = parseInt(data);
      if ( ! Number.isNaN(numeric) ) return numeric;
      if ( this.map[data] !== undefined ) return this.map[data];
      if ( data ) console.warn('Unknown priority "' + data + '".');
      return 3;
    }
  },
  templates: [
    function toInnerHTML() {/*
      <div class="priority priority-<%= this.dataToPriority(this.data) %>">P<%= this.dataToPriority(this.data) %></div>
    */}
  ]
});
