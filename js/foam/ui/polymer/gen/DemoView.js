/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'DemoView',
  package: 'foam.ui.polymer.gen',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'data',
      postSet: function() {
        if ( this.data && this.data.create ) {
          this.instance = this.data.create({ content: 'Content' });
        }
      }
    },
    {
      name: 'instance',
      postSet: function() {
        if ( this.instance ) this.proxy = this.instance.proxy;
      }
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        var rtn = this.SUPER();
        this.instance.initHTML();
        return rtn;
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="{{{this.id}}}">
        <% if ( this.instance ) { %>
          <style>
            div.detailAndPreviewContainer {
              display: flex;
              justify-content: space-around;
              align-items: center;
              align-content: center;
            }
          </style>
          <div class="detailAndPreviewContainer">
            $$instance{ model_: 'foam.ui.DetailView' }
            <%= this.instance.toHTML() %>
          </div>
        <% } %>
      </div>
    */}
  ]
});
