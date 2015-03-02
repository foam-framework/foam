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
  name: 'Browser',
  package: 'foam.apps.quickbug.ui',

  extendsModel: 'foam.ui.View',

  requires: [
    'AlternateView',
    'ToolbarView',
    'StaticHTML',
    'Action',
    'CursorView',
    'foam.ui.RelationshipView',
    'foam.apps.quickbug.model.Location',
    'foam.apps.quickbug.dao.QIssuesSplitDAO',
    'Timer',
    'foam.ui.TextFieldView',
    'foam.ui.ChoiceView',
    'foam.ui.ChoiceListView',
    'foam.ui.PopupChoiceView',
    'PopupView',
    'foam.ui.ImageView',
    'MementoMgr',
    'foam.lib.bookmarks.AddBookmarkDialog',
    'foam.lib.bookmarks.Bookmark',
    'foam.apps.quickbug.ui.QIssueCreateView',
    'foam.apps.quickbug.ui.QIssueDetailView',
    'foam.apps.quickbug.ui.QIssuePreviewBorder',
    'foam.core.dao.WaitCursorDAO'
  ],

  exports: [
    'as stack',
    'as browser',
    'IssueDAO'
  ],

  imports: [
    'metricsService',
    'document'
  ],

  properties: [
    'project',
    'previewID',
    'favouritesMenu',
    'createMenu',
    {
      name: 'qbug',
      scope: 'project',
      defaultValueFn: function() { return this.project.qbug; }
    },
    {
      name: 'location',
      factory: function() { return this.Location.create(); }
    },
    {
      name: 'memento',
      help: 'A String representation of the current Location.',
      defaultValue: 'mode=list',
      postSet: function (oldValue, newValue) {
        if ( oldValue === newValue ) return;
        // console.log('************** MEMENTO: ', newValue);
        // console.log('****** LOCATION: ', this.location.toJSON());
        if ( newValue !== oldValue ) this.location.fromMemento(this, newValue);
     }
    },
    {
      name: 'projectName',
      scope: 'project',
      defaultValueFn: function() { return this.project.projectName; }
    },
    {
      name: 'summary',
      scope: 'project',
      defaultValueFn: function() { return this.project.summary; }
    },
    {
      name: 'url',
      scope: 'project',
      defaultValueFn: function() { return this.project.url; }
    },
    {
      name: 'IssueDAO',
      factory: function() {
        return this.QIssuesSplitDAO.create({
          local: this.project.IssueDAO,
          model: this.X.QIssue,
          remote: this.project.IssueNetworkDAO
        });

        return this.project.IssueDAO;
        return this.WaitCursorDAO.create({
          delegate: this.project.IssueDAO,
          window:   this.X.window
        });
      }
    },
    {
      name: 'bookmarkDAO',
      scope: 'project',
      defaultValueFn: function() { return this.project.bookmarkDAO; }
    },
    {
      name: 'bookmarksMenu',
      factory: function() {
        var self = this;
        var Y = this.Y.sub();
        Y.registerModel(Model.create({
          name: 'ChoiceListView',
          extendsModel: 'ChoiceListView',
          methods: {
            choiceToHTML: function(id, choice) {
              var id2 = this.nextID();
              this.on('click', function() {
                self.bookmarkDAO.remove(choice[2]);
              }, id2);
              return '<li style="display:flex;" class="choice"><span style="width:100%;" id="' + id + '">' + choice[1] + '</span><span id="' + id2 + '" class="DeleteBookmark">X</span></li>';
            }
          }
        }));

        // TODO: this was a bad idea to make this a ChoiceView because
        // it only fires events when the data changes, not when you select
        // an item like a regular menu.  Make into something else.
        var v = Y.PopupChoiceView.create({
          autoSetData: false,
          objToChoice: function(b) { return [b.url, b.title, b]; },
          dao: this.bookmarkDAO,
          linkLabel: 'Bookmarks &#x25BE;',
          extraClassName: 'bookmarks-menu'
        }, Y);
        v.data = 'dummy';
        v.data$.addListener(function() {
          if ( v.data ) self.memento = v.data;
          v.data = '';
        });
        return v;
      }
    },
    {
      model_: 'DAOProperty',
      name: 'filteredIssueDAO',
      onDAOUpdate: 'onDAOUpdate'
    },
    {
      name: 'syncManagerFuture',
      scope: 'project',
      defaultValueFn: function() { return this.project.syncManagerFuture; }
    },
    {
      name: 'zoom',
      help: 'Zoom ratio of Browser contents.',
      defaultValue: '1',
      postSet: function() { this.updateZoom(); }
    },
    {
      name: 'rowSelection',
      postSet: function(_, issue) { this.location.id = issue.id; }
    },
    {
      name: 'timer',
      factory: function() { return this.Timer.create(); }
    },
    {
      mode_: 'IntProperty',
      name: 'issueCount'
    },
    {
      mode_: 'IntProperty',
      name: 'selectedIssueCount'
    },
    {
      name: 'countField',
      type: 'TextFieldView',
      factory: function() {
        return this.TextFieldView.create({
          name: 'count',
          className: 'qbugCount',
          mode: 'read-only',
          displayWidth: 40
        });
      }
    },
    {
      name: 'view',
      factory: function() {
        var view = createView(this.rowSelection$, this);
        view.choice$ = this.location.mode$;
        return view;
      }
    },
    {
      name: 'searchChoice',
      factory: function() {
        var open = this.project.openPredicate;

        return this.ChoiceView.create({
          helpText: 'Search within:',
          data$: this.location.can$,
          choices: [
            ['',                     '&nbsp;All issues',              1],
            [open,                   '&nbsp;Open issues',             2],
            [open + ' owner=me',     '&nbsp;Open and owned by me',    3],
            [open + ' reporter=me',  '&nbsp;Open and reported by me', 4],
            [open + ' is:starred',   '&nbsp;Open and starred by me',  5],
            [open + ' commentby:me', '&nbsp;Open and comment by me',  8],
            ['status=New',           '&nbsp;New issues',              6],
            ['status=Fixed,Done',    '&nbsp;Issues to verify',        7]
          ]});
      }
    },
    {
      name: 'searchField',
      factory: function() { return this.TextFieldView.create({
        name: 'search',
        type: 'search',
        displayWidth: 5
      });}
    },
    {
      name: 'refreshImg',
      factory: function() {
        return this.ImageView.create({data: 'images/refresh.png'});
      }
    },
    {
      name: 'logo',
      factory: function() {
        return this.ImageView.create({data: this.url + '/logo'});
      }
    },
    {
      name: 'legacyUrl',
      getter: function() {
        return this.url + '/issues/' + ( this.location.id ?
          'detail?' + this.location.toURL(this) :
          'list?'   + this.location.toURL(this) );
      }
    },
    {
      name: 'mementoMgr',
      factory: function() { return this.MementoMgr.create({memento: this.memento$}); }
    }
  ],

  listeners: [
    {
      name: 'onSearch',
      code: function(_,_,_,q) {
        if ( ! this.maybeSetLegacyUrl(q) ) this.location.q = q;
      }
    },
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function(evt) {
        var self = this;
        this.view.dao.select(COUNT())(function (c) { self.selectedIssueCount = c.count; });
      }
    },
    {
      name: 'onSyncManagerUpdate',
      isFramed: true,
      code: function(evt) {
        this.syncManagerFuture.get(function(syncManager) {
          if ( syncManager.isSyncing ) {
            this.timer.step();
            this.timer.start();
          } else {
            // Let the timer run for a bit longer so that people can see
            // that it's doing something.
            this.X.setTimeout(this.timer.stop.bind(this.timer), 1000);
          }
        }.bind(this));
      }
    },
    {
      name: 'keyPress',
      code: function(e) {
        if ( e.ctrlKey ) {
          if ( e.keyCode == 189 ) this.zoomOut();
          if ( e.keyCode == 187 ) this.zoomIn();
        }
      }
    },
    {
      name: 'performQuery',
      isMerged: 1,
      code: function(evt) {
        this.search(AND(
          this.X.QueryParser.parseString(this.location.can) || TRUE,
          this.X.QueryParser.parseString(this.location.q) || TRUE
        ).partialEval());
        this.metricsService.sendEvent('Browser', 'Query');
      }
    },
    {
      name: 'onLocationUpdate',
      isMerged: 2,
      code: function(evt) {
        this.memento = this.location.toMemento(this);
        if ( this.location.createMode ) {
          this.createIssue(this.location.createIssueTemplate);
        } else if ( this.location.id ) {
          this.editIssue(this.location.id);
        } else if ( this.issueMode_ ) {
          // Unselect the current row so that it can be selected/edit again.
          this.rowSelection = '';
          this.back();
        }
      }
    },
  ],

  actions: [
    // TODO: register keyboard bindings for actions
    {
      name:  'zoomIn',
      action: function() { this.zoom *= 1.1; }
    },
    {
      name:  'zoomOut',
      action: function() { this.zoom *= 0.9; }
    },
    {
      name: 'zoomReset',
      action: function() { this.zoom = 1.0; }
    },
    {
      name: 'link',
      label: '',
      iconUrl: 'images/link.svg',
      help:  'Link to code.google.com',
      action: function() {
        var url = this.legacyUrl;
        console.log(url);
        this.openURL(url);
      }
    },
    {
      name: 'launchBrowser',
      action: function() { this.project.launchBrowser(); }
    },
    {
      name:  'launchSync',
      label: 'Sync Status',
      action: function() { this.project.launchSync(); }
    },
    {
      name: 'favourites',
      label: 'Projects &#x25BE;',
      action: function() {
        if ( this.favouritesMenu ) {
          this.favouritesMenu.close();
          return;
        }

        var view = this.ToolbarView.create({
          horizontal: false,
          data: this
        });

        view.addChild(this.StaticHTML.create({ content: '<b>Projects</b>' }));
        view.addActions(
          this.project.user.preferredProjects.map(function(p) {
            return Action.create({
              name: p,
              action: function() {
                this.qbug.launchBrowser(p);
              }
            });
          }));

        view.addSeparator();
        view.addAction(this.model_.FIND_PROJECTS);
        view.addAction(this.model_.CREATE_PROJECT);

        view.addSeparator();
        view.addAction(this.model_.CONFIG_PROJECTS);

        view.left = this.favouritesView.$.offsetLeft;
        view.top = this.favouritesView.$.offsetTop + this.favouritesView.$.offsetHeight;
        view.openAsMenu();

        var self = this;
        view.subscribe('close', function() {
          self.favouritesMenu = '';
        });

        this.favouritesMenu = view;
      }
    },
    {
      name: 'findProjects',
      label: 'Find open source projects...',
      action: function() { this.openURL('https://code.google.com/hosting/'); }
    },
    {
      name: 'createProject',
      label: 'Create a project...',
      action: function() { this.openURL('https://code.google.com/hosting/createProject'); }
    },
    {
      name: 'configProjects',
      label: 'Configure projects...',
      action: function() { this.project.launchConfigProjects(); }
    },
    {
      name: 'addBookmark',
      iconUrl: 'images/star_off.gif',
      label: '',
      help: 'Create Bookmark',
      action: function() {
        var anchor = this.addBookmarkView.$;
        var view   = this.AddBookmarkDialog.create({
          dao: this.bookmarkDAO,
          data: this.Bookmark.create({url: this.memento})
        });

        anchor.insertAdjacentHTML('beforebegin', view.toHTML());
        view.$.style.left = 200; // x + anchor.offsetLeft;
        view.$.style.top  = 200; // y + anchor.offsetTop;
        view.initHTML();
      }
    },
    {
      name: 'changeUser',
      help: 'Change the current user.',
      labelFn: function() { return XMLUtil.escape(this.project.user.email); },
      action: function() {
        var self = this;
        this.qbug.authAgent2.refresh(function() {
          self.qbug.refreshUser();
          self.syncManagerFuture.get(function(m) { m.doReset(function() { m.start(); }) });
        }, true);
      }
    },
    {
      name: 'newIssue',
      label: 'New issue &#x25BE;',
      action: function() {
        if ( this.createMenu ) {
          this.createMenu.close();
          return;
        }

        var view = this.ToolbarView.create({
          horizontal: false,
          data: this
        });

        var self = this;

        view.addChild(this.StaticHTML.create({ content: '<b>Templates</b>' }));
        view.addActions(
          this.project.project.issuesConfig.prompts.map(function(c) {
            return self.Action.create({
              name: c.name,
              action: function() {
                self.location.createIssueTemplate = c.name;
                self.location.createMode = true;
              }
            });
          }));

        view.left = this.newIssueView.$.offsetLeft;
        view.top = this.newIssueView.$.offsetTop + this.newIssueView.$.offsetHeight;
        view.openAsMenu();

        view.subscribe('close', function() {
          self.createMenu = '';
        });

        this.createMenu = view;
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.memento = '';

      this.location.y = this.X.QIssue.OWNER;
      this.location.x = this.X.QIssue.STATUS;

      this.searchField.data$.addListener(this.onSearch);
      Events.follow(this.location.q$, this.searchField.data$);

      Events.follow(this.project.issueCount$, this.issueCount$);

      this.X.dynamic(
        function() { this.issueCount; this.selectedIssueCount; }.bind(this),
        function() {
          this.countField.data =
            this.selectedIssueCount.toLocaleString() + ' selected of ' + this.issueCount.toLocaleString();
        }.bind(this));

      this.location.q$.addListener(this.performQuery);
      this.location.can$.addListener(this.performQuery);

      // Warp mode currently only makes sense when looking at pie-charts, so if the user
      // switches to warp mode then switch to pie(status) if they didn't already have a pie
      // cell type selected.
      this.location.scroll$.addListener(function() {
        if ( this.location.scroll === 'Warp' ) {
          if ( this.location.cells.indexOf('pie') == -1 ) this.location.cells = 'pie(status)';
        }
      }.bind(this));
      this.location.cells$.addListener(function() {
        if ( this.location.cells.indexOf('pie') == -1 ) this.location.scroll = 'Bars';
      }.bind(this));

      this.syncManagerFuture.get((function(syncManager) {
        this.refreshImg.$.onclick = syncManager.forceSync.bind(syncManager);
      }).bind(this));

      this.location.addListener(this.onLocationUpdate);

      var timer = this.timer;
      timer.i$.addListener(function() {
        if ( ! this.refreshImg.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        this.refreshImg.$.style.webkitTransform = 'rotate(' + timer.i + 'deg)';
      }.bind(this));

      this.document.addEventListener('mousemove', (function(evt) {
        if ( this.currentPreview && ! this.currentPreview.$.contains(evt.target) && ! this.view.$.contains(evt.target) ) {
          this.preview(null);
        }
      }).bind(this));

      this.searchChoice.choice = this.searchChoice.choices[1];

      this.document.addEventListener('keyup', this.keyPress);

      this.IssueDAO.listen(this.onDAOUpdate);
      this.onDAOUpdate();

      this.syncManagerFuture.get((function(syncManager) {
        syncManager.isSyncing$.addListener(this.onSyncManagerUpdate);
      }).bind(this));

      this.onSyncManagerUpdate();

      this.bookmarkDAO.find(EQ(this.Bookmark.TITLE, 'Default'), {
        put: function(bookmark) {
          this.memento = bookmark.url;
          this.performQuery();
        }.bind(this),
        error: function () {
          this.performQuery();
        }.bind(this)
      });
    },

    createIssue: function(opt_templateName) {

      if ( opt_templateName ) {
        for ( var i = 0, prompt; prompt = this.project.project.issuesConfig.prompts[i]; i++ ) {
          if ( prompt.name !== opt_templateName ) continue;
          var data = this.X.QIssue.create({
            labels: prompt.labels,
            status: prompt.status,
            summary: prompt.title,
            description: prompt.description
          }, this.Y);
          break;
        }
      }

      if ( ! data ) {
          data = this.X.QIssue.create({
            description: multiline(function(){/*What steps will reproduce the problem?
1.
2.
3.
What is the expected output? What do you see instead?

Please use labels and text to provide additional information.
*/}),
            status: 'New',
            summary: 'Enter a one-line summary.'
          }, this.Y);
      }


      var v = this.QIssueCreateView.create({
          data: data,
          mode: 'read-write'
      });
      this.pushView(v);
    },

    editIssue: function(id) {
      if ( ! id ) return;

      var self = this;

      this.IssueDAO.find(id, {
        put: function(obj) {
          self.QIssueDetailView.create({
            data:             obj,
            mode:             'read-write',
            url:              self.url,
            issueDAO:         self.IssueDAO,
            cursorIssueDAO:   self.location.sort ?
              self.filteredIssueDAO.orderBy(self.location.sort) :
              self.filteredIssueDAO
          }, self.Y);
          self.pushView(v);
        }
      });
    },

    pushView: function(view) {
      this.issueMode_ = true;

      var stack = this.$.querySelector('.stack');
      this.$.querySelector('.header').style.display = 'none';
      this.$.querySelector('.BrowserView').style.display = 'none';
      stack.style.display = '';

      stack.innerHTML = view.toHTML();
      view.initHTML();
    },

    back: function() {
      this.issueMode_ = false;

      var stack = this.$.querySelector('.stack');
      this.$.querySelector('.header').style.display = '';
      this.$.querySelector('.BrowserView').style.display = '';
      stack.style.display = 'none';

      stack.innerHTML = '';
    },

    /** Open a preview window when the user hovers over an issue id. **/
    preview: function(e, id) {
      if ( id === this.previewID ) return;
      if ( this.currentPreview ) this.currentPreview.close();
      this.previewID = id;
      if ( ! id ) {
        this.currentPreview = null;
        return;
      }

      var self = this;
      this.IssueDAO.find(id, {
        put: function(obj) {
          obj = obj.clone();
          var HEIGHT = 400;
          var screenHeight = self.view.$.ownerDocument.defaultView.innerHeight;

          var v = self.QIssueDetailView.create({
            data: obj,
            QIssueDAO: self.IssueDAO,
            mode: 'read-only',
            url: self.url
          }).addDecorator(self.QIssuePreviewBorder.create());

          var popup = self.currentPreview = self.PopupView.create({
            x: e.x + 25,
            y: Math.min(
              screenHeight-HEIGHT-180,
              Math.max(
                70,
                Math.min(screenHeight-HEIGHT-180, e.y - HEIGHT/2))),
            height: HEIGHT,
            view: v
          });

          popup.open(self.view);
        }
      });
    },

    // return true iff url was a legacy URL
    maybeSetLegacyUrl: function(url) {
      var regex = new RegExp("https?://code.google.com/p/([^/]+)/issues/[^\?]*(\\?(.*))?");
      var match = regex.exec(url);

      if ( ! match ) return false;

      var project = match[1];
      var params  = match[3];

      if ( project == this.projectName ) {
        this.location.fromURL(this, params);
      } else {
        this.location.q = '';
        this.qbug.launchBrowser(project, url)
      }

      return true;
    },

    updateZoom: function() {
      this.document.body.style.zoom = this.zoom;
      this.layout();
    },

    /** Filter data with the supplied predicate, or select all data if null. **/
    search: function(p) {
      if ( p ) {
        p = p.partialEval();
        console.log('SEARCH: ', p.toSQL());
      }
      this.filteredIssueDAO = p ? this.IssueDAO.where(p) : this.IssueDAO;
    },

    openURL: function(url) {
      this.document.location = url;
    }
  },

  templates: [
    function toHTML() {/*
<%
  var X = this.Y;
  var manifest = chrome.runtime.getManifest();
  var browserLink  = X.ActionLink.create(  {action: this.model_.LAUNCH_BROWSER, data: this});
  var linkButton   = X.ActionButton.create({action: this.model_.LINK,           data: this});
  var syncLink     = X.ActionLink.create(  {action: this.model_.LAUNCH_SYNC,    data: this});
  var backButton   = X.ActionButton.create({action: MementoMgr.BACK,            data: this.mementoMgr});
  var forthButton  = X.ActionButton.create({action: MementoMgr.FORTH,           data: this.mementoMgr});
%>
<head>
  <link rel="stylesheet" type="text/css" href="foam.css" />
  <link rel="stylesheet" type="text/css" href="../../core/foam.css" />
  <link rel="stylesheet" type="text/css" href="qbug.css" />
  <title>QuickBug</title>
</head>
<body id="{{this.id}}" class="column"><div class="column expand" style="height:100%;">
 <div class="topHeader row" style="align-items:center;">
  <%= backButton, forthButton %> %%refreshImg <span class="expand"></span> <span>$$newIssue{model_: 'ActionLink'} | $$changeUser{model_: 'ActionLink'} | $$favourites{model_: 'ActionLink'} | %%bookmarksMenu | <%= syncLink %> | <%= browserLink %> |<%= linkButton %></span>
 </div>
 <div class="stack" style="display:none;">
 </div>
 <div class="header row" style="align-items:baseline;">
  <span class="logo">%%logo</span>
  <div>
    <span class="title">%%projectName</span>
    <div class="subtitle">%%summary</div>
  </div>
  <span style="width:60px;flex-shrink:10000"></span>
  <span>Search %%searchChoice for </span>
  <span class="expand" style="padding-left:4px;">%%searchField</span> $$addBookmark
  <span class="link" style="align-self:center;"> &nbsp; <a target="_blank" href="<%= this.url %>/issues/searchtips">Search&nbsp;tips</a></span>
 </div>
 <div class="BrowserView expand column">%%view</div>
 <div class="footer"><%= FOAM_POWERED %> <span class="appName"><%= manifest.name %> v<%= manifest.version%></span></div>
</div></body>
*/}]
});
