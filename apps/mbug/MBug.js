/**
 * Mobile QuickBug.
 **/

FOAModel({
  name: 'MBug',
  description: 'Mobile QuickBug',

  extendsModel: 'View',

  properties: [
    {
      name: 'qbug',
      label: 'QBug',
      subType: 'QBug',
      view: function() { return DetailView.create({model: QBug}); },
      factory: function() {
        return this.X.QBug.create({
          authClientId: '18229540903-cojf1q6g154dk5kpim4jnck3cfdvqe3u.apps.googleusercontent.com',
          authClientSecret: 'HkwDwjSekPBL5Oybq1NsDeZj'
        });
      }
    },
    {
      name: 'project',
      subType: 'QProject',
      postSet: function(_, project) {
        var Y = project.X;
        Y.project     = project;
        Y.projectName = project.projectName;
        Y.issueDAO    = project.IssueDAO;

        var pc = Y.ProjectController.create();
        var view = Y.DetailView.create({data: pc});
        this.stack.setTopView(view);
      }
    },
    {
      name: 'stack',
      subType: 'StackView',
      factory: function() { return StackView.create(); }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.X.touchManager = TouchManager.create({});
    },
    toHTML: function() { return this.stack.toHTML(); },
    projectContext: function() {
      return this.X.sub({
        mbug:              this,
        baseURL:           this.qbug.baseURL,
        user:              this.qbug.user,
        persistentContext: this.qbug.persistentContext,
        ProjectDAO:        this.qbug.ProjectNetworkDAO,
        stack:             this.stack
      }, 'MBUG CONTEXT');
    },

    initHTML: function() {
      this.stack.initHTML();

      var self = this;
      this.qbug.getDefaultProject({put: function(project) { self.project = project; }}, this.projectContext());
    },
    editIssue: function(issue) {
      // TODO: clone issue, and add listener which saves on updates
      var v = this.project.X.IssueView.create({dao: this.project.X.issueDAO, data: issue});
      this.stack.pushView(v, '');
    },
    setProject: function(projectName) {
      var self = this;
      this.qbug.findProject(projectName, function(project) { self.project = project; }, this.projectContext());
      this.stack.back();
    }
  }
});


FOAModel({
  name: 'PriorityView',
  extendsModel: 'View',
  // TODO: I'm not sure why the preSet is needed, but things aren't working without it.
  properties: [ { name: 'data', preSet: function(_, v) { return v ? v : '0'; }, postSet: function() { this.updateHTML(); } } ],
  templates: [ function toInnerHTML() {/*
    <div class="priority priority-%%data">P%%data</div>
  */} ]
});


