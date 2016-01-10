/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  package: 'foam.apps.mbug',
  name: 'MBug',
  description: 'Mobile QuickBug',

  extends: 'foam.ui.View',
  traits: [ 'foam.ui.layout.PositionedDOMViewTrait' ],

  requires: [
    'com.google.analytics.AnalyticsDAO',
    'foam.apps.mbug.ui.ChangeProjectView',
    'foam.apps.mbug.ui.IssueCitationView',
    'foam.apps.mbug.ui.IssueView',
    'foam.apps.quickbug.model.DefaultQuery',
    'foam.apps.quickbug.model.QBug',
    'foam.core.dao.CloningDAO',
    'foam.core.dao.KeywordDAO',
    'foam.core.dao.SplitDAO',
    'foam.dao.ContextualizingDAO',
    'foam.dao.DAOVersion',
    'foam.dao.IDBDAO',
    'foam.graphics.ActionButtonCView',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.metrics.Metric',
    'foam.oauth2.AutoOAuth2',
    'foam.oauth2.OAuth2Redirect',
    'foam.ui.DetailView',
    'foam.ui.layout.CSSStackView as StackView',
    'foam.ui.md.AppController',
    'foam.ui.md.ResponsiveAppControllerView',
  ],

  exports: [
    'daoVersionDao',
    'metricDAO'
  ],

  properties: [
    {
      name: 'daoVersionDao',
      lazyFactory: function() { return this.IDBDAO.create({ model: this.DAOVersion }); }
    },
    {
      name: 'autoOAuth2',
      factory: function() { return this.AutoOAuth2.create(); }
    },
    {
      name: 'metricDAO',
      factory: function() {
        return this.AnalyticsDAO.create({
          propertyId: 'UA-47217230-4',
          appName: 'MBug',
          appVersion: '1.1.0'
        });
      }
    },
    {
      type: 'Boolean',
      name: 'opening',
      defaultValue: false
    },
    {
      name: 'qbug',
      label: 'QBug',
      subType: 'foam.apps.quickbug.model.QBug',
      view: function() { return this.DetailView.create({model: this.QBug}); },
      factory: function() {
        return this.QBug.create({
          authClientId: '18229540903-cojf1q6g154dk5kpim4jnck3cfdvqe3u.apps.googleusercontent.com',
          authClientSecret: 'HkwDwjSekPBL5Oybq1NsDeZj'
        });
      }
    },
    {
      name: 'project',
      subType: 'foam.apps.quickbug.model.QProject',
      postSet: function(_, project) {
        var Y = project.Y;
        Y.project     = project;
        Y.projectName = project.projectName;

        project.IssueNetworkDAO.batchSize = 25;

        Y.issueDAO = this.SplitDAO.create({
          model: Y.QIssue,
          remote: project.IssueNetworkDAO,
          placeholderFactory: constantFn(
            Y.QIssue.create({
              status: 'OPEN',
              id: 0,
              summary: 'Loading...',
              starred: false
            }))
        }, Y);

        Y.issueDAO = this.ContextualizingDAO.create({
          delegate: this.CloningDAO.create({
            delegate: this.KeywordDAO.create({
              delegate: Y.issueDAO,
              DefaultQuery: this.DefaultQuery
            }, Y)
          }, Y)
        }, Y);

        this.metricDAO.put(this.Metric.create({
          name: 'launchApp'
        }));


        var pc = this.AppController.create({
          name: project.projectName,
          model: Y.QIssue,
          dao: Y.issueDAO,
          editableCitationViews: true,
          queryParser: Y.QueryParser,
          citationView: 'foam.apps.mbug.ui.IssueCitationView',
          sortChoices: project.defaultSortChoices,
          filterChoices: project.defaultFilterChoices,
          menuFactory: function() {
            return this.X.lookup('foam.apps.mbug.ui.ChangeProjectView').create({data: project.user}, this.Y);
          }
        }, Y);
        this.stack.setTopView(this.DetailView.create({data: pc}, pc.Y));
        /*
        var view = this.ResponsiveAppControllerView.create(undefined, pc.X.sub({
          data: pc
        }));

        this.stack.setTopView(view);
        project.X = pc.X;

        // TODO: Hack for positioned view layout delay.
        view.onResize();
        */
      }
    },
    {
      name: 'stack',
      subType: 'foam.ui.StackView',
      factory: function() { return this.StackView.create(); },
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
      this.X.touchManager   = this.TouchManager.create();
      this.X.gestureManager = this.GestureManager.create();
      this.Y.registerModel(this.ActionButtonCView.xbind({
        haloColor: 'rgb(255,255,255)'
      }), 'foam.graphics.ActionButtonCView');
    },
    toHTML: function() { return this.stack.toHTML(); },
    projectContext: function() {
      return this.qbug.Y.sub({
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
      this.qbug.userReady.get(function(user) {
        self.qbug.findProject(user.defaultProject, {
          put: function(p) {
            self.project = p;
          }
        }, self.projectContext())
      });
    },
    editIssue: function(id) {
      if ( this.opening ) return;

      // Don't open placeholder issues.
      if ( id == 0 ) return;

      this.opening = true;
      this.project.Y.issueDAO.find(id, {
        put: function(issue) {
          this.opening = false;
          var v = this.IssueView.create({
            dao: this.project.Y.issueDAO,
            data: issue
          }, this.project.Y);
          this.stack.pushView(v, '');
        }.bind(this),
        error: function() {
          this.opening = false;
        }
      });

      // TODO: clone issue, and add listener which saves on updates

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
  },
  templates: [
    { name: 'CSS' }
  ]
});
