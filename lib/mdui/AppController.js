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
      name: 'sortChoices'
    },
    {
      name: 'citationView',
      defaultValueFn: function() { return this.model.name + 'CitationView'; }
    },
    {
      name: 'sortOrder',
      defaultValueFn: function() { return this.sortChoices[0][0]; }
    },
    {
      name: 'sortOrderView',
      factory: function() {
        return PopupChoiceView.create({
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
      name: 'filteredDAOView',
      factory: function() {
        var self = this;
        var views = this.filterChoices.map(function(filter) {
            return ViewChoice.create({
              data$: self.filteredDAO,
              view: PredicatedView.create({
                predicate: QueryParser.parseString(filter[0]) || TRUE,
                view: DAOListView.create({
                  dao: self.dao,
                  mode: 'read-only',
                  rowView: self.citationView,
                  chunkSize: 15
                })
              }),

              label: filter[1]
            });
          });

        return SwipeAltView.create({ views: views });
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
      name: 'enterSearchMode',
      iconUrl: 'images/ic_search_24dp.png',
      label: '',
      action: function() { this.searchMode = true; }
    },
    {
      name: 'leaveSearchMode',
      iconUrl: 'images/ic_arrow_back_24dp.png',
      label: '',
      action: function() { this.searchMode = false; }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      Events.dynamic(
        function() { self.sortOrder; self.q; },
        function() {
          self.filteredDAO = self.dao
            .where(QueryParser.parseString(self.q) || TRUE)
            .orderBy(self.sortOrder);
        }
      );
    }
  },
  templates: [
    function toDetailHTML() {/*
    <div id="<%= this.setClass('searchMode', function() { return self.data.searchMode; }, this.id) %>"  class="mbug">
       <div class="header">
         <span class="default">
           $$menu $$name{mode: 'read-only'} $$enterSearchMode %%data.sortOrderView
         </span>
         <span class="search">
           $$leaveSearchMode $$q
         </span>
       </div>
       %%data.filteredDAOView
    </div>
    <%
      this.addInitializer(function() {
        var v = self.data.filteredDAOView;
        v.index$.addListener(function() {
          self.qView.$.placeholder = "Search " + v.views[v.index].label.toLowerCase();
        });
        self.data.searchMode$.addListener(EventService.merged(function() {
          self.qView.$.focus();
        }, 100));
      });
    %>
  */}
  ]
});
