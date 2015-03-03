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
  name: 'QIssueCommentView',
  package: 'foam.apps.quickbug.ui',
  extendsModel: 'foam.ui.DetailView',

  requires: [
    'foam.apps.quickbug.ui.QIssueComment',
    'foam.apps.quickbug.ui.IssueLink'
  ],

  imports: [
    'browser'
  ],

  properties: [
    { name: 'model', factory: function() { return this.QIssueComment; } }
  ],

  methods: {
    init: function() {
      this.data$.addListener(this.newData);
      this.newData();
      this.SUPER();
    },
    destroy: function() {
      this.data = '';
      this.data$.removeListener(this.newData);
    }
  },

  listeners: [
    {
      name: 'newData'
      code: function(src, topic, old, nu) {
        if ( old ) old.removeListener(this.update);
        if ( nu ) nu.addListener(this.update);
      }
    },
    {
      name: 'update',
      code: function() {
        if ( this.$ && this.data === 0 ) {
          this.$.style.borderTop = 'none';
        }
      }
    }
  ],

  templates: [ { name: 'toHTML' } ]
});
