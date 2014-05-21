/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

FOAModel({
  name: 'QProject',

  tableProperties: [
    'projectName',
    'baseURL'
  ],

  properties: [
    {
      name: 'qbug',
    },
    {
      name: 'project',
    },
    {
      name: 'baseURL',
      defaultValue: 'https://code.google.com/p/'
    },
    {
      name: 'projectName',
      scope: 'project',
      defaultValueFn: function() { return this.project.name; }
    },
    {
      name: 'summary',
      scope: 'project',
      defaultValueFn: function() { return this.project.summary; }
    },
    {
      name: 'user',
      scope: 'qbug',
      defaultValueFn: function() { return this.qbug.user; }
    },
    {
      name: 'LabelDAO',
      help: 'DAO of known labels.',
      factory: function() {
        var dao = MDAO.create({ model: QIssueLabel });
        this.project.issuesConfig.labels.select(dao);
        return dao;
      },
      postSet: function(_, value)  {
        this.X.LabelDAO = value;
      }
    },
    {
      name: 'StatusDAO',
      help: 'DAO of known statuses.',
      factory: function() {
        var dao = MDAO.create({ model: QIssueStatus });
        this.project.issuesConfig.statuses.select(dao);
        return dao;
      },
      postSet: function(_, value)  {
        this.X.StatusDAO = value;
      }
    },
    {
      name: 'PersonDAO',
      help: 'DAO of known people.',
      factory: function() {
        var dao = MDAO.create({ model: QIssuePerson });
        this.project.members.select(dao);
        return dao;
      },
      postSet: function(_, value)  {
        this.X.PersonDAO = value;
      }
    },
    {
      name: 'IssueMDAO',
      factory: function() {
        var dao = this.X.MDAO.create({model: QIssue});
        var auto = this.X.AutoIndex.create(dao);

        auto.addIndex(QIssue.STATUS);
        dao.addRawIndex(auto);

        return dao;
      }
    },
    {
      name: 'IssueCachingDAO',
      factory: function() {
        var IssueIDBDAO = this.X.IDBDAO.create({
          model: QIssue,
          name: this.projectName + '_' + QIssue.plural
        });

        return this.X.CachingDAO.create(this.IssueMDAO, IssueIDBDAO);
      },
      transient: true
    },
    {
      name: 'IssueCommentNetworkDAO',
      factory: function() {
        return this.X.QIssueCommentNetworkDAO.create({
          model: QIssueComment,
          url: 'https://www.googleapis.com/projecthosting/v2/projects/' + this.projectName + '/issues',
        });
      }
    },
    {
      name: 'IssueCommentDAO',
      factory: function() {
        return this.X.QIssueCommentUpdateDAO.create({
          IssueDAO: this.IssueCachingDAO,
          delegate: this.IssueCommentNetworkDAO
        });
      }
    },
    {
      name: 'IssueNetworkDAO',
      factory: function() {
        return this.X.IssueRestDAO.create({
          url: 'https://www.googleapis.com/projecthosting/v2/projects/' + this.projectName + '/issues',
          model: QIssue,
          batchSize: 500
        });
      },
      transient: true
    },
    {
      name: 'IssueSplitDAO',
      factory: function() {
        var dao = this.IssueCachingDAO;

        return this.X.QIssueSplitDAO.create({
          local: dao,
          model: QIssue,
          remote: this.IssueNetworkDAO
        });
      },
      transient: true
    },
    {
      name: 'IssueDAO',
      factory: function() {
        var dao = this.IssueSplitDAO;

        dao = this.X.QBugActionFactoryDAO.create({
          delegate: dao,
          actionDao: this.IssueCommentNetworkDAO,
          url: 'https://www.googleapis.com/projecthosting/v2/projects/' + this.projectName + '/issues'
        });

        return dao;
      },
      transient: true
    },
    {
      mode_: 'IntProperty',
      name: 'issueCount'
    },
    {
      name: 'url',
      defaultValueFn: function() { return this.baseURL + this.projectName; }
    },
    {
      name: 'timer',
      factory: function() { return this.X.Timer.create(); },
      transient: true
    },
    {
      name: 'syncManager',
      factory: function() {
        return this.X.SyncManager.create({
          syncInterval: 60*5,
          batchSize: 500,
          queryParser: QueryParser,
//          query: 'status=New,Accepted,Started OR\nupdated-after:today-60 OR\nis:starred',
          srcDAO: this.IssueNetworkDAO,
          dstDAO: this.IssueCachingDAO,
          lastModified: new Date(2014,01,01),
          modifiedProperty: QIssue.MODIFIED
        });
      }
    }
  ],

  listeners: [
    {
      model_: 'Method',
      name: 'onDAOUpdate',
      isAnimated: true,
      code: function() {
        this.IssueMDAO.select(COUNT())(function (c) { this.issueCount = c.count; }.bind(this));
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.IssueDAO.listen(this.onDAOUpdate);
    },

    /** Open a Browser in a Window for a Chome Packaged App. **/
    launchBrowser: function(opt_url) {
      var self = this;

      chrome.app.window.create('empty.html', {width: 1000, height: 800}, function(w) {
        w.contentWindow.onload = function() {
          var window = self.window = w.contentWindow;

          apar(
            arequire('GridView'),
            arequire('QIssueTileView'),
            arequire('Browser'),
            arequire('QIssueDetailView'),
            arequire('QIssueCommentCreateView'),
            arequire('QIssueCommentView'),
            arequire('QIssueCommentAuthorView'),
            arequire('QIssueCommentUpdateView'),
            arequire('ConfigureProjectsView'),
            arequire('QIssueStatus'),
            arequire('QIssueLabel'),
            arequire('QIssuePerson')
          )(function () {
            $addWindow(window);
            var Y = self.X.subWindow(window, 'Browser Window');
            var b = Y.ChromeAppBrowser.create({project: self});
            window.browser = b; // for debugging
            BROWSERS.push(b); // for debugging
            w.browser = b;
            window.document.firstChild.innerHTML = b.toHTML();
            b.initHTML();
            if ( opt_url ) b.maybeImportCrbugUrl(opt_url);
            w.focus();
            metricsSrv.sendAppView('Browser');
          });
        };

        w.onClosed.addListener(function() {
          $removeWindow(self.window);
          // for debugging
          BROWSERS.deleteI(self.window);
        });
      });
    },

    /** Create a Browser for use in a hosted app. **/
    createBrowser: function(window) {
      var b = this.X.Browser.create({project: this, window: window});
      window.browser = b;
      return b;
    },

    editIssue: function(id) {
      if ( ! id ) return;
      var self = this;
      this.IssueDAO.find(id, {
        put: function(obj) {
          chrome.app.window.create('empty.html', { width: 1000, height: 800 }, function(w) {
            $addWindow(w.contentWindow);
            w.onClosed.addListener(function() {
              $removeWindow(w.contentWindow)
            });
            w.contentWindow.onload = function() {
              var window = w.contentWindow;

              var Y = self.X.subWindow(window);

              apar(
                arequire('QIssueDetailView'),
                arequire('QIssueCommentCreateView'),
                arequire('QIssueCommentView'),
                arequire('QIssueCommentAuthorView'),
                arequire('QIssueCommentUpdateView')
              )(function() {
                  var v = Y.QIssueDetailView.create({
                    value: SimpleValue.create(obj),
                    QIssueCommentDAO: self.issueCommentDAO(id),
                    QIssueDAO: self.IssueDAO,
                    mode: 'read-write',
                    url: self.url
                  }).addDecorator(Y.QIssueEditBorder.create());

                  window.document.body.innerHTML = v.toHTML();
                  v.initHTML();
                  w.focus();
                });
            };
          });
        }
      });
    },

    launchSync: function() {
      var self = this;

      chrome.app.window.create('empty.html', {width: 600, height: 600}, function(w) {
        var window = w.contentWindow;
        w.contentWindow.onload = function() {
          $addWindow(window);
          var b = DetailView.create({
              model: SyncManager,
              title: '<img style="vertical-align:bottom;" src="images/refresh.png"> Sync Config: ' + self.projectName,
              value: SimpleValue.create(self.syncManager),
              showActions: true });
          window.document.body.innerHTML = '<div>' + b.toHTML() + '</div>';
          b.initHTML();
          var extrax = window.outerWidth - window.innerWidth + 16;
          var extray = window.outerHeight - window.innerHeight + 16;

          window.resizeTo(
            window.document.body.firstChild.firstChild.firstChild.offsetWidth + extrax,
            window.document.body.firstChild.offsetHeight + extray);
          window.resizeTo(
            window.document.body.firstChild.firstChild.firstChild.offsetWidth + extrax,
            window.document.body.firstChild.offsetHeight + extray);
          w.focus();
        };
        w.onClosed.addListener(function() {
          $removeWindow(window);
        });
      });
    },

    launchConfigProjects: function() {
      var self = this;

      chrome.app.window.create('empty.html', {width: 430, height: 440}, function(w) {
        var window = w.contentWindow;
        w.contentWindow.onload = function() {
          $addWindow(window);

          var view = ConfigureProjectsView.create({ model: QUser });
          view.value.set(self.user);

          window.document.body.innerHTML = view.toHTML();
          view.initHTML();

          w.focus();
        };
        w.onClosed.addListener(function() {
          $removeWindow(window);
        });
      });
    },

    issueCommentDAO: function(id) {
      return this.IssueCommentDAO.where(EQ(QIssueComment.ISSUE_ID, id));
    }
  },

});
