CLASS({
  package: 'foam.ui.md',
  name: 'TwoPane',
  requires: [
    'DOMPanel'
  ],
  extendsModel: 'DetailView',
  properties: [
    { model_: 'ModelProperty', name: 'model', defaultValue: 'AppController' }
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
         <%= this.DOMPanel.create({ className: 'left-pane', view: this.data.menuFactory() }) %>
         <div class="right-pane">
           %%data.filteredDAOView
           <% if ( this.data.createAction ) out(this.createActionView(this.data.createAction, { data: this.data, className: 'createButton', color: 'white', font: '30px Roboto Arial', alpha: 1, width: 44, height: 44, radius: 22, background: '#e51c23'})); %>
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
