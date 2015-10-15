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
  name: 'QIssueLabelsView',
  package: 'foam.apps.quickbug.ui',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'data',
      postSet: function() { this.update(); }
    }
  ],

  methods: {
    toHTML: function() { return '<div id="' + this.id + '"></div>'; },
    initHTML: function() { this.SUPER(); this.update(); }
  },

  listeners: [
    {
      name: 'update',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;

        var value = this.data.sort(function (o1, o2) {
          return o1.toLowerCase().compareTo(o2.toLowerCase());
        });
        var out = "";
        for ( var i = 0; i < value.length; i++ ) {
          var start = value[i].substring(0, value[i].indexOf('-') + 1);
          var rest  = value[i].substring(value[i].indexOf('-') + 1);

          if ( start != 'Restrict-' ) {
            out += '<div><b>' +
              this.strToHTML(start) + '</b>' +
              this.strToHTML(rest) + '</div>';
          }
        }
        this.$.innerHTML = out;
      }
    }
  ]
});
