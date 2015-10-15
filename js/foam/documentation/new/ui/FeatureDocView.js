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
  package: 'foam.documentation.new.ui',
  name: 'FeatureDocView',
  extends: 'foam.ui.View',
  templates: [
    function toHTML() {/*
      <div id="<%= this.id %>" class="doc-feature doc-property">
        <h4><%= this.data.name %></h4>
        <div class="doc-feature-inheritance">
          Inherited from <% this.sourceHTML(out) %>
        </div>
        <div class="doc-feature-documentation">
          <%= this.data.feature.documentation %>
        </div>
      </div>
    */},
    function sourceHTML() {/*
      blah blah
    */},
  ],
});
