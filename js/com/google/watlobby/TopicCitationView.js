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
  package: 'com.google.watlobby',
  name: 'TopicCitationView',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.ColorPickerView',
    'foam.ui.ImageView'
  ],

  properties: [
    [ 'className', 'topic-citation' ]
  ],

  templates: [
    function CSS() {/*
      .topic-citation {
        align-items: center;
        border-bottom: center;
        display: flex;
        min-height: 48px;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
         $$enabled{ label: '' }
        <span id="<%= this.setStyle('background', function() { return this.data.background; }) %>" class="image-background">$$image{model_: 'foam.ui.ImageView', mode: 'read-only', displayWidth: 40, displayHeight: 40}</span>
        <span style="margin-left: 30px; margin-right: -10px;">Priority</span> $$priority{model_: 'foam.ui.TextFieldView', mode: 'read-only', floatingLabel: false}
        <span style="width: 120px;">$$model{model_: 'foam.ui.TextFieldView', mode: 'read-only', floatingLabel: false}</span>
        $$topic{mode: 'read-only', floatingLabel: false}
      </div>
    */},
  ]
});
