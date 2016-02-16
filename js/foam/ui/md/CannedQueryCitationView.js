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
  package: 'foam.ui.md',
  name: 'CannedQueryCitationView',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'className',
      defaultValueFn: function() {
        return 'canned-query-citation' +
            (this.data.iconUrl ? ' canned-query-icon' : '');
      }
    }
  ],
  templates: [
    function CSS() {/*
      .canned-query-citation {
        align-items: center;
        display: flex;
        font-size: 16px;
        height: 42px;
        line-height: 42px;
        padding: 8px 16px;
      }
      .canned-query-citation img {
        flex-grow: 0;
        flex-shrink: 0;
        height: 24px;
        margin-right: 25px;
        opacity: 0.6;
        width: 24px;
      }
      .canned-query-label {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <% if (this.data.iconUrl) { %>
          $$iconUrl
        <% } %>
        $$label{ mode: 'read-only', floatingLabel: false, extraClassName: 'canned-query-label' }
      </div>
    */}
  ]
});
