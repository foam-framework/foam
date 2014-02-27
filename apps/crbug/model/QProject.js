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

var QProject = Model.create({
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
      name: 'IssueCommentNetworkDAO',
      valueFactory: function() {
        return QIssueCommentNetworkDAO.create({
          model: QIssueComment,
          url: 'https://www.googleapis.com/projecthosting/v2/projects/' + this.projectName + '/issues',
        });
      }
    },
    {
      name: 'IssueMDAO',
      valueFactory: function() {
        var dao = MDAO.create({model: QIssue});
        var auto = AutoIndex.create(dao);

        auto.addIndex(QIssue.STATUS);
        dao.addRawIndex(auto);

        return dao;
      }
    },
    {
      name: 'IssueCachingDAO',
      valueFactory: function() {
        var IssueIDBDAO = IDBDAO.create({
          model: QIssue,
          name: this.projectName + '_' + QIssue.plural
        });

        return CachingDAO.create(this.IssueMDAO, IssueIDBDAO);
      },
      transient: true
    },
    {
      name: 'IssueNetworkDAO',
      valueFactory: function() {
        return IssueRestDAO.create({
          url: 'https://www.googleapis.com/projecthosting/v2/projects/' + this.projectName + '/issues',
          model: QIssue,
          batchSize: 500
        });
      },
      transient: true
    },
    {
      name: 'IssueDAO',
      valueFactory: function() {
        var dao = this.IssueMDAO;

        dao = QIssueSplitDAO.create({
          local: dao,
          model: QIssue,
          remote: this.IssueNetworkDAO
        });

        dao = ActionFactoryDAO.create({
          delegate: dao,
          actionDao: this.IssueCommentNetworkDAO
        });

        dao = QIssueStarringDAO.create({
          delegate: dao,
          project: this,
          url: 'https://www.googleapis.com/projecthosting/v2/projects/' + this.projectName + '/issues'
        });

        return dao;
      },
      transient: true
    },
    {
      mode_: 'IntegerProperty',
      name: 'issueCount'
    },
    {
      name: 'url',
      defaultValueFn: function() { return this.baseURL + this.projectName; }
    },
    {
      name: 'timer',
      valueFactory: function() { return Timer.create(); },
      transient: true
    },
    {
      name: 'syncManager',
      valueFactory: function() {
        return SyncManager.create({
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
      animate: true,
      code: function(evt) {
        var self = this;
        this.IssueMDAO.select(COUNT())(function (c) { self.issueCount = c.count; });
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
            arequire('QIssuePreviewView'),
            arequire('QIssueCommentView'),
            arequire('QIssueCommentAuthorView'),
            arequire('QIssueCommentUpdateView'),
            arequire('ConfigureProjectsView')
          )(function () {
            $addWindow(window);
            var b = ChromeAppBrowser.create({project: self, window: window});
            window.browser = b; // for debugging
            BROWSERS.push(b); // for debugging
            w.browser = b;
            window.document.firstChild.innerHTML = b.toHTML();
            b.initHTML();
            if ( opt_url ) b.maybeImportCrbugUrl(opt_url);
            w.focus();
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
      var b = Browser.create({project: this, window: window});
      window.browser = b;
      return b;
    },

    launchSync: function() {
      var self = this;

      chrome.app.window.create('empty.html', {width: 600, height: 600}, function(w) {
        var window = w.contentWindow;
        w.contentWindow.onload = function() {
          $addWindow(window);
          var b = ActionBorder.create(
            SyncManager,
            DetailView.create({
              model: SyncManager,
              title: '<img style="vertical-align:bottom;" src="images/refresh.png"> Sync Config: ' + self.projectName,
              value: SimpleValue.create(self.syncManager)}));
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
      return this.IssueCommentNetworkDAO.where(EQ(QIssueComment.ISSUE_ID, id));
    }
  },

});
