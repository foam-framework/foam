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
  package: 'foam.tutorials.phonecat.ui',
  name: 'PhoneCitationView',
  extends: 'foam.ui.DetailView',
  templates: [
    function toHTML() {/*
      <li id="<%= this.id %>" class="thumbnail">
        <a href="javascript:" class="thumb">$$imageUrl</a>
        <a href="javascript:">$$name{mode: 'read-only'}</a>
        <p>$$snippet{mode: 'read-only'}</p>
      </li>
      <% this.on('click', function() { document.location.hash = '#' + self.data.id; }, this.id) %>
    */}
  ]
});
