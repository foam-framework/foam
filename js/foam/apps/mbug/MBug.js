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
  extendsModel: 'foam.ui.View',
  description: 'Mobile QuickBug',

  requires: [
    'foam.ui.md.ResponsiveAppControllerView',
    'foam.ui.md.AppController',
    'foam.core.dao.SplitDAO',
    'foam.apps.mbug.ui.ChangeProjectView',
    'foam.ui.DetailView',
    'foam.input.touch.GestureManager',
    'foam.apps.mbug.ui.IssueCitationView',
    'foam.apps.mbug.ui.IssueView',
    'foam.apps.quickbug.model.DefaultQuery',
    'foam.apps.quickbug.model.QBug',
    'foam.oauth2.AutoOAuth2',
    'foam.ui.StackView',
    'foam.input.touch.TouchManager',
    'IDBDAO',
    'foam.core.dao.KeywordDAO',
    'DAOVersion',
    'ContextualizingDAO',
    'foam.core.dao.CloningDAO',
    'com.google.analytics.WebMetricsReportingDAO',
    'foam.metrics.Metric',
    'foam.oauth2.OAuth2WebClient'
  ],

  traits: ['foam.ui.layout.PositionedDOMViewTrait'],

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
        return this.WebMetricsReportingDAO.create({
          propertyId: 'UA-47217230-4',
          clientId: '1',
          appName: 'MBug',
          appVersion: '1.0.7'
        })
      }
    },
    {
      model_: 'BooleanProperty',
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
      this.qbug.userFuture.get(function(user) {
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
    function CSS() {/*
html, body { overflow: initial; }

.actionButton-enterSearchMode {
  margin: 4px 0;
}

.issue-citation {
  display: flex;
  margin: 0;
  padding: 16px 4px 10px 16px;
}

.issue-citation .priority {
  margin-top: 16px;
}

.issue-citation .middle {
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
  line-height: 20px;
}

.issue-citation .priority-0 {
  color: #DB4437;
}

.issue-citation .priority-1 {
  color: #F4B400;
}

.issue-citation .priority-2 {
  color: #4285F4;
}

.issue-citation .priority-3 {
  color: #0F9D58;
}

.issue-citation .id {
  font-size: 1.5em;
  font-weight: 400;
}

.issue-edit {
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.issue-edit .priority {
  border-radius: 2px;
  color: white;
  font-size: 11px;
  font-weight: 700;
  margin: 4px 24px 4px 2px;
  margin-right: 24px;
  padding: 2px 2px 0 0;
  text-align: center;
  width: 20px;
  height: 20px;
}

.issue-edit .priority-0 {
   background: #DB4437;
}

.issue-edit .priority-1 {
   background: #F4B400;
}

.issue-edit .priority-2 {
   background: #4285F4;
}

.issue-edit .priority-3 {
   background: #0F9D58;
}

.issue-edit span[name=id] {
  font-weight: bold;
}

.issue-edit .popupChoiceView {
  display: flex;
  flex: 1 0 auto;
  align-items: center;
}

.issue-edit .header {
  background: #3e50b4;
  display: block;
  height: initial;
  flex-shrink: 0;
  width: 100%;
  -webkit-transform: translate3d(0,0,10px);
  box-shadow: 0 1px 1px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.15);
}

.issue-edit .body {
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.issue-edit .body-scroller {
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  flex-grow: 1;
}

.issue-edit .title {
  color: #fff;
  font-size: 20px;
  line-height: 28px;
  margin-bottom: 8px;
  min-height: 80px;
  padding: 0px 16px;
  word-wrap: break-word;
}

.issue-edit .toolbar {
  display: flex;
  padding: 4px;
}

.issue-edit .actionButton-cancel, .issue-edit .actionButton-back, .issue-edit .actionButton-save {
  padding: 0;
}

.issue-edit .separator {
  border-top: 1px solid rgba(0,0,0,.1);
  margin-bottom: 16px;
}

.issue-edit .separator1 {
  margin-top: 8px;
}

.issue-edit .choice {
  font-size: 32px;
  display: flex;
  align-items: center;
  padding-left: 16px;
}

.email-photo {
  overflow: hidden;
  width: 80px;
  height: 80px;
  border-radius: 50px;
  border: 1px solid;
}

.actionButton-back {
  width: 48px;
  height: 48px;
}

.actionButton {
  padding: 8px;
  vertical-align: middle;
  background: #3e50b4;
  border: none;
  -webkit-box-shadow: none;
  box-shadown: none;
  opacity: 0.76;
  outline: none;
}

.actionButton:hover, .popupChoiceView:hover img, .mbug .header .popupChoiceView:hover {
  background: #0F9D58;
  border-radius:100px;
}

.popupChoiceView {
  padding: 0;
  margin-left: 0;
  outline: none;
  opacity: 0.76;
  background: transparent;
}

.popupChoiceView .value {
  align-items: center;
  color: #222;
  display: flex;
  flex: 1 0 auto;
  font-family: Roboto;
  font-size: 16px;
  margin-left: 0;
  text-align: left;
}

.popupChoiceView img, .actionButton img {
  height: 24px;
  opacity: 0.76;
  width: 24px;
}

.popupChoiceList {
  box-shadow: 0 0 2px 2px rgba(0,0,0,.1), 0 0 3px 1px rgba(0,0,0,.1);
  border: none;
  border-radius: 2px;
  padding: 8px 0;
  min-width: 190px;
}

.popupChoiceList li {
  color: rgba(0, 0, 0, 0.54);
  font-size: 16px;
  padding: 16px;
  margin: 0;
  line-height: 16px;
}

.popupChoiceList li.selected {
  color: #3e50b4;
}

.star {
  vertical-align: middle;
  opacity: 0.76;
  width: 24px;
  height: 24px;
  margin: 12px;
}

.owner-name.placeholder {
  color: #b2b2b2
}

.issue-edit .owner-name {
  font-size: 16px;
  line-height: 32px;
  margin-left: 0;
  flex: 1 0 auto;
}

.issue-citation span[name=id] {
  font-size: larger;
  color: #444;
  font-size: 16px;
}

.issue-citation .priority {
  font-size: larger;
  font-size: 16px;
  margin-left: 8px;
}

.issue-citation span[name=summary] {
  color: #999;
  display: block;
  font-size: 14px;
  height: 40px;
  margin-top: 0;
  overflow: hidden;
}

input[name=q]:focus {
  outline: none;
  opacity: 0.76;
}

input[name=q]::-webkit-input-placeholder {
  font-size: 20px;
  color: white;
  opacity: 0.76;
  height: 55px;
}

::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.actionButton-leaveSearchMode {
  margin: 4px;
}

.actionButton-leaveSearchMode img {
  margin: 4px;
  opacity: 0.76;
}

select[name=sortOrder] {
  align-self: center;
  margin: 20px;
}

.mbug {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mbug .header {
  display: flex;
  background: #3e50b4;
  padding: 0;
}

.mbug .header .default {
  flex: 1.0;
  display: flex;
}

.mbug.searchMode .header .default {
  display: none;
}

.mbug:not(.searchMode) .header .search {
  display: none;
}

.mbug.searchMode .header .search {
  display: inherit;
  height: 56px;
}

.swipeAltOuter {
  flex-grow: 1;
}

.stackview {
  height: 100%;
}

.stackview table {
  height: 100%;
}

.stackview_navbar {
  display: none;
}

.stackview_navactions {
  display: none;
}

.stackview-previewarea-td {
  display: none;
}

.stackview-viewarea {
  height: 100%;
}

.actionButton-back:hover, .actionButton-cancel:hover, .actionButton-save:hover {
  background: #0F9D58;
  border-radius:100px;
}

.actionButton-save:disabled, .actionButton-back:disabled, .actionButton-cancel:disabled {
  display: none;
}

.actionButton-save {
  border: none;
  margin-right: 40px;
}

.status-icon {
  height: 24px;
  margin: 0 24px 0 0;
  opacity: 0.54;
  padding: 2px;
  width: 24px;
}

select[name=pri], select[name=status] {
  background: white;
  border-color: white;
  width: 250px;
  height: 30px;
  margin-left: 30px;
  margin-top: 16px;
  outline: none;
}

.comment-view .published {
  color: #999;
}

.comment-view {
  display: flex;
  margin-right: 35px;
  margin-bottom: 25px;
}

.comment-view .content {
  color: #444;
  flex: 1;
  font-size: 14px;
  line-height: 20px;
  overflow: hidden;
}

.actionButton-changeProject {
  margin: 4px;
}

.mbug.searchMode .swipeAltHeader {
  display: none;
}

.swipeAltHeader {
  padding-left: 3px !important;
  height: 36px;
}

.swipeAltHeader li {
  font-size: 14px;
  opacity: 0.8;
  line-height: 46px;
  padding-bottom: 14px;
}

.swipeAltHeader .selected {
  border-bottom: 2px solid #ff3f80;
  color: white;
  font-weight: 500;
  opacity: 1;
}

ul.swipeAltHeader {
  background: #3e50b4;
  box-shadow: 0 1px 1px rgba(0,0,0,.25);
  color: white;
  height: 48px;
  margin: 0;
  overflow: hidden;
  padding: 0 0 0 56px;
}

.popupChoiceView, .actionButton {
  width: 48px;
  height: 48px;
  background: transparent;
}

.foamChoiceListView.horizontal .choice {
  padding: 14px 16px;
  margin: 0;
}

.stackview-slidearea {
   box-shadow: 1px 0px 1px 1px rgba(0,0,0,.2);
}

.issueOwnerEditView {
  height: 100%;
  background: #e1e1e1;
}

.issueOwnerEditView .header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #d2d2d2;
  background: #fff;
}

.issueOwnerEditView input {
  border: none;
  font-size: 17px;
  flex-grow: 1;
  margin: 0 0 0 12px;
  padding: 0;
}

.issueOwnerEditView input:focus {
  outline: none;
}

.issuePersonAutocompleteView {
  background: #fafafa;
  box-shadow: 2px 2px 1px grey;
}

.issuePersonAutocompleteView .row {
  padding: 6px 0 6px 12px;
}

.issueOwnerEditView .header .actionButton {
  flex-grow: 0;
  flex-shrink: 0;
}

.comment-view {
  margin-left: 16px;
}
*/}
  ]
});
