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

var Project = Model.create({
  name: 'Project',

  tableProperties: [
    'projectName',
    'baseURL'
  ],

  properties: [
    {
      name: 'baseURL',
      defaultValue: 'https://code.google.com/p/'
    },
    {
      name: 'projectName',
      defaultValue: 'foam-framework'
    },
    {
      name: 'IssueDAO',
      valueFactory: function() {
        var IssueMDAO  = MDAO.create({model: CIssue})
          .addIndex(CIssue.ID)
          .addIndex(CIssue.PRIORITY)
          .addIndex(CIssue.MILESTONE)
          .addIndex(CIssue.ITERATION)
          .addIndex(CIssue.RELEASE_BLOCK)
          .addIndex(CIssue.CATEGORY)
          .addIndex(CIssue.STATUS)
          .addIndex(CIssue.OWNER)
          .addIndex(CIssue.SUMMARY)
          .addIndex(CIssue.OS)
          .addIndex(CIssue.UPDATED);
        
        var IssueIDBDAO = IDBDAO.create({
          model: CIssue,
          name: this.projectName + '_' + CIssue.plural
        });

        return CachingDAO.create(IssueMDAO, IssueIDBDAO);
      },
      transient: true
    },
    {
      name: 'IssueNetworkDAO',
      valueFactory: function() {
        return IssueRestDAO.create({
          url: 'https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/' + this.projectName + '/issues',
          model: CIssue
        });
      },
      transient: true
    },
    {
      name: 'IssueCommentNetworkDAO',
      valueFactory: function() {
        var dao = RestDAO.create({
          url: 'https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/' + this.projectName + '/issues',
          model: IssueComment
        });

        dao.buildURL = function(options) {
          return this.url + options.query.arg2.f() + '/comments';
        };

        dao.jsonToObj = function(json) {
          if ( json.author ) json.author = json.author.name;
          
          return this.model.create(json);
        };

        return dao;
      },
      transient: true
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
          srcDAO: this.IssueNetworkDAO,
          dstDAO: this.IssueDAO,
          lastModified: new Date(2011,01,01),
          modifiedProperty: CIssue.UPDATED
        });
      }
    }
  ],

  methods: {
    /** Open a Browser in a Window for a Chome Packaged App. **/ 
    launchBrowser: function() {
      var self = this;

      chrome.app.window.create('empty.html', {width: 1000, height: 800}, function(w) {
        w.contentWindow.onload = function() {
          var window = self.window = w.contentWindow;
          apar(
            arequire('GridView'),
            arequire('CIssueTileView'),
            arequire('Browser')
          )(function () {
            $addWindow(window);
            var b = ChromeAppBrowser.create({project: self, window: window});
            window.browser = b; // for debugging
            w.browser = b;
            window.document.body.innerHTML = b.toHTML();
            b.initHTML();
            w.focus();
          });
        };
        w.onClosed.addListener(function() {
          $removeWindow(self.window);
        });
      });
    },

    /** Create a Browser for use in a hosted app. **/
    createBrowser: function(window) {
      var b = Browser.create({project: this, window: window});
      window.browser = b;
      return b;
    }
  }
});
