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
        return QBug.create({
          authClientId: '18229540903-cojf1q6g154dk5kpim4jnck3cfdvqe3u.apps.googleusercontent.com',
          authClientSecret: 'HkwDwjSekPBL5Oybq1NsDeZj'
        });
      }
    },
    {
      name: 'project',
      subType: 'QProject',
      postSet: function(_, project) {
        console.log('New Project: ', project.projectName);

        this.X.project     = project;
        this.X.projectName = project.projectName;
        this.X.issueDAO    = project.IssueDAO;

        var pc = this.X.ProjectController.create();
        var view = this.X.DetailView.create({data: pc});
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
    initHTML: function() {
      this.stack.initHTML();

      var self = this;

      this.X = this.X.sub({
        mbug:              this,
        baseURL:           this.qbug.baseURL,
        user:              this.qbug.user,
        persistentContext: this.qbug.persistentContext,
        ProjectDAO:        this.qbug.ProjectNetworkDAO,
        stack:             this.stack
      }, 'MBUG CONTEXT');

      this.qbug.getDefaultProject({put: function(project) { self.project = project; }});
    },
    editIssue: function(issue) {
      // TODO: clone issue, and add listener which saves on updates
      var v = this.X.IssueView.create({data: issue});
      this.stack.pushView(v);
    },
    setProject: function(projectName) {
      var self = this;
      this.qbug.findProject(projectName, function(project) { self.project = project; });
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
      view: { model_: 'DAOListView'/*'TouchListView'*/, mode: 'read-only', rowView: 'IssueCitationView'  }
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
      name: 'searchMode', postSet: function(_,v) { console.log('searchMode: ', v); }
    },
    {
      name: 'q',
      displayWidth: 50,
      view: {model_: 'TextFieldView', type: 'search', onKeyMode: true, placeholder: 'Search open issues'}
    },
    {
      name: 'can',
      defaultValue: 'status=Accepted,Assigned,Available,New,Started,Unconfirmed,Untriaged',
      view: function() {
        var open = ProjectController.CAN.defaultValue;

        return ChoiceListView.create({
          orientation: 'horizontal',
          choices: [
            [open,                   'OPEN ISSUES',             2],
            [open + ' is:starred',   'STARRED',  5],
            [open + ' owner=me',     'OWNED BY ME',    3]
//            ['',                     'All issues',              1],
//            [open + ' reporter=me',  'Open and reported by me', 4],
//            [open + ' commentby:me', 'Open and comment by me',  8],
//            ['status=New',           'New issues',              6],
//            ['status=Fixed,Done',    'Issues to verify',        7]
          ]
        });
      }
    }
  ],
  actions: [
    {
      name: 'changeProject',
      iconUrl: 'images/ic_menu_24dp.png',
      label: '',
      action: function() {
        var v = this.X.ChangeProjectView.create({data: this.project.user});
        this.X.stack.pushView(v);
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
        function() { self.can; self.sortOrder; self.q; },
        function() {
          console.log('Query Update');
          self.filteredDAO = self.issueDAO.
            limit(15).
            where(AND(
              QueryParser.parseString(self.can) || TRUE,
              QueryParser.parseString(self.q)   || TRUE
            ).partialEval()).
            orderBy(self.sortOrder);
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
       $$can{className: 'foamChoiceListView horizontal cannedQuery'}
       $$filteredDAO
    </div>
    <%
      this.data.can$.addListener(function() {
        self.qView.$.placeholder = "Search " + self.canView.choice[1].toLowerCase();
      });
      this.data.searchMode$.addListener(EventService.merged(function() {
        self.qView.$.focus();
      }, 100));
    %>
  */}
  ]
});


FOAModel({
  name: 'IssueView',
  extendsModel: 'DetailView',
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
      name: 'done',
      label: '',
      iconUrl: 'images/ic_clear_24dp.png',
      action: function() { this.X.stack.back(); }
    }
  ],
  templates: [ function toHTML() {/*
    <div id="<%= this.id %>" class="issue-edit">
      $$done $$starred{
        className:  'star',
        trueImage:  'images/ic_star_24dp.png',
        falseImage: 'images/ic_star_outline_24dp.png'
      }
      <br>
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
        <div class="cc-header">Cc</div>
        $$cc
      </div>
      <%= this.commentsView %>
    </div>
  */} ]
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
  templates: [ function toHTML() {/*
    <div id="<%= this.on('click', function() { this.X.mbug.editIssue(this.data); }) %>" class="issue-citation">
      $$owner{model_: 'IssueOwnerAvatarView'}
      <div class="middle">
        $$id{mode: 'read-only', className: 'id'} $$starred<br>
        $$summary{mode: 'read-only'}
      </div>
      $$pri{model_: 'PriorityView', mode: 'read-only'} <!-- $status{mode: 'read-only'} -->
    </div>
  */} ]
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
      <%
         var projects = this.data.preferredProjects;

         if ( projects.indexOf('chromium') == -1 ) projects.push('chromium');
         if ( projects.indexOf('foam-framework') == -1 ) projects.push('foam-framework');

         projects.forEach(function(project) { %>
        <% if ( ' chromium-os chromedriver cinc crwm chrome-os-partner ee-testers-external '.indexOf(' ' + project + ' ') != -1 ) return; %>
        <div id="<%= self.on('click', function() { self.X.mbug.setProject(project); }, self.nextID()) %>" class="project-citation">
          <%= ImageView.create({data: self.X.baseURL + project + '/logo'}) %>
          <span class="project-name <%= self.X.projectName === project ? 'selected' : '' %>"><%= project %></span>
        </div>
      <% }); %>
    </div>
  */} ]
});
