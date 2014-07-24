MODEL({
  name: 'AppController',

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
      name: 'sortOrder',
      defaultValueFn: function() { return this.sortChoices ? this.sortChoices[0][0] : ''; }
    },
    {
      name: 'sortOrderView',
      factory: function() {
        if ( ! this.sortChoices ) return '';
        return this.X.PopupChoiceView.create({
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
        var DAOListView = this.X.DAOListView.xbind({
          dao: this.filteredDAO$.asDAO(),
          mode: this.editableCitationViews ? 'read-write' : 'read-only',
          rowView: this.citationView,
          chunkSize: 15
        });

        if ( ! this.filterChoices ) return DAOListView.create();
        var self = this;
        var views = this.filterChoices.map(function(filter) {
            return self.X.ViewChoice.create({
              view: self.X.PredicatedView.create({
                predicate: ( typeof filter[0] === "string" ?
                             self.queryParser.parseString(filter[0]) :
                             filter[0] ) || TRUE,
                dao: self.filteredDAO$Proxy,
                view: DAOListView.create()
              }),

              label: filter[1]
            });
          });

        return this.X.SwipeAltView.create({ views: views });
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
      view: {model_: 'TextFieldView', type: 'search', onKeyMode: true, placeholder: 'Search'} // TODO: change placeholder?
    },
    {
      model_: 'FunctionProperty',
      name: 'menuFactory'
    },
    {
      name: 'createAction',
      type: 'Action'
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

//      this.X = this.X.sub();

      var Button = ActionButtonCView.xbind({
        alpha:      0.76,
        width:      48,
        height:     44,
        iconWidth:  24,
        iconHeight: 24
      });
      this.X.registerModel(Button, 'ActionButton');

      var self = this;
      Events.dynamic(
        function() { self.sortOrder; self.q; },
        function() {
          self.filteredDAO = self.dao
            .where(self.queryParser.parseString(self.q) || TRUE)
            .orderBy(self.sortOrder);
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
           <% if ( this.data.createAction ) out(this.createActionView(this.data.createAction, { data: this.data, className: 'composeButton', color: 'white', font: '30px Roboto Arial', alpha: 1, width: 44, height: 44, radius: 22, background: '#c43828'})); %>
           $$name{mode: 'read-only', className: 'name'} $$enterSearchMode %%data.sortOrderView
         </span>
         <span class="search">
           $$leaveSearchMode{className: 'backButton'} $$q
         </span>
       </div>
       %%data.filteredDAOView
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
    %>
  */}
  ]
});
