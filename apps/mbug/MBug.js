MODEL({
  name: 'MBug',
  extendsModel: 'View',
  description: 'Mobile QuickBug',

  requires: [
    'DetailView',
    'GestureManager',
    'QBug',
    'StackView',
    'TouchManager'
  ],

  traits: ['PositionedDOMViewTrait'],

  properties: [
    {
      name: 'qbug',
      label: 'QBug',
      subType: 'QBug',
      view: function() { return this.DetailView({model: QBug}); },
      factory: function() {
        return this.QBug({
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
        var localDao = MDAO.create({ model: Y.QIssue });

        project.IssueNetworkDAO.batchSize = 25;

        Y.issueDAO = Y.QIssueSplitDAO.create({
          model: Y.QIssue,
          local: localDao,
          remote: project.IssueNetworkDAO,
          maxLimit: 25
        });

        Y.issueDAO = Y.KeywordDAO.create({
          delegate: Y.issueDAO
        });

        var pc = Y.AppController.create({
          name: project.projectName,
          model: Y.QIssue,
          dao: Y.issueDAO,
          editableCitationViews: true,
          queryParser: Y.QueryParser,
          citationView: 'IssueCitationView',
          sortChoices: project.defaultSortChoices,
          filterChoices: project.defaultFilterChoices,
          menuFactory: function() {
            return this.X.ChangeProjectView.create({data: project.user});
          }
        });
        this.stack.setTopView(pc.X.DetailView.create({data: pc}));
        project.X = pc.X;
      }
    },
    {
      name: 'stack',
      subType: 'StackView',
      factory: function() { return this.StackView(); },
      postSet: function(old, v) {
        if ( old ) {
          Events.unfollow(this.width$, old.width$);
          Events.unfollow(this.height$, old.height$);
        }
        Events.follow(this.width$, v.width$);
        Events.follow(this.height$, v.height$);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.X.touchManager   = this.TouchManager();
      this.X.gestureManager = this.GestureManager();
    },
    toHTML: function() { return this.stack.toHTML(); },
    projectContext: function() {
      return this.qbug.X.sub({
        mbug:              this,
        baseURL:           this.qbug.baseURL,
        user:              this.qbug.user,
        persistentContext: this.qbug.persistentContext,
        ProjectDAO:        this.qbug.ProjectDAO, // Is this needed?
        stack:             this.stack,
        DontSyncProjectData: true, // TODO(adamvy): This is a hack to prevent the project from creating its own caching daos.
      }, 'MBUG CONTEXT');
    },
    initHTML: function() {
      this.stack.initHTML();

      var self = this;
      this.qbug.userFuture.get(function(user) {
        self.qbug.findProject(user.defaultProject, {
          put: function(p) {
            self.project = p;
          }
        }, self.projectContext())
      });
    },
    editIssue: function(issue) {
      // TODO: clone issue, and add listener which saves on updates
      var v = this.project.X.IssueView.create({dao: this.project.X.issueDAO, data: issue.deepClone()});
      this.stack.pushView(v, '');
    },
    setProject: function(projectName) {
      var self = this;
      this.qbug.findProject(projectName, function(project) {
        self.project = project;
        self.qbug.userFuture.get(function(user) {
          user.defaultProject = projectName;
        });
      }, this.projectContext());
      this.stack.back();
    }
  }
});


MODEL({
  name: 'PriorityView',
  extendsModel: 'View',
  properties: [
    { name: 'data', postSet: function() { this.updateHTML(); } },
    {
      name: 'map',
      defaultValue: {
        'Low': 3,
        'Medium': 2,
        'High': 1,
        'Critical': 0
      }
    }
  ],
  methods: {
    dataToPriority: function(data) {
      var numeric = parseInt(data);
      if ( ! Number.isNaN(numeric) ) return numeric;
      if ( this.map[data] !== undefined ) return this.map[data];
      if ( data ) console.warn('Unknown priority "' + data + '".');
      return 3;
    }
  },
  templates: [
    function toInnerHTML() {/*
      <div class="priority priority-<%= this.dataToPriority(this.data) %>">P<%= this.dataToPriority(this.data) %></div>
    */}
  ]
});


MODEL({
  name: 'PriorityCitationView',
  extendsModel: 'PriorityView',
  methods: {
    updateHTML: function() {
      if ( ! this.$ ) return;
      this.invokeDestructors();
      this.$.outerHTML = this.toHTML();
      this.initHTML();
    }
  },
  templates: [
    function toHTML() {/*
      <span id="%%id" class="priority priority-<%= this.dataToPriority(this.data) %>">Pri <%= this.dataToPriority(this.data) %></span>
    */}
  ]
});


MODEL({
  name: 'IssueCitationView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      <div id="<%= this.on('click', function() { this.X.mbug.editIssue(this.data); }) %>" class="issue-citation">
        $$owner{model_: 'MDMonogramStringView'}
        <div class="middle">
          $$id{mode: 'read-only', className: 'id'}
        <% if ( this.data.pri ) { %>
          $$pri{ model_: 'PriorityCitationView' }
        <% } else { %>
          $$priority{ model_: 'PriorityCitationView' }
        <% } %><br>
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


MODEL({
  name: 'CommentView',
  extendsModel: 'DetailView',

  requires: [ 'MDMonogramStringView' ],

  templates: [ function toHTML() {/*
    <div class="separator"></div>
    <div id="<%= this.id %>" class="comment-view">
       <span class="owner">
         <%= this.MDMonogramStringView({data: this.data.author.name}) %>
       </span>
       <span class="content">
         Commented by $$author<br>
         <span class="published"><%= this.data.published.toRelativeDateString() %></span> <br><br>
         $$content{mode: 'read-only', escapeHTML: false}
       </span>
    </div>
  */} ]
});


// Is actually a DetailView on User, but is only really
// used to show and select available projects.
MODEL({
  name: 'ChangeProjectView',
  extendsModel: 'DetailView',
  requires: [ 'ImageView' ],
  traits: ['PositionedDOMViewTrait'],

  properties: [
    { name: 'preferredWidth', defaultValue: 304 },
    { name: 'className',      defaultValue: 'change-project-view' },
  ],

  templates: [
    function CSS() {/*
      .change-project-view {
        margin: 0;
        padding: 0;
        box-shadow: 1px 0 1px rgba(0,0,0,.1);
        font-size: 14px;
        font-weight: 500;
        background: white;
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .change-project-view .header {
        width: 100%;
        height: 172px;
        margin-bottom: 0;
        background-image: url('images/projectBackground.png');
      }

      .change-project-view span[name=email] {
        color: white;
        display: block;
        margin-top: 40;
        padding-left: 16px;
        font-weight: 500;
        font-size: 16px;
      }

      .change-project-view .projectList {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
      }

      .change-project-view .monogram-string-view {
        width: 64px;
        height: 64px;
        border-radius: 32px;
        margin: 16px;
      }

      .project-citation {
        margin-top: 0;
        height: 48px;
      }

      .project-citation img {
        margin-right: 0;
        width: 24px;
        height: 24px;
        margin: 12px 16px;
        vertical-align: middle;
      }

      .project-citation .project-name {
        color: rgba(0,0,0,.8);
        font-size: 14px;
        margin-left: 16px;
        vertical-align: middle;
      }

      .project-citation .project-name.selected {
        color: #3e50b4;
      }
    */},
    function toInnerHTML() {/*
      <div class="header">
        $$email{model_: 'MDMonogramStringView'}
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
          <%= self.ImageView({backupImage: 'images/defaultlogo.png', data: self.X.baseURL + project + '/logo'}) %>
          <span class="project-name <%= self.X.projectName === project ? 'selected' : '' %>"><%= project %></span>
        </div>
        <% }); %>
        </div>
    </div>
    */}
 ]
});
