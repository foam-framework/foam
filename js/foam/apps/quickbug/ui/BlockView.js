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
  name: 'BlockView',
  package: 'foam.apps.quickbug.ui',
  extends: 'foam.ui.View',

  requires: [
    'foam.apps.quickbug.ui.IssueLink'
  ],

  imports: [
    'issueDAO'
  ],

  properties: [
    {
      name: 'property',
      help: 'Property to recurse on.'
    },
    {
      name: 'idSet',
      help: "Set of Issue ID's that have already been seen.",
      factory: function() { return {}; }
    },
    {
      name: 'maxDepth',
      defaultValue: 3
    },
    {
      name: 'ids'
    }
  ],

  methods: {
    toHTML: function(opt_depth) {
      var s = '<div class="blockList">';

      for ( var i = 0 ; i < this.ids.length ; i++ ) {
        var issue = this.ids[i];
        var view = this.IssueLink.create({
          issue: issue,
          property: this.property,
          maxDepth: this.maxDepth
        });

        s += '<div>' + view.toHTML() + '</div>'
        this.addChild(view);
      }

      s += '</div>';

      return s;
    }
  }
});
