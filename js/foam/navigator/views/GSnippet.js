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
  name: 'GSnippet',
  package: 'foam.navigator.views',
  extends: 'foam.ui.DetailView',

  requires: [
    'foam.navigator.views.GSnippetMetadata',
    'foam.navigator.views.GSnippetMetadatum'
  ],

  properties: [
    {
      name: 'url',
      defaultValue: '#'
    },
    {
      name: 'title',
      defaultValue: 'Default Text for a Title that May Happen to be Very Long'
    },
    {
      name: 'metadata',
      view: 'foam.navigator.views.GSnippetMetadata',
      defaultValueFn: function() {
        return [
          this.GSnippetMetadatum.create({ text: 'snippet' }),
          this.GSnippetMetadatum.create({
            text: 'FOAM Framework',
            url: 'https://github.com/foam-framework/foam' })
        ];
      }
    },
    {
      name: 'snippet',
      defaultValue: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="{{{this.id}}}" class="gsnippet">
        <span class="gs-type">
          <% if ( this.data.iconURL ) { %>
            <img src="{{{this.data.iconURL}}}">
          <% } else { %>
            <span>{{this.data.model_.label}}</span>
          <% } %>
        </span>
        <div class="gs-heading">
          <h3 class="gs-header">
            <a href="{{{this.url}}}">{{{this.title}}}</a>
          </h3>
        </div>
        $$metadata
        <div class="gs-snippet">
          {{{this.snippet}}}
        </div>
      </div>
    */},
    function CSS() {/*
      div.gsnippet {
        position: relative;
        margin-bottom: 25px;
      }
      div.gsnippet a {
        text-decoration: none;
      }
      div.gs-heading {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        align-content: center;
      }
      h3.gs-header {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 16px;
        font-weight: normal;
        margin: 0;
        padding: 0;
      }
      div.gs-header a:link {
        cursor: pointer;
        color: #1a0dab;
      }
      .gs-type {
        align-items: flex-start;
        color: #999;
        display:flex;
        float: left;
        justify-content: flex-end;
        margin-left: -80px;
        width: 70px;
        padding: 0px 5px 0px 0px;
      }
      h3.gs-header a:visited {
        color: #609;
      }
      div.gs-snippet {
        font-size: small;
        line-height: 1.4;
        word-wrap: break-word;
        font-weight: normal;
      }
    */}
  ]
});
