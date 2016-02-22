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
  name: 'AppController',

  traits: ['foam.ui.CSSLoaderTrait'],

  requires: [
    'foam.graphics.ActionButtonCView',
    'foam.ui.md.SharedStyles',
    'foam.ui.DAOListView',
    'foam.ui.PopupChoiceView',
    'foam.ui.PredicatedView',
    'foam.ui.ScrollView',
    'foam.ui.SpinnerView',
    'foam.ui.SwipeAltView',
    'foam.ui.ViewChoice'
  ],

  properties: [
    {
      name: 'model'
    },
    {
      name: 'installStyles_',
      hidden: true,
      help: 'Forces the Material Design global CSS styles to be installed.',
      factory: function() { return this.SharedStyles.create() }
    },
    {
      name: 'name',
      defaultValueFn: function() { return this.model.plural; },
    },
    {
      name: 'dao'
    },
    {
      name: 'sortChoices',
      help: 'Possible sorting options for the view.'
    },
    {
      name: 'citationView',
      defaultValueFn: function() { return this.model.name + 'CitationView'; }
    },
    {
      name: 'citationRenderer',
      defaultValueFn: function() { return this.model.name + 'CitationRenderer'; }
    },
    {
      name: 'sortOrder',
      defaultValueFn: function() { return this.sortChoices ? this.sortChoices[0][0] : ''; }
    },
    {
      name: 'sortOrderView',
      lazyFactory: function() {
        if ( ! this.sortChoices ) return '';
        return this.PopupChoiceView.create({
          iconUrl: 'images/ic_sort_24dp.png',
          data$: this.sortOrder$,
          choices: this.sortChoices
        });
      }
    },
    {
      name: 'filterChoices'
    },
    {
      name: 'filteredDAO',
      model_: 'foam.core.types.DAOProperty',
      help: 'Top-level filtered DAO. Further filtered by each canned query.'
    },
    {
      name: 'queryParser',
      lazyFactory: function() { return QueryParserFactory(this.model); }
    },
    {
      type: 'Boolean',
      name: 'editableCitationViews',
      defaultValue: false,
      help: 'True if you want to allow the citation views to be editable.'
    },
    {
      name: 'filteredDAOView',
      lazyFactory: function() {
        var DAOListView = this.ScrollView.xbind({
          model: this.model,
          mode: this.editableCitationViews ? 'read-write' : 'read-only',
          rowView: this.citationView,
          runway: 500
        });

        if ( ! this.filterChoices ) return DAOListView.create({ dao: this.filteredDAO$Proxy });
        var self = this;
        var views = this.filterChoices.map(function(filter) {
            return self.ViewChoice.create({
              view: self.PredicatedView.create({
                predicate: ( typeof filter[0] === "string" ?
                             self.queryParser.parseString(filter[0]) :
                             filter[0] ) || TRUE,
                dao: self.filteredDAO$Proxy,
                view: DAOListView.create()
              }),

              label: filter[1]
            });
          });

        return this.SwipeAltView.create({ views: views });
      }
    },
    {
      type: 'Boolean',
      defaultValue: false,
      name: 'searchMode'
    },
    {
      name: 'q',
      displayWidth: 25,
      view: {factory_: 'foam.ui.TextFieldView', onKeyMode: true, placeholder: 'Search'} // TODO: change placeholder?
    },
    {
      type: 'Function',
      name: 'menuFactory'
    },
    {
      name: 'busyStatus',
      documentation: 'Controls the spinner in the header. If not set, the ' +
          'spinner element is excluded from the header.'
    },
    {
      name: 'spinner',
      factory: function() {
        if ( ! this.busyStatus ) return;
        return this.SpinnerView.create({
          data$: this.busyStatus.busy$,
          color: '#fff'
        });
      }
    },
    {
      name: 'refreshAction',
      type: 'Action'
    },
    {
      name: 'createAction',
      type: 'Action'
    },
//     {
//       name: 'ActionButton',
//       lazyFactory: function() {
//         return this.ActionButtonCView.xbind({
//           alpha:      1,
//           width:      48,
//           height:     44,
//           iconWidth:  24,
//           iconHeight: 24
//         });
//       }
//     }
  ],
  actions: [
    {
      name: 'menu',
      iconUrl: 'images/ic_menu_24dp.png',
      label: '',
      code: function() {
        this.X.stack.slideView(this.menuFactory());
      }
    },
    {
      name: 'previousQuery',
    },
    {
      name: 'enterSearchMode',
      iconUrl: 'images/ic_search_24dp.png',
      label: '',
      code: function() {
        this.previousQuery = this.q;
        this.searchMode = true;
      }
    },
    {
      name: 'leaveSearchMode',
      iconUrl: 'images/ic_arrow_back_24dp.png',
      label: '',
      code: function() {
        this.q = this.previousQuery;
        this.searchMode = false;
      }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();

      this.Y.registerModel(this.ActionButtonCView.xbind({
        alpha:      1,
        width:      48,
        height:     44,
        iconWidth:  24,
        iconHeight: 24
      }), 'foam.ui.ActionButton');

      var self = this;
      Events.dynamicFn(
        function() { self.sortOrder; self.q; },
        function() {
          var query = (self.queryParser.parseString(self.q) || TRUE).partialEval();
          self.filteredDAO = self.dao.where(query).orderBy(self.sortOrder);
        }
      );
    }
  },
  templates: [
    function toDetailHTML() {/*
    <div id="<%= this.id %>"  class="mdui-app-controller">
       <div class="header">
         <span class="default">
           $$menu
           $$name{mode: 'read-only', className: 'name'}
           <% if ( this.data.refreshAction ) { out(this.createActionView(this.data.refreshAction, { data: this.data})); } %>
           <% if ( this.data.spinner ) { %>
             <span class="mdui-app-controller-spinner">
               <%= this.data.spinner %>
             </span>
           <% } %>
           $$enterSearchMode{halo: ''} %%data.sortOrderView
         </span>
         <span class="search">
           $$leaveSearchMode{className: 'backButton', halo: ''} $$q
         </span>
       </div>
       %%data.filteredDAOView
       <% if ( this.data.createAction ) out(this.createActionView(this.data.createAction, { data: this.data, className: 'floatingActionButton', color: 'white', font: '30px Roboto Arial', alpha: 1, width: 44, height: 44, radius: 22, background: '#e51c23'})); %>
    </div>
    <%
      this.addInitializer(function() {
        if ( self.filterChoices ) {
          var v = self.data.filteredDAOView;
          v.index$.addListener(function() {
            self.qView.$.placeholder = "Search " + v.views[v.index].label.toLowerCase();
          });
        }
        self.data.searchMode$.addListener(function() {
          // The setClass() must be done manually from this context because:
          // 1. The AppController does not have access to its view (self).
          // 2. Setting the class first, then invoking self.qView.focus() must occur in the context
          //    of a mouseup/touchend handler in order for the virtual keyboard to appear correctly.
          DOM.setClass(self.X.$(self.id), 'searchMode', self.data.searchMode);
          if ( self.data.searchMode ) self.qView.focus();
        }, 100);
      });

      this.on('touchstart', function(){ self.qView.$ && self.qView.$.blur(); }, this.data.filteredDAOView.id);
      this.on('click', function(){ self.qView.focus(); }, this.qView.id);
    %>
  */},
    function CSS() {/*
      body { background: white; }

      .floatingView { background: white; }

      .mdui-app-controller-spinner {
        display: inline-block;
        height: 42px;
        width: 42px;
        overflow: hidden;
      }
      .mdui-app-controller-spinner .spinner-fixed-box {
        height: 26px;
        width: 26px;
      }
      .mdui-app-controller-spinner .spinner-circle {
        border-width: 3px;
      }
   */}
  ]
});
