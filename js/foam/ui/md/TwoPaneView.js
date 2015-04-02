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
  name: 'TwoPaneView',
  package: 'foam.ui.md',

  extendsModel: 'foam.ui.View',

  properties: [
    {
      model_: 'ArrayProperty',
      name: 'views',
      subType: 'foam.ui.ViewChoice',
      help: 'View choices.'
    },
    {
      name: 'choice',
      postSet: function(_, v) {
        this.view = v.view;
      },
      hidden: true
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'view',
      defaultValue: 'foam.ui.View',
      postSet: function(old, v) {
        if ( ! this.$ ) return;
        this.removeAllChildren();
        var view = this.view();
        view.data = this.data;
        this.addChild(view);
        this.viewContainer.innerHTML = view.toHTML();
        view.initHTML();
      },
      hidden: true
    },
    {
      model_: 'foam.core.types.DOMElementProperty',
      name: 'viewContainer'
    },
    {
      name: 'className',
      defaultValue: 'twopane-container'
    },
  ],

  methods: {
    init: function() {
      this.SUPER();
    }
  },

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
        var id = this.on('click', function() { self.choice = choice; });
        this.setClass('twopane-left-item-selected', function() { return self.choice === choice; }, id);
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
        <div class="twopane-right" id="<%= this.viewContainer = this.nextID() %>"><%= this.view({ data$: this.data$ }) %></div>
      </div>
    */}
  ]
});
