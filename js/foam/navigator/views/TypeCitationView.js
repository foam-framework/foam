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
  name: 'TypeCitationView',
  package: 'foam.navigator.views',
  extends: 'foam.ui.DetailView',
  properties: [
    {
      name: 'className',
      defaultValue: 'type-citation-view'
    }
  ],
  templates: [
    function CSS() {/*
      .type-citation-view {
        align-items: center;
        border-bottom: 1px solid black;
        display: flex;
        height: 40px;
        line-height: 40px;
        min-width: 300px;
        font-size: 18px;
      }
      .type-citation-view span {
        flex-grow: 1;
      }
      .type-citation-view .arrow {
        flex-grow: 0;
        flex-shrink: 0;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        $$name{ mode: 'read-only' }
        <span class="arrow">&gt;</span>
      </div>
    */}
  ]
});
