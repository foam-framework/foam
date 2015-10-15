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
  name: 'CitationView',
  package: 'foam.apps.mbug.ui',
  extends: 'foam.ui.SimpleView',

  requires: [ 'foam.ui.md.MonogramStringView' ],

  properties: [
    { name: 'prop' },
    { name: 'tagName', defaultValue: 'div' },
    { name: 'className', defaultValue: 'CitationView' },
    { name: 'data', postSet: function() { this.updateHTML(); } }
  ],

  actions: [
    {
      name: 'clear',
      label: '',
      iconUrl: 'images/ic_clear_black_24dp.png',
      code: function() { 
        this.data = ""; // buganizer api doesn't support resetting owner 
      }
    }
  ],
  
  templates: [
    function CSS() {/*
      .CitationView {
        padding: 0 0 0 16px;
      }

      .CitationView .contents {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #575757;
      }

      .CitationView .label {
        color: #999;
        font-size: 14px;
        padding-bottom: 12px;
        font-weight: 500;
      }
    */},
    function toInnerHTML() {/*
      <div class="label"><%= escapeHTML(this.prop.label) %></div>
      <div class="contents">
        <%= this.MonogramStringView.create({ data: this.data }) %>
        <div class="owner-name">{{ this.data }}</div>
      </div>
    */}
//      <span class="removeRow">$$clear</span>
  ]
});
