MODEL({
  name: 'MBug',
  description: 'Mobile QuickBug',
  traits: ['PositionedDOMViewTrait'],

  extendsModel: 'View',

  properties: [
    {
      name: 'qbug',
      label: 'QBug',
      subType: 'QBug',
      view: function() { return this.X.DetailView.create({model: QBug}); },
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
        var localDao = LRUCachingDAO.create({
          delegate: MDAO.create({ model: Y.QIssue })
        });

        project.IssueNetworkDAO.batchSize = 25;

        Y.issueDAO = Y.QIssueSplitDAO.create({
          local: localDao,
          model: Y.QIssue,
          remote: project.IssueNetworkDAO,
          maxLimit: 25
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
        var view = FloatingView.create({
          view: Y.DetailView.create({data: pc})
        });
        this.stack.setTopView(view);
      }
    },
    {
      name: 'stack',
      subType: 'StackView',
      factory: function() { return this.X.StackView.create(); },
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
      this.X.touchManager = this.X.TouchManager.create({});
      this.X.gestureManager = this.X.GestureManager.create({});
    },
    toHTML: function() { return this.stack.toHTML(); },
    projectContext: function() {
      return this.X.sub({
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
      var v = this.project.X.FloatingView.create({
        view: this.project.X.IssueView.create({dao: this.project.X.issueDAO, data: issue})
      });
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
  name: 'ColoredBackgroundTrait',
  methods: {
    colors: 'e8ad62 9b26af 6639b6 4184f3 02a8f3 00bbd3 009587 0e9c57 9e9c57 8ac249 ccdb38 ffea3a f3b300 ff9700 ff5621 785447'.split(' '),
    generateColor: function(data) {
      return '#' + this.colors[Math.abs(data.hashCode()) % this.colors.length];
    },
    generateColorStyle: function(data) { return ' style="background:' + this.generateColor(data) + ';"'; }
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
      console.warn('Unknown priority ', data);
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
  name: 'IssueView',
  extendsModel: 'UpdateDetailView',
  properties: [
    {
      name: 'commentsView',
      factory: function() {
        return DAOListView.create({mode: 'read-only', rowView: 'CommentView', dao: this.X.project.issueCommentDAO(this.data.id).orderBy(QIssueComment.SEQ_NO) });
      }
    },
    {
      name: 'scroller$',
      getter: function() { return this.X.$(this.id + '-scroller'); }
    },
    {
      name: 'scrollHeight'
    },
    {
      name: 'viewportHeight',
      defaultValueFn: function() {
        return this.$ && this.$.offsetHeight;
      }
    },
    {
      name: 'scrollTop',
      hidden: true,
      defaultValue: 0,
      postSet: function(_, nu) {
        var s = this.$.getElementsByClassName('body')[0];
        if ( s ) s.scrollTop = nu;
      }
    },
    {
      name: 'verticalScrollbarView',
      defaultValue: 'VerticalScrollbarView'
    },
    {
      name: 'scrollGesture',
      hidden: true,
      transient: true,
      factory: function() {
        var self = this;
        return this.X.GestureTarget.create({
          container: {
            containsPoint: function(x, y, e) {
              var s = self.scroller$;
              while ( e ) {
                if ( e === s ) return true;
                e = e.parentNode;
              }
              return false;
            }
          },
          handler: this,
          gesture: 'verticalScrollMomentum'
        });
      }
    }
  ],
  // TODO: Make traits for DOM (overflow: scroll) and abspos scrolling.
  listeners: [
    {
      name: 'verticalScrollMove',
      code: function(dy, ty, y) {
        this.scrollTop -= dy;
      }
    },
    {
      name: 'updateScrollHeight',
      code: function() {
        this.scrollHeight = parseFloat(this.scroller$.style.height);
      }
    }
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
      this.X.gestureManager.install(this.scrollGesture);

      /*
      var verticalScrollbar = FOAM.lookup(this.verticalScrollbarView, this.X).create({
        height$: this.viewportHeight$,
        scrollTop$: this.scrollTop$,
        scrollHeight$: this.scrollHeight$
      });

      this.$.getElementsByClassName('body')[0].insertAdjacentHTML('beforeend', verticalScrollbar.toHTML());
      this.X.setTimeout(function() { verticalScrollbar.initHTML(); }, 0);
      */
    },

    destroy: function() {
      this.SUPER();
      this.X.gestureManager.uninstall(this.scrollGesture);
    }
  },
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
        <div id="<%= this.id %>-scroller" class="body-scroller">
          <div class="choice">
          <% if ( this.data.pri ) { %>
            $$pri{ model_: 'PriorityView' }
            $$pri{
              model_: 'PopupChoiceView',
              iconUrl: 'images/ic_arrow_drop_down_24dp.png',
              showValue: true
            }
          <% } else { %>
            $$priority{ model_: 'PriorityView' }
            $$priority{
              model_: 'PopupChoiceView',
              iconUrl: 'images/ic_arrow_drop_down_24dp.png',
              showValue: true
            }
          <% } %>
          </div>
          <div class="choice">
            <img src="images/ic_keep_24dp.png" class="status-icon">
            <%=
              this.createTemplateView('STATUS', {
                model_: 'PopupChoiceView',
                iconUrl: 'images/ic_arrow_drop_down_24dp.png',
                showValue: true,
                dao: this.X.StatusDAO,
                objToChoice: function(o) { return [o.status, o.status]; }
              })
            %>
          </div>

          <div class="separator separator1"></div>
          $$owner{model_: 'CCView'}

          <div class="separator separator1"></div>
          $$cc{model_: 'CCView'}

          <div class="separator separator1"></div>
          $$labels{model_: 'IssueLabelView'}

          <%= this.commentsView %>
        </div>
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


MODEL({
  name: 'IssueOwnerAvatarView',
  extendsModel: 'View',
  traits: ['ColoredBackgroundTrait'],
  properties: [
    { name: 'data', postSet: function() { this.updateHTML(); } },
  ],
  methods: {
    generateColor: function(data) {
      return data ? this.SUPER(data) : 'url(images/silhouette.png)';
    },
    updateHTML: function() {
      if ( this.$ ) this.$.style.background = this.generateColor(this.data);
      this.SUPER();
    },
  },
  templates: [
    function toInnerHTML() {/* {{{this.data[0] && this.data[0].toUpperCase()}}} */},
    // TODO: replace use of data-tip with Tooltip Model
    function toHTML() {/*
      <div id="<%= this.id %>" data-tip="<%= this.data %>" class="owner-avatar" style="background:<%= this.generateColor(this.data) %>"><%= this.toInnerHTML() %></div>
    */}
  ]
});


MODEL({
  name: 'IssueCitationView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      <div id="<%= this.on('click', function() { this.X.mbug.editIssue(this.data); }) %>" class="issue-citation">
        $$owner{model_: "IssueOwnerAvatarView"}
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
  templates: [ function toHTML() {/*
    <div class="separator"></div>
    <div id="<%= this.id %>" class="comment-view">
       <span class="owner">
         <%= IssueOwnerAvatarView.create({data: this.data.author.name}) %>
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
  traits: ['PositionedDOMViewTrait'],
  extendsModel: 'DetailView',

  properties: [
    { name: 'preferredWidth', defaultValue: 304 },
    { name: 'className',      defaultValue: 'change-project-view' },
  ],

  templates: [
    function toInnerHTML() {/*
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
    */},
    function CSS() {/*
      .change-project-view {
        margin: 0;
        padding: 0;
        box-shadow: 1px 0 1px rgba(0,0,0,.1);
        font-size: 14px;
        font-weight: 500;
        background: white;
      }

      .change-project-view .header {
        width: 100%;
        height: 172px;
        margin-bottom: 0;
        background-image: url('images/projectBackground.png');
      }

      .change-project-view {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: white;
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

      .change-project-view .owner-avatar {
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
  */}
 ]
});
