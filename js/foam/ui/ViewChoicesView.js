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
  package: 'foam.ui',
  name: 'ViewChoicesView',
  extends: 'foam.ui.DetailView',

  // TODO(mcarcaso): Make the TwoPaneView use this.
  help: 'A view that typically takes a ViewChoiceController and renders the ' +
      'labels of the ViewChoices and highlights the selected choice.',

  templates: [
    function CSS() {/*
      .viewchoiceview-item-selected {
        color: #00A7F2;
      }
      .viewchoiceview-item {
        padding: 20px;
        cursor: pointer;
        -webkit-user-select: none;
      }
      .viewchoiceview-item:hover {
        color: #00A7F2;
      }
    */},
    function choiceButton(_, i, length, choice) {/*
      <%
        var id = this.on('click', function() { self.data.choice = i; });
        this.setClass('viewchoiceview-item-selected', function() {
          return self.data.choice === i;
        }, id);
      %>
      <div id="<%= id %>" class="viewchoiceview-item"><%= choice.label %></div>
    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <% for ( var i = 0, choice; choice = this.data.views[i]; i++ ) {
             this.choiceButton(out, i, this.data.views.length, choice);
         } %>
      </div>
    */}
  ]
});
