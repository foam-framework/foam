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
  package: 'foam.ui.md',
  name: 'TwoPaneView',

  extends: 'foam.ui.View',

  properties: [
    {
      type: 'Array',
      name: 'views',
      singular: 'view',
      subType: 'foam.ui.ViewChoice',
      help: 'View choices.',
      postSet: function() { this.choice = this.choice; }
    },
    {
      type: 'Int',
      name: 'choice',
      preSet: function(_, c) {
        return Math.max(0, Math.min(c, this.views.length));
      },
      postSet: function(_, c) {
        if ( this.views.length ) {
          this.view = this.views[c].view();
          this.view.data = this.data;
        }
      }
    },
    {
      name: 'viewChoice',
      model: 'foam.ui.ViewChoice',
      getter: function() {
        return this.views[this.choice];
      },
    },
    {
      name: 'view',
      postSet: function() {
        if ( ! this.$ ) return;
        this.destroy();
        this.$.outerHTML = this.toHTML();
        this.initHTML();
      },
      hidden: true
    },
    {
      name: 'className',
      defaultValue: 'twopane-container'
    },
  ],

  templates: [
    function CSS() {/*
      .twopane-container {
        display: flex;
        background-color: #EEEEEE;
      }
      .twopane-left {
        width: 200px;
      }
      .twopane-right {
        flex-grow: 1;
      }
      .twopane-left-item-selected {
        color: #00A7F2;
      }
      .twopane-left-item {
        padding: 20px;
        cursor: pointer;
        -webkit-user-select: none;
      }
      .twopane-left-item:hover {
        color: #00A7F2;
      }
    */},
    function choiceButton(_, i, length, choice) {/*
      <%
        var id = this.on('click', function() { self.choice = i; });
        this.setClass('twopane-left-item-selected', function() { return self.choice == i; }, id);
      %>
      <div id="<%= id %>" class="twopane-left-item"><%= choice.label %></div>
    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class='twopane-left'>
          <% for ( var i = 0, choice; choice = this.views[i]; i++ ) {
               this.choiceButton(out, i, this.views.length, choice);
           } %>
        </div>
        <div class="twopane-right"><%= this.view %></div>
      </div>
    */}
  ]
});
