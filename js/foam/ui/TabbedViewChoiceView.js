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
  name: 'TabbedViewChoiceView',
  extends: 'foam.ui.DetailView',
  requires: [
    'foam.ui.md.HaloView',
  ],
  help: 'A view that typically takes a ViewChoiceController and renders the ' +
      'labels of the ViewChoices as tabs and highlights the selected choice.',
  properties: [
    {
      name: 'className',
      defaultValue: 'TabbedViewChoiceView',
    },
    {
      name: 'preferredHeight',
      defaultValue: 54,
    },
  ],
  methods: {
    setCurrentLinePosition: function() {
      var line = document.getElementById(this.id + '-line');
      var selectedElement = this.$ && this.$.children[this.data.choice];
      if (line && selectedElement) {
        line.style.left = selectedElement.offsetLeft;
        line.style.width = selectedElement.offsetWidth + 'px';
      }
    },
    initHTML: function() {
      this.SUPER();
      this.setCurrentLinePosition();
      var self = this;
      var destructor = Events.dynamicFn(
          function() { self.data.choice; },
          this.setCurrentLinePosition.bind(this));
      this.addDestructor(destructor.destroy.bind(destructor));
      this.preferredHeight = this.$.clientHeight;
    },
  },
  templates: [
    function CSS() {/*
      .TabbedViewChoiceView {
        white-space: nowrap;
        background-color: #36474F;
      }
      .TabbedViewChoiceView .item:hover,
      .TabbedViewChoiceView .item.item-selected {
        color: white;
      }
      .TabbedViewChoiceView .item {
        -webkit-user-select: none;
        color: #B2B8BB;
        cursor: pointer;
        display: inline-block;
        padding: 20px;
        position: relative;
      }
      .TabbedViewChoiceView .line-container {
        height: 3px;
      }
      .TabbedViewChoiceView .line {
        background-color: #00A7F2;
        display: inline-block;
        height: 100%;
        position: relative;
        transition: left 0.5s cubic-bezier(0.35, 0, 0.25, 1), width 0.225s cubic-bezier(0.35, 0, 0.25, 1);
      }
      .TabbedViewChoiceView .halo {
        position: absolute;
        left: 0;
        top: 0;
      }
    */},
    function choiceButton(_, i, choice) {/*
      <%
        var id = this.on('click', function() { self.data.choice = i; });
        this.setClass('item-selected', function() {
          return self.data.choice == i;
        }, id);
      %>
      <div id="<%= id %>" class="item">
        <%= choice.label.toUpperCase() %>
        <%= this.HaloView.create({
          className: 'halo',
          color: 'rgb(241, 250, 65)',
          finishAlpha: 0,
          pressedAlpha: 0.2,
          recentering: false,
          startAlpha: 0.2,
        }) %>
      </div>
    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <% for ( var i = 0, choice; choice = this.data.views[i]; i++ ) {
             this.choiceButton(out, i, choice);
         } %>
        <div class='line-container'>
          <span class="line" id="%%id-line"></span>
        </div>
      </div>
    */}
  ]
});
