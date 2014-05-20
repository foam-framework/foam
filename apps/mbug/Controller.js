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
        this.X.project  = project;
        this.X.IssueDAO = project.IssueDAO;
      }
    },
    {
      name: 'stackView',
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

    toHTML: function() { return this.stackView.toHTML(); },
    initHTML: function() {
      this.stackView.initHTML();

      var self = this;

      this.X = this.X.sub({
        baseURL:           this.qbug.baseURL,
        user:              this.qbug.user,
        persistentContext: this.qbug.persistentContext,
        ProjectDAO:        this.qbug.ProjectNetworkDAO,
      });

        debugger;
      this.qbug.getDefaultProject({put: function(project) {
        self.project = project;
        var view = self.X.DetailView.create({value: SimpleValue.create(project)});
        self.stack.setTopView(view);
      }});
    }
  }

});


FOAModel({
  name: 'ProjectController',

  properties: [
    {
      name: 'projectName',
      getter: function() { this.X.projectName; }
    },
    { name: 'issueDAO' },
    { name: 'filteredDAO',    model_: 'DAOProperty', view: { model_: 'DAOListView' } },
    {
      name: 'sortOrder',
      postSet: function(_, q) { this.filteredDAO = this.dao.where(q); },
      defaultValue: TRUE,
      view: {
        model_: 'ChoiceListView',
        choices: [
          [ QIssue.MODIFIED,  'Last modified' ],
          [ QIssue.PRIORITY,  'Priority' ],
          [ QIssue.ID,        'Issue ID' ]
        ]
      }
    },
    {
      name: 'searchChoice',
      postSet: function(_, q) { this.filteredDAO = this.dao.where(q); },
      factory: function() {
        var open = 'status=Accepted,Assigned,Available,New,Started,Unconfirmed,Untriaged';

        return ChoiceView.create({
          helpText: 'Search within:',
          data$: this.location.can$,
          choices:[
//            ['',                     'All issues',              1],
            [open,                   'OPEN ISSUES',             2],
            [open + ' owner=me',     'OWNED BY ME',    3],
//            [open + ' reporter=me',  'Open and reported by me', 4],
            [open + ' is:starred',   'STARRED',  5]
//            [open + ' commentby:me', 'Open and comment by me',  8],
//            ['status=New',           'New issues',              6],
//            ['status=Fixed,Done',    'Issues to verify',        7]
          ]});
      }
    }
  ],
  actions: [
  ],
  listeners: [
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.filteredDAO = this.dao = EasyDAO.create({model: Todo, seqNo: true, daoType: 'StorageDAO', name: 'todos-foam'});
      this.dao.listen(this.onDAOUpdate);
      this.onDAOUpdate();
    }
  },
  templates: [
  ]
});

/*
FOAModel({
  name: 'IssueCitationView',
  extendsModel: 'DetailView',
  templates: [ { name: 'toHTML' } ]
});
*/
