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
  name: 'PersonView',
  package: 'foam.apps.mbug.ui',
  requires: [
    'foam.ui.md.MonogramStringView'
  ],
  extends: 'foam.ui.DetailView',
  templates: [
    function CSS() {/*
.PersonView {
  padding: 12px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #575757;
}
*/},
    function toHTML() {/*
      <div id="%%id" class="PersonView">
        $$name{model_: 'foam.ui.md.MonogramStringView'}
        <div class="owner-name">{{ this.data.name }}</div>
      </div>
  */} ]
});
