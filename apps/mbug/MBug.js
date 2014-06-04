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
    //        ['',                     'All issues'],
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
                  chunkSize: 100
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
          self.filteredDAO = self.issueDAO
            .limit(15)
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
        var view = this.X.FullScreenTextFieldView.create(this.model.CC);
        this.X.stack.pushView(view);
        var self = this;
        view.data$.addListener(function() {
          self.X.stack.back();
          self.data.cc = self.data.cc.concat(view.data);
        });
      }
    }
  ],
  templates: [ function toHTML() {/*
    <div id="<%= this.id %>" class="issue-edit">
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
      <div class="body">
      <div class="header">
        #&nbsp;$$id{mode: 'read-only'} $$summary{mode: 'read-only'}
      </div>
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
          // TODO: get options from QProject
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
      <div class="separator"></div>
      <div class="owner">
        <div class="owner-header">Owner</div>
        <div class="owner-info">$$owner{model_: 'IssueOwnerAvatarView'} $$owner{model_: 'TwoModeTextFieldView', placeholder: 'Name', className: 'owner-name' }</div>
      </div>
      <div class="separator"></div>
      <div class="cc">
        <div class="cc-header"><div class="cc-header-text">Cc</div>$$addCc</div>
        $$cc{model_: 'IssueEmailArrayView'}
      </div>
      <%= this.commentsView %>
      </div>
    </div>
  */} ]
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
  <div class="owner-info"><%= IssueOwnerAvatarView.create({ data: this.data[i] }) %> <div class="owner-name">{{{this.data[i]}}}</div></div>
<% } %>
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
    generateColor: function() {
      var colors = [
        '#00681c', '#5b1094', '#790619', '#c88900', '#cc0060',
        '#008391', '#009486', '#b90038', '#846600', '#330099'
      ];

      if ( ! this.data ) return 'url(images/silhouette.png)';

      return colors[Math.abs(this.data.hashCode()) % colors.length];
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
        $$owner{model_: 'IssueOwnerAvatarView'}
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
    <hr>
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

  templates: [ function toHTML() {/*
    <div id="<%= this.id %>" class="project-view">
      $$email{model_: 'IssueOwnerAvatarView'}
      <div style="height: 80px;"> </div>

      $$email{mode: 'display-only'}
      <br><br>
      <hr>

      <div class="projectList">
      <%
         var projects = this.data.preferredProjects;

         if ( projects.indexOf('chromium') == -1 ) projects.push('chromium');
         if ( projects.indexOf('foam-framework') == -1 ) projects.push('foam-framework');

         projects.forEach(function(project) { %>
        <% if ( ' chromium-os chromedriver cinc crwm chrome-os-partner ee-testers-external '.indexOf(' ' + project + ' ') != -1 ) return; %>
        <div id="<%= self.on('click', function() { self.X.stack.back(); self.X.mbug.setProject(project); }, self.nextID()) %>" class="project-citation">
          <%= ImageView.create({data: self.X.baseURL + project + '/logo'}) %>
          <span class="project-name <%= self.X.projectName === project ? 'selected' : '' %>"><%= project %></span>
        </div>
        <% }); %>
        </div>
    </div>
  */} ]
});
