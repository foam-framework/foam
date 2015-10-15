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
  name: 'AddBookmarkDialog',
  package: 'foam.lib.bookmarks',

  extends: 'foam.ui.DetailView',

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao'
    }
  ],

  actions: [
    {
      name: 'add',
      help: 'Add Bookmark (Ctrl-A)',
      isEnabled: function() { return this.data.title; },
      code: function () {
        this.$.remove();
        this.dao.put(this.data);
      }
    },
    {
      name: 'cancel',
      help: 'Cancel (Ctrl-C)',
      code: function () { this.$.remove(); }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      this.titleView.focus();
    }
  },

  templates: [
    function toHTML() {/*
      <div id="%%id" class="LinkDialog" style="position:absolute">
        <table><tr>
        <th>Text</th><td>$$title{onKeyMode: true}</td></tr><tr>
        <th>Link</th><td>$$url</td>
        <tr><td colspan=2 align=right>$$add $$cancel</td>
        </tr></table>
      </div>
    */}
  ]
});
