/**
 *
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
    /*
    init: function() {
      this.SUPER();

    },
    */

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
    editIssue: function(issue) {
      // TODO: clone issue, and add listener which saves on updates
      var v = this.X.IssueDetailView.create({data: issue});
      this.X.stack.pushView(v);
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
            [open + ' owner=me',     'OWNED BY ME',    3],
//            [open + ' reporter=me',  'Open and reported by me', 4],
            [open + ' is:starred',   'STARRED',  5]
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
  name: 'IssueDetailView',
  extendsModel: 'DetailView',
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
      Owner
      $$owner
      <hr>
      CC
      $$cc
    </div>
  */} ]
});

FOAModel({
  name: 'IssueCitationView',
  extendsModel: 'DetailView',
  templates: [ function toHTML() {/*
    <div id="<%= this.on('click', function() { this.X.mbug.editIssue(this.data); }) %>">
       $$id{mode: 'read-only'} $$priority{mode: 'read-only'} $$owner{mode: 'read-only'} $$summary{mode: 'read-only'} $$starred $$status{mode: 'read-only'}
    </div>
  */} ]
});


FOAModel({
  name: 'ChangeProjectView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'projects',
      hidden: true
    },
    {
      name: 'projectList',
      view: { model_: 'ChoiceListView', choices: ['',''] }
    }
  ],

  methods: {
    updateSubViews: function() {
      this.SUPER();

      this.projectListView.choices = this.data.preferredProjects;
    }

  },

  actions: [
    {
      name: 'close',
      action: function() {
        this.X.stack.popView();
      }
    }
  ],

  templates: [ function toHTML() {/*
    <div>
      $$email{mode: 'display-only'}
      <hr>
      $$projectList
    </div>
  */} ]
});
