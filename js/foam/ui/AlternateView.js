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
  name: 'AlternateView',

  extends: 'foam.ui.View',

  properties: [
    'data',
    {
      name: 'dao',
      getter: function() { return this.data; },
      setter: function(dao) { this.data = dao; }
    },
    {
      type: 'Array',
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
      type: 'ViewFactory',
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
      name: 'mode',
      getter: function() { return this.choice.label; },
      setter: function(label) {
        for ( var i = 0 ; i < this.views.length ; i++ ) {
          if ( this.views[i].label === label ) {
            var oldValue = this.mode;

            this.choice = this.views[i];

            this.propertyChange('mode', oldValue, label);
            return;
          }
        }
      }
    },
    {
      type: 'ViewFactory',
      name: 'headerView',
      defaultValue: 'foam.ui.View'
    },
    {
      model_: 'foam.core.types.DOMElementProperty',
      name: 'viewContainer'
    }
  ],

  templates: [
    function choiceButton(_, i, length, choice) {/*<%
        var id = this.on('click', function() { self.choice = choice; });
        this.setClass('mode_button_active', function() { return self.choice === choice; }, id);
      %><a id="<%= id %>" class="buttonify<%= i == 0 ? ' capsule_left' : '' %><%=
                                              i == length - 1 ? ' capsule_right' : '' %>"><%= choice.label %></a>*/},
    function toHTML() {/*
      <div id="<%= this.id %>" class="AltViewOuter column" style="margin-bottom:5px;">
        <div class="altViewButtons rigid">
          <%= this.headerView() %>
          <% for ( var i = 0, choice; choice = this.views[i]; i++ ) {
               this.choiceButton(out, i, this.views.length, choice);
           } %>
        </div>
        <br/>
        <div class="altView column" id="<%= this.viewContainer = this.nextID() %>"><%= this.view({ data$: this.data$ }) %></div>
      </div>
    */}
  ]
});
