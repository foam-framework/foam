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
  package: 'foam.ui.md',
  name: 'TwoPane',
  requires: [
    'foam.ui.layout.DOMPanel'
  ],
  extends: 'foam.ui.DetailView',
  properties: [
    { type: 'Model', name: 'model', defaultValue: 'AppController' }
  ],
  templates: [
    function CSS() {/*
      .panes {
      display: flex;
      }
      .right-pane {
        flex-grow: 1;
      }
      .left-pane {
        display: flex;
        flex-direction: column;
        width: 300px;
      }
    */},
    function toHTML() {/*
    <div id="<%= this.setClass('searchMode', function() { return self.data.searchMode; }, this.id) %>"  class="mdui-app-controller">
       <div class="header">
         <span class="default">
           $$name{mode: 'read-only', className: 'name'}
           <% if ( this.data.refreshAction ) { out(this.createActionView(this.data.refreshAction, { data: this.data })); } %>
           <% if ( this.data.spinner ) { %>
             <span class="mdui-app-controller-spinner">
               <%= this.data.spinner %>
             </span>
           <% } %>
           $$enterSearchMode %%data.sortOrderView
         </span>
         <span class="search">
           $$leaveSearchMode{className: 'backButton'} $$q
         </span>
       </div>
       <div class="panes">
         <%= this.DOMPanel.create({ className: 'left-pane', data: this.data.menuFactory() }) %>
         <div class="right-pane">
           %%data.filteredDAOView
           <% if ( this.data.createAction ) out(this.createActionView(this.data.createAction, { data: this.data, className: 'floatingActionButton', color: 'white', font: '30px Roboto Arial', alpha: 1, width: 44, height: 44, radius: 22, background: '#e51c23'})); %>
         </div>
       </div>
    </div>
    <%
      this.addInitializer(function() {
        if ( self.filterChoices ) {
          var v = self.data.filteredDAOView;
          v.index$.addListener(function() {
            self.qView.$.placeholder = "Search " + v.views[v.index].label.toLowerCase();
          });
        }
        self.data.searchMode$.addListener(EventService.merged(function() {
          self.qView.$.focus();
        }, 100));
      });

      this.on('touchstart', function(){ console.log('blurring'); self.qView.$.blur(); }, this.data.filteredDAOView.id);
      this.on('click', function(){ console.log('focusing'); self.qView.$.focus(); }, this.qView.id);
    %>
    */}
  ]
});