FOAModel({
  name: 'ProjectController',

  properties: [
    {
      name: 'project',
      defaultValueFn: function() { return this.X.project; }
    },
    {
      name: 'projectName',
      defaultValueFn: function() { return this.X.projectName; },
    },
    {
      name: 'issueDAO',
      defaultValueFn: function() { return this.X.issueDAO; },
    },
    {
      name: 'filteredDAO',
      model_: 'DAOProperty',
      help: 'Top-level filtered DAO. Further filtered by each canned query.',
      view: function() {
        var open = 'status=Accepted,Assigned,Available,New,Started,Unconfirmed,Untriaged';
        var self = this;
        var views = [
//            ['',                     'ALL ISSUES'],
            [open,                   'OPEN ISSUES'],
            [open + ' is:starred',   'STARRED'],
            [open + ' owner=me',     'OWNED BY ME']
    //        [open + ' reporter=me',  'Open and reported by me'],
    //        [open + ' commentby:me', 'Open and comment by me'],
    //        ['status=New',           'New issues'],
    //        ['status=Fixed,Done',    'Issues to verify']
          ].map(function(filter) {
            return ViewChoice.create({
              view: PredicatedView.create({
                predicate: QueryParser.parseString(filter[0]) || TRUE,
                view: DAOListView.create({
                  mode: 'read-only',
                  rowView: 'IssueCitationView',
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
      name: 'sortOrder',
      defaultValue: QIssue.MODIFIED,
      view: {
        model_: 'PopupChoiceView',
        iconUrl: 'images/ic_sort_24dp.png',
        choices: [
          [ DESC(QIssue.MODIFIED), 'Last modified' ],
          [ QIssue.PRI,            'Priority' ],
          [ DESC(QIssue.ID),       'Issue ID' ]
        ]
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
      view: {model_: 'TextFieldView', type: 'search', onKeyMode: true, placeholder: 'Search open issues'}
    },
    {
      name: 'changeProjectView'
    }
  ],
  actions: [
    {
      name: 'changeProject',
      iconUrl: 'images/ic_menu_24dp.png',
      label: '',
      action: function() {
        var v = this.X.ChangeProjectView.create({data: this.project.user});
//        this.X.stack.pushView(v);
        this.X.stack.slideView(v);
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
//          console.log('Query: ', (QueryParser.parseString(self.q) || TRUE).toMQL());
          self.filteredDAO = self.issueDAO
            .where(QueryParser.parseString(self.q) || TRUE)
            .orderBy(self.sortOrder);
        }
      );

      this.changeProjectView = ChangeProjectView.create({
        data: this.project.user
      });
    }
  },
  templates: [
    // Pre-load project view images to speed up load time.
    // However, the first load is still delayed while it downloads a Roboto font related file.
    function toDetailHTML() {/*
    <img style="display:none" src="images/defaultlogo.png">
    <img style="display:none" src="images/projectBackground.png">
    <div id="<%= this.setClass('searchMode', function() { return self.data.searchMode; }, this.id) %>"  class="mbug">
       <div class="header">
         <span class="default">
           $$changeProject $$projectName{mode: 'read-only'} $$enterSearchMode $$sortOrder
         </span>
         <span class="search">
           $$leaveSearchMode $$q
         </span>
       </div>
       $$filteredDAO
    </div>
    <%
      this.addInitializer(function() {
        self.filteredDAOView.index$.addListener(function() {
          var v = self.filteredDAOView;
          self.qView.$.placeholder = "Search " + v.views[v.index].label.toLowerCase();
        });
        self.data.searchMode$.addListener(EventService.merged(function() {
          self.qView.$.focus();
        }, 100));

        // Add the project menu swipe-in handler. Its bound to the
        // controller's element, but the delegate is the menu itself.
        self.data.changeProjectView.container = self.$;
        self.X.touchManager.install(TouchReceiver.create({
          id: 'mbug-project-menu-' + self.id,
          element: self.$,
          delegate: self.data.changeProjectView
        }));
      });
    %>
  */}
  ]
});


FOAModel({
  name: 'IssueView',
  extendsModel: 'UpdateDetailView',
  properties: [
    {
      name: 'commentsView',
      factory: function() {
        return DAOListView.create({mode: 'read-only', rowView: 'CommentView', dao: this.X.project.issueCommentDAO(this.data.id)});
      }
    }
  ],
  actions: [
    {
      name: 'back',
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png'
    },
    {
      name: 'cancel',
      label: '',
      iconUrl: 'images/ic_clear_24dp.png'
    },
    {
      name: 'save',
      label: '',
      iconUrl: 'images/ic_done_24dp.png'
    },
    {
      name: 'addCc',
      label: '',
      iconUrl: 'images/ic_add_24dp.png',
      action: function() {
        var view = this.X.IssueOwnerEditView.create(this.model.CC);
        this.X.stack.pushView(view);
        view.focus();
        var self = this;
        view.subscribe(['finished'], function() {
          self.data.cc = self.data.cc.concat(view.data);
        });
      }
    }
  ],
  templates: [
    function headerToHTML() {/*
      <div class="header">
        <div class="toolbar">
          $$back
          $$cancel
          <span class="expand"></span>
          $$save
          $$starred{
            model_: 'ImageBooleanView',
            className:  'star',
            trueImage:  'images/ic_star_white_24dp.png',
            falseImage: 'images/ic_star_outline_white_24dp.png'
          }
        </div>
        <div class="title">
          #&nbsp;$$id{mode: 'read-only'} $$summary{mode: 'read-only'}
        </div>
      </div>
    */},

    // TODO: get options from QProject
    function bodyToHTML() {/*
      <div class="body">
        <div class="choice">
          $$pri{model_: 'PriorityView'}
          $$pri{
            model_: 'PopupChoiceView',
            iconUrl: 'images/ic_arrow_drop_down_24dp.png',
            showValue: true,
            choices: [
              [0, 'Priority 0 -- Critical'],
              [1, 'Priority 1 -- High'],
              [2, 'Priority 2 -- Medium'],
              [3, 'Priority 3 -- Low']
            ]
          }
        </div>
        <div class="choice">
          <img src="images/ic_keep_24dp.png" class="status-icon">
          $$status{
            model_: 'PopupChoiceView',
            iconUrl: 'images/ic_arrow_drop_down_24dp.png',
            showValue: true,
            choices: [
              'Unconfirmed',
              'Untriaged',
              'Available',
              'Assigned',
              'Started',
              'ExternalDependency',
              'Fixed',
              'Verified',
              'Duplicate',
              'WontFix',
              'Archived'
            ]
          }
        </div>
        <div class="separator separator1"></div>
        <div class="owner">
          <div class="owner-header">Owner</div>
          $$owner{model_: 'IssueOwnerView', className: 'owner-info'}
        </div>
        <div class="separator separator1"></div>
        <div class="cc">
          <div class="cc-header"><div class="cc-header-text">Cc</div>$$addCc</div>
          $$cc{model_: 'IssueEmailArrayView'}
      </div>
      <%= this.commentsView %>
      </div>
    */},

    function toHTML() {/*
      <div id="<%= this.id %>" class="issue-edit">
        <%= this.headerToHTML() %>
        <%= this.bodyToHTML() %>
      </div>
    */}
  ]
});

FOAModel({
  name: 'IssueEmailArrayView',
  extendsModel: 'View',
  properties: [
    { name: 'data', postSet: function() { this.updateHTML(); } }
  ],
  templates: [
    function toHTML() {/* <div id="<%= this.id %>"><%= this.toInnerHTML() %></div> */},
    function toInnerHTML() {/*
<% for ( var i = 0; i < this.data.length; i++ ) { %>
  <%= IssueEmailCitationView.create({ data: this.data[i] }) %>
<% } %>
    */}
  ]
});

FOAModel({
  name: 'IssuePersonCitationView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/* $$name{model_: 'IssueEmailCitationView'} */}
  ]
});

FOAModel({
  name: 'IssueEmailCitationView',
  extendsModel: 'View',
  properties: [
    {
      name: 'value',
      postSet: function(_, v) {
        this.data = v.value;
      }
    },
    { name: 'data', postSet: function() { this.updateHTML(); } },
    { name: 'tagName', defaultValue: 'div' },
    { name: 'className', defaultValue: 'owner-info' }
  ],
  templates: [
    function toHTML() {/* <div %%cssClassAttr() id="<%= this.id %>"><%= this.toInnerHTML() %></div> */},
    function toInnerHTML() {/*
      <%= IssueOwnerAvatarView.create({ data: this.data }) %> <div class="owner-name"><%= escapeHTML(this.data) %></div>
    */}
  ]
});
    

FOAModel({
  name: 'IssueOwnerAvatarView',
  extendsModel: 'View',
  properties: [
    { name: 'data', postSet: function() { this.updateHTML(); } },
  ],
  methods: {
    colors: 'e8ad62 9b26af 6639b6 4184f3 02a8f3 00bbd3 009587 0e9c57 9e9c57 8ac249 ccdb38 ffea3a f3b300 ff9700 ff5621 785447'.split(' '),
    generateColor: function() {
      if ( ! this.data ) return 'url(images/silhouette.png)';

      return '#' + this.colors[Math.abs(this.data.hashCode()) % this.colors.length];
    },
    updateHTML: function() {
      if ( this.$ ) this.$.style.background = this.generateColor();
      return this.SUPER();
    },
  },
  templates: [
    function toInnerHTML() {/* {{{this.data[0] && this.data[0].toUpperCase()}}} */},
    function toHTML() {/*
      <div id="<%= this.id %>" data-tip="<%= this.data %>"class="owner-avatar" style="background: <%= this.generateColor() %>"><%= this.toInnerHTML() %></div>
    */}
  ]
});


FOAModel({
  name: 'IssueCitationView',
  extendsModel: 'DetailView',
  templates: [
    function priorityToHTML() {/*
      <% var pri = this.data.pri ? this.data.pri : '0'; %>
      <span class="priority priority-{{{pri}}}">Pri {{{pri}}}</span>
    */},
    function toHTML() {/*
      <div id="<%= this.on('click', function() { this.X.mbug.editIssue(this.data); }) %>" class="issue-citation">
        $$owner{model_: "IssueOwnerAvatarView"}
        <div class="middle">
          $$id{mode: 'read-only', className: 'id'} <% this.priorityToHTML(out); %><br>
          $$summary{mode: 'read-only'}
        </div>
        $$starred{
          model_: 'ImageBooleanView',
          className:  'star',
          trueImage:  'images/ic_star_24dp.png',
          falseImage: 'images/ic_star_outline_24dp.png'
        }
      </div>
    */}
   ]
});


FOAModel({
  name: 'CommentView',
  extendsModel: 'DetailView',
  templates: [ function toHTML() {/*
    <div class="separator"></div>
    <div id="<%= this.id %>" class="comment-view">
       <span class="owner">
         <%= IssueOwnerAvatarView.create({data: this.data.author.name}) %>
       </span>
       <span class="content">
         Commented by $$author{mode: 'read-only', tagName: 'span'}<br>
         <span class="published"><%= this.data.published.toRelativeDateString() %></span> <br><br>
         $$content{mode: 'read-only'}
       </span>
    </div>
  */} ]
});


// Is actually a DetailView on User, but is only really
// used to show and select available projects.
FOAModel({
  name: 'ChangeProjectView',
  extendsModel: 'DetailView',

  properties: [ 'x', 'container', 'open' ],

  methods: {
    onTouchStart: function(touches, changed) {
      // Only interested in single touches.
      if ( Object.keys(touches).length > 1 ) return { drop: true };
      var t = touches[changed[0]];
      console.log(t);
      if ( t.startX < 20 ) return { weight: 0.8 };
      else return { drop: true };
    },

    onTouchMove: function(touches, changed) {
      if ( this.open ) return { drop: true };
      // Touch started at left edge, or we wouldn't still be listening.
      // If it begins swiping right, then we're totally interested.
      var t = touches[changed[0]];
      var dx = t.x - t.startX;
      var dy = t.y - t.startY;
      var d = Math.sqrt(dx*dx + dy*dy);
      console.log('dx = ' + dx + ', dy = ' + dy + ', d = ' + d);
      if ( t.x - t.startX > 10 && Math.abs(t.y - t.startY) < 10 ) {
        // Moving right a bit and not much vertical, so start sliding.
        this.X.stack.slideView(this);
        this.open = true;
        return { claim: true, weight: 0.97, preventDefault: true };
      } else if ( d < 10 ) {
        return { preventDefault: true };
      } else {
        // This touch is no longer interesting.
        return { drop: true };
      }
    },

    onTouchEnd: function(touches, changed) {
      // TODO: Snap to place.
      return { drop: true };
    }
  },

  templates: [ function toHTML() {/*
    <div id="<%= this.id %>" class="project-view">
      <div class="header">
        $$email{model_: 'IssueOwnerAvatarView'}
        $$email{mode: 'display-only'}
        <br><br>
      </div>
      <div class="projectList">
      <%
         var projects = this.data.preferredProjects;

         if ( projects.indexOf('chromium') == -1 ) projects.push('chromium');
         if ( projects.indexOf('foam-framework') == -1 ) projects.push('foam-framework');

         projects.forEach(function(project) { %>
        <% if ( ' chromium-os chromedriver cinc crwm chrome-os-partner ee-testers-external '.indexOf(' ' + project + ' ') != -1 ) return; %>
        <div id="<%= self.on('click', function() { self.X.stack.back(); self.X.mbug.setProject(project); }, self.nextID()) %>" class="project-citation">
          <%= ImageView.create({backupImage: 'images/defaultlogo.png', data: self.X.baseURL + project + '/logo'}) %>
          <span class="project-name <%= self.X.projectName === project ? 'selected' : '' %>"><%= project %></span>
        </div>
        <% }); %>
        </div>
    </div>
  */} ]
});

FOAModel({
  name: 'IssueOwnerView',
  extendsModel: 'View',

  properties: [
    {
      name: 'avatarView',
      mode: 'final'
    },
    {
      name: 'nameView',
      mode: 'final'
    },
    {
      name: 'editView'
    },
    'data',
    'editViewArgs'
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);

      this.avatarView = this.X.IssueOwnerAvatarView.create(args);
      this.nameView = this.X.TextFieldView.create(args);
      this.nameView.mode = 'read-only';
      this.nameView.className = 'owner-name';
      this.nameView.placeholder = 'Name';
      this.editViewArgs = args;

      this.avatarView.data$ = this.nameView.data$ = this.data$;
    }
  },

  templates: [
    function toHTML() {/*
      <% this.on('click', this.onClick, this.id); %>
      <div %%cssClassAttr() id="{{this.id}}">%%avatarView %%nameView</div>
    */}
  ],

  listeners: [
    {
      name: 'onClick',
      code: function() {
        this.editView = this.X.IssueOwnerEditView.create(this.editViewArgs);
        this.X.stack.pushView(this.editView);
        this.editView.data$ = this.data$;
        this.editView.focus();
      }
    }
  ]
});

FOAModel({
  name: 'IssueOwnerEditView',
  extendsModel: 'View',

  properties: [
    'data',
    'autocompleter',
    { model_: 'BooleanProperty', name: 'autocomplete', defaultValue: true },
    'name',
    'placeholder',
    'domValue',
    'field',
    'autocompleteView',
    {
      name: 'className',
      defaultValue: 'issueOwnerEditView'
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);

      var Y = this.X.sub();

      this.autocompleteView = Y.IssuePersonAutocompleteView.create({
        autocompleter: this.autocompleter,
        target: this
      });

      this.children = [this.autocompleteView];

      var view = this.autocompleteView;
      var self = this;
      Y.registerModel({
        create: function(args) {
          args.target = self;
          view.copyFrom(args);
          return view;
        }
      }, 'AutocompleteView');

      this.field = Y.TextFieldView.create(args);
      this.field.onKeyMode = true;
      this.field.data$ = this.data$;
      this.field.subscribe(['keydown'], this.onKeyDown);
      this.field.subscribe(this.field.ESCAPE, this.onCancel);
    },
    initHTML: function() {
      this.SUPER();
    },
    onAutocomplete: function(data) {
      this.data = data;
      this.finished();
    },
    finished: function() {
      this.publish(['finished']);
      this.X.stack.back();
    },
    focus: function() { this.field.focus(); },
    valueToText: function(value) { return value; },
    textToValue: function(text) { return text; },
  },

  templates: [
    function toHTML() {/*
      <div <%= this.cssClassAttr() %> id="{{this.id}}">
        <div class="header">$$back %%field</div>
        %%autocompleteView
      </div>
    */}
  ],

  actions: [
    {
      name: 'back',
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp_black.png',
      action: function() { this.finished(); this.X.stack.back(); }
    }
  ],

  listeners: [
    {
      name: 'onKeyDown',
      code: function(_,_,e) {
        if ( e.keyCode === 13 ) {
          this.data = this.field.data;
          this.finished();
        }
      }
    },
    {
      name: 'onCancel',
      code: function() {
        this.finished();
      }
    }
  ],
});

FOAModel({
  name: 'IssuePersonAutocompleteView',
  extendsModel: 'View',

  properties: [
    'autocompleter',
    'target',
    {
      name: 'view',
      factory: function() {
        return this.X.DAOListView.create({
          rowView: 'IssuePersonCitationView',
          dao: NullDAO.create({}),
          useSelection: true
        });
      },
      postSet: function(old, v) {
        old && old.selection$.removeListener(this.complete);
        v.selection$.addListener(this.complete);
      }
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      name: 'className',
      defaultValue: 'issuePersonAutocompleteView'
    }
  ],

  methods: {
    autocomplete: function(partial) {
      if ( ! this.completer ) {
        var proto = FOAM.lookup(this.autocompleter, this.X);
        this.completer = proto.create();
        this.view.dao = this.completer.autocompleteDao,
        this.view.objToChoice = this.completer.f;
      }
      this.completer.autocomplete(partial);
    },
    toInnerHTML: function() {
      this.children = [this.view];
      return this.view.toHTML();
    }
  },

  listeners: [
    {
      name: 'complete',
      code: function() {
        this.target.onAutocomplete(this.completer.f(this.view.selection));
      }
    }
  ],
});
