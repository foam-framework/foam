/**
 *
 **/

FOAModel({
  name: 'PriorityView',
  extendsModel: 'View',
  properties: [ { name: 'data', postSet: function() { this.updateHTML(); } } ],
  templates: [ function toInnerHTML() {/*
    <div class="priority priority-%%data">P%%data</div>
  */} ]
});
QIssue.PRIORITY.view = 'PriorityView';


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
        console.log('New Project: ', project);
        this.X.project     = project;
        this.X.projectName = project.projectName;
        this.X.issueDAO    = project.IssueDAO;
      }
    },
    {
      name: 'stack',
      subType: 'StackView',
      view: function() { return StackView.create(); },
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

      this.qbug.getDefaultProject({put: function(project) {
        self.project = project;
        var pc = self.X.ProjectController.create();
        var view = self.X.DetailView.create({data: pc});
        self.stack.setTopView(view);
      }});
    },
    viewIssue: function(issue) {
      // TODO: clone issue, and add listener which saves on updates
      var v = this.X.IssueView.create({data: issue});
      this.stack.pushView(v);
    },
    editIssue: function(issue) {
      // TODO: clone issue, and add listener which saves on updates
      var v = this.X.IssueEditView.create({data: issue});
      this.stack.pushView(v);
    },
    setProject: function(project) {
      console.log('setProject: ', project);
      this.stack.back();
    }
  }
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
      hidden: true
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
        model_: 'ChoiceView',
        choices: [
          [ QIssue.MODIFIED,  'Last modified' ],
          [ QIssue.PRIORITY,  'Priority' ],
          [ QIssue.ID,        'Issue ID' ]
        ]
      }
    },
    {
      name: 'q'
    },
    {
      name: 'can',
      defaultValue: 'status=Accepted,Assigned,Available,New,Started,Unconfirmed,Untriaged',
      view: function() {
        var open = ProjectController.CAN.defaultValue;

        return ChoiceListView.create({
          orientation: 'horizontal',
//          helpText: 'Search within:',
          choices: [
//            ['',                     'All issues',              1],
            [open,                   'OPEN ISSUES',             2],
            [open + ' is:starred',   'STARRED',  5],
            [open + ' owner=me',     'OWNED BY ME',    3]
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
      action: function() {
        var v = this.X.ChangeProjectView.create({data: this.project.user});
        this.X.stack.pushView(v);
      }
    }
  ],
  listeners: [
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
            limit(10).
            where(AND(
              QueryParser.parseString(self.can) || TRUE,
              QueryParser.parseString(self.q) || TRUE
            ).partialEval()).
            orderBy(self.sortOrder);
        }
      );
    }
  },
  templates: [
    function toDetailHTML() {/*
    <div>
       $$changeProject $$projectName{mode: 'read-only'} $$q $$sortOrder
       <hr>
       $$can
       <hr>
       $$filteredDAO
    </div>
  */}
  ]
});


FOAModel({
  name: 'IssueEditView',
  extendsModel: 'DetailView',
  templates: [ function toHTML() {/*
    <div>
      $$starred
      <!-- Insert Attachments here -->
      <hr>
      #$$id{mode: 'read-only'} $$summary{mode: 'read-only'}
      <hr>
      $$priority<br>
      $$status
      <hr>
      Owner
      $$owner
      <hr>
      CC
      $$cc
    </div>
  */} ]
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
      name: 'edit',
      action: function() {
        this.X.mbug.editIssue(this.data);
      }
    }
  ],
  templates: [ function toHTML() {/*
    <div>
      $$starred
      <!-- Insert Attachments here -->
      <hr>
      #$$id{mode: 'read-only'} $$summary{mode: 'read-only'}
      <hr>
      $$priority{mode: 'read-only'}<br>
      $$status{mode: 'read-only'}
      <hr>
      Owner $$owner{mode: 'read-only', tagName: 'span'}
      <hr>
      CC
      $$cc{mode: 'read-only'}
      <hr>
      <%= this.commentsView %>
    </div>
    $$edit
  */} ]
});


FOAModel({
  name: 'IssueCitationView',
  extendsModel: 'DetailView',
  templates: [ function toHTML() {/*
    <div id="<%= this.on('click', function() { this.X.mbug.viewIssue(this.data); }) %>" class="issue-citation">
      <span class="owner">$$owner{mode: 'read-only'}</span>
      <div class="middle">
        $$id{mode: 'read-only', className: 'id'} $$starred<br>
        $$summary{mode: 'read-only'}
      </div>
      $$priority{mode: 'read-only', className: 'priority'} <!-- $status{mode: 'read-only'} -->
    </div>
  */} ]
});


FOAModel({
  name: 'CommentView',
  extendsModel: 'DetailView',
  templates: [ function toHTML() {/*
    <div>
       Commented by $$author{mode: 'read-only', tagName: 'span'}<br>
       $$published<br><br>
       $$content{mode: 'read-only'}
       <hr>
    </div>
  */} ]
});


// Is actually a DetailView on User, but is only really
// used to show and select available projects.
FOAModel({
  name: 'ChangeProjectView',
  extendsModel: 'DetailView',

  templates: [ function toHTML() {/*
    <div>
      $$email{mode: 'display-only'}
      <hr>
      <% this.data.projects.forEach(function(project) { %>
        <div id="<%= self.on('click', function() { self.X.mbug.setProject(project); }, self.nextID()) %>" class="project-citation">
          <%= project.name %>
        </div>
      <% }); %>
    </div>
  */} ]
});
