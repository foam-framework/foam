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
  package: 'foam.tutorials.phonecat.crawlable',
  name: 'CrawlableDetailView',
  imports: [ 'applicationURL', 'applicationIdURL' ],
  extends: 'foam.ui.DetailView',
  properties: [
    { name: 'title', defaultValueFn: function() { return this.model.label; } }
  ],
  methods: {
    rowToHTML: function(prop, view) {
      var str = '';
      var val = this.data[prop.name]

      if ( ! val ) return '';

      view.mode = 'read-only';

      str += '<tr>';
      str += "<td class='label'>" + prop.label + ": </td>";
      str += '<td>';
      if ( prop.name === 'id' ) {
        str += '<a href="' + this.applicationIdURL + val + '">' + val + '</a>';
      } else if ( typeof val === 'object' ) {
        str += JSONUtil.stringify(val);
      } else {
        str += val;
      }
      str += '</td>';
      str += '</tr>';

      return str;
    }
  }
});
