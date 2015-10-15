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
  name: 'GSnippetMetadata',
  package: 'foam.navigator.views',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'data',
      factory: function() { return []; }
    }
  ],

  templates: [
    function toHTML() {/*
      <div class="gs-metadata">
        <% for ( var i = 0; i < this.data.length; ++i ) { %>
          <div class="gs-metadatum">
            <% if ( this.data[i].label ) { %>
              <span class="gs-label">{{ this.data[i].label }}</span>
            <% } %>
            <span>
              <% if ( this.data[i].view ) { %>
                {{{this.data[i].view}}}
              <% } else { %>
                <% if ( this.data[i].url ) { %><a href="{{{this.data[i].url}}}"><% } %>
                <% if ( this.data[i].text ) { %>{{{this.data[i].text}}}<% } %>
                <% if ( this.data[i].url ) { %></a><% } %>
              <% } %>
            </span>
          </div>
        <% } %>
      </div>
    */},
    function CSS() {/*
      div.gs-metadata {
        white-space: nowrap;
        line-height: 16px;
        display: block;
        font-weight: normal;
      }
      div.gs-metadata span {
        font-size: 14px;
        font-style: normal;
        color: #006621;
        white-space: nowrap;
        line-height: 16px;
        padding: 0px 4px 0px 0px;
      }
      div.gs-metadata span.gs-label {
        font-weight: bold;
      }
      div.gs-metadata a, div.gs-metadata a:link, div.gs-metadata a:visited {
        font-weight: bold;
        color: #006621;
      }
    */}
  ]
});
