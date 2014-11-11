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

MODEL({
  name: 'AppController',

  requires: [
    'DAOListView',
    'PopupChoiceView',
    'PredicatedView',
    'ScrollView',
    'SwipeAltView',
    'ViewChoice'
  ],

  exports: [
    'ActionButton'
  ],

  properties: [
    {
      name: 'model'
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
      factory: function() {
        if ( ! this.sortChoices ) return '';
        return this.PopupChoiceView({
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
      model_: 'DAOProperty',
      help: 'Top-level filtered DAO. Further filtered by each canned query.'
    },
    {
      name: 'queryParser',
      factory: function() { return QueryParserFactory(this.model); }
    },
    {
      model_: 'BooleanProperty',
      name: 'editableCitationViews',
      defaultValue: false,
      help: 'True if you want to allow the citation views to be editable.'
    },
    {
      name: 'filteredDAOView',
      factory: function() {
        var DAOListView = this.ScrollView.xbind({
          model: this.model,
          mode: this.editableCitationViews ? 'read-write' : 'read-only',
          rowView: this.citationView,
          runway: 500
        });

        if ( ! this.filterChoices ) return DAOListView.create({ dao: this.filteredDAO$Proxy });
        var self = this;
        var views = this.filterChoices.map(function(filter) {
            return self.ViewChoice({
              view: self.PredicatedView({
                predicate: ( typeof filter[0] === "string" ?
                             self.queryParser.parseString(filter[0]) :
                             filter[0] ) || TRUE,
                dao: self.filteredDAO$Proxy,
                view: DAOListView.create()
              }),

              label: filter[1]
            });
          });

        return this.SwipeAltView({ views: views });
      }
    },
    {
      model_: 'BooleanProperty',
      defaultValue: false,
      name: 'searchMode'
    },
    {
      name: 'q',
      displayWidth: 25,
      view: {factory_: 'TextFieldView', type: 'search', onKeyMode: true, placeholder: 'Search'} // TODO: change placeholder?
    },
    {
      model_: 'FunctionProperty',
      name: 'menuFactory'
    },
    {
      name: 'createAction',
      type: 'Action'
    },
    {
      name: 'ActionButton',
      factory: function() {
        return ActionButtonCView.xbind({
          alpha:      1,
          width:      48,
          height:     44,
          iconWidth:  24,
          iconHeight: 24
        });
      }
    }
  ],
  actions: [
    {
      name: 'menu',
      iconUrl: 'images/ic_menu_24dp.png',
      label: '',
      action: function() {
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
      action: function() {
        this.previousQuery = this.q;
        this.searchMode = true;
      }
    },
    {
      name: 'leaveSearchMode',
      iconUrl: 'images/ic_arrow_back_24dp.png',
      label: '',
      action: function() {
        this.q = this.previousQuery;
        this.searchMode = false;
      }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      Events.dynamic(
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
    <div id="<%= this.setClass('searchMode', function() { return self.data.searchMode; }, this.id) %>"  class="mdui-app-controller">
       <div class="header">
         <span class="default">
           $$menu
           $$name{mode: 'read-only', className: 'name'} $$enterSearchMode %%data.sortOrderView
         </span>
         <span class="search">
           $$leaveSearchMode{className: 'backButton'} $$q
         </span>
       </div>
       %%data.filteredDAOView
       <% if ( this.data.createAction ) out(this.createActionView(this.data.createAction, { data: this.data, className: 'createButton', color: 'white', font: '30px Roboto Arial', alpha: 1, width: 44, height: 44, radius: 22, background: '#e51c23'})); %>
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
  */},
    function CSS() {/*
      body { background: white; }
   */}
  ]
});


MODEL({
  name: 'PositionedAppControllerView',
  traits: ['PositionedDOMViewTrait'],
  extendsModel: 'DetailView',

  requires: [ 'CanvasScrollView', ],
  properties: [
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamic(function() { self.width; self.height; }, this.layout);
    },
    toInnerHTML: function() {
      this.destroy();
      var out = "";
      var renderer = FOAM.lookup(this.data.citationRenderer, this.X);

      var view = this.filteredDAOView = this.CanvasScrollView({
        dao: this.data.filteredDAO$Proxy,
        renderer: renderer.create({})
      });
      view = view.toPositionedView_();
      out += view.toHTML();
      this.addChild(view);
      return out;
    },
    initHTML: function() {
      this.SUPER();
      this.layout();
    }
  },

  listeners: [
    {
      name: 'layout',
      code: function() {
        if ( ! this.$ ) return;

        var children = this.children;
        var count = children.length;
        children[0].x = 0;
        children[0].y = 0;
        children[0].z = 0;
        children[0].width = this.width;
        children[0].height = this.height;
      }
    }
  ]
});
