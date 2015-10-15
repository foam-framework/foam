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
  name: 'PhoneGSnippet',
  package: 'foam.navigator.views',
  extends: 'foam.navigator.views.GSnippet',

  requires: [
    'foam.navigator.views.GSnippetMetadata',
    'foam.navigator.views.GSnippetMetadatum'
  ],

  properties: [
    {
      name: 'title',
      lazyFactory: function() {
        return this.data && this.data.name || 'Phone';
      }
    },
    {
      name: 'url',
      lazyFactory: function() {
        return '/apps/phonecat/Cat.html#' + this.data.id.split(':')[1];
      }
    },
    {
      name: 'metadata',
      view: 'foam.navigator.views.GSnippetMetadata',
      lazyFactory: function() {
        return [
          this.GSnippetMetadatum.create({ label: 'CPU', text: this.data.hardware.cpu }),
          this.GSnippetMetadatum.create({ label: 'Screen', text: this.data.display.screenSize}),
          this.GSnippetMetadatum.create({ label: 'OS', text: this.data.android.os })
        ];
      }
    },
    {
      name: 'snippet',
      lazyFactory: function() {
        return this.data.description;
      }
    }
  ],
  
  templates: [
    function toHTML() {/*
      <div id="{{{this.id}}}" class="gsnippet">
        <span class="gs-type">
          <% if ( this.data.imageUrl ) { %>
            <img src="/apps/phonecat/{{{this.data.imageUrl}}}" width=40 height=40 />
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
    */}
  ]
});
