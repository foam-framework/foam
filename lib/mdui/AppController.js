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
        return this.__ctx__.PopupChoiceView.create({
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
        var DAOListView = this.__ctx__.ScrollView.xbind({
          model: this.model,
          mode: this.editableCitationViews ? 'read-write' : 'read-only',
          rowView: this.citationView,
          runway: 500
        });

        if ( ! this.filterChoices ) return DAOListView.create({ dao: this.filteredDAO$Proxy });
        var self = this;
        var views = this.filterChoices.map(function(filter) {
            return self.__ctx__.ViewChoice.create({
              view: self.__ctx__.PredicatedView.create({
                predicate: ( typeof filter[0] === "string" ?
                             self.queryParser.parseString(filter[0]) :
                             filter[0] ) || TRUE,
                dao: self.filteredDAO$Proxy,
                view: DAOListView.create()
              }),

              label: filter[1]
            });
          });

        return this.__ctx__.SwipeAltView.create({ views: views });
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
        this.__ctx__.stack.slideView(this.menuFactory());
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
    init: function(SUPER, X) {
      SUPER();

      this.__ctx__ = X.sub();

      // Temporary hack to redraw buttons a little after they're created so they can paint
      // at the proper size.  TODO: remove when fixed
      MODEL({
        name: 'ActionButtonCView2',
        extendsModel: 'ActionButtonCView',
        methods: {
          init: function() {
            this.SUPER();
            setTimeout(function() { this.view.paint(); }.bind(this), 2000);
          }
        }
      });

      var Button = ActionButtonCView2.xbind({
        alpha:      0.76,
        width:      48,
        height:     44,
        iconWidth:  24,
        iconHeight: 24
      });
      this.__ctx__.registerModel(Button, 'ActionButton');

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
       <% if ( this.data.createAction ) out(this.createActionView(this.data.createAction, { data: this.data, className: 'createButton', color: 'white', font: '30px Roboto Arial', alpha: 0.76, width: 44, height: 44, radius: 22, background: '#c43828'})); %>
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

  properties: [
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.__ctx__.dynamic(function() { self.width; self.height; }, this.layout);
    },
    toInnerHTML: function() {
      this.destroy();
      var out = "";
      var renderer = FOAM.lookup(this.data.citationRenderer, this.__ctx__);

      var view = this.filteredDAOView = this.__ctx__.CanvasScrollView.create({
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
