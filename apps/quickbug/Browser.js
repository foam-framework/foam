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

// Force installation of features.
MementoMgr.getPrototype();

MementoMgr.BACK.iconUrl = 'images/back.png';
MementoMgr.FORTH.iconUrl = 'images/forth.png';
MementoMgr.BACK.label = '';
MementoMgr.FORTH.label = '';
MementoMgr.BACK.help = '';
MementoMgr.FORTH.help = '';

FOAModel({
  name: 'Browser',

  extendsModel: 'AbstractView',

  properties: [
    'project',
    'previewID',
    'favouritesMenu',
    {
      name: 'qbug',
      scope: 'project',
      defaultValueFn: function() { return this.project.qbug; }
    },
    {
      name: 'location',
      factory: function() { return Location.create(); }
    },
    {
      name: 'memento',
      defaultValue: 'mode=list',
      postSet: function (oldValue, newValue) {
        // Avoid feedback by temporarily unsubscribing
        this.location.removeListener(this.onLocationUpdate);
        if ( newValue !== oldValue ) this.location.fromMemento(this, newValue);
        this.location.addListener(this.onLocationUpdate);
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
      name: 'userView',
      factory: function() {
        var view = ActionLink.create({
          action: this.model_.CHANGE_USER,
          value: SimpleValue.create(this),
        });
        view.className = view.className + ' tip-below';
        return view;
      }
    },
    {
      name: 'IssueDAO',
      scope: 'project',
      factory: function() {
        return WaitCursorDAO.create({
          delegate: this.project.IssueDAO,
          window:   this.X.window
        });
      }
    },
    {
      name: 'filteredIssueDAO',
      defaultValueFn: function() { return this.IssueDAO; },
      postSet: function(_, dao) {
        this.view.dao = dao;
        this.onDAOUpdate();
      }
    },
    {
      name: 'syncManager',
      scope: 'project',
      defaultValueFn: function() { return this.project.syncManager; }
    },
    {
      name: 'zoom',
      help: 'Zoom ratio of Browser contents.',
      defaultValue: '1',
      postSet: function() { this.updateZoom(); }
    },
    {
      name: 'rowSelection',
      factory: function() { return SimpleValue.create(); }
    },
    {
      name: 'timer',
      factory: function() { return Timer.create(); }
    },
    {
      mode_: 'IntegerProperty',
      name: 'issueCount'
    },
    {
      mode_: 'IntegerProperty',
      name: 'selectedIssueCount'
    },
    {
      name: 'countField',
      type: 'TextFieldView',
      factory: function() {
        return TextFieldView.create({
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
        var view = createView(this.rowSelection, this);
//        this.location.mode$ = view.choice$
        view.choice$ = this.location.mode$;
        return view;
      }
    },
    {
      name: 'searchChoice',
      factory: function() {
        var open = 'status=Accepted,Assigned,Available,New,Started,Unconfirmed,Untriaged';

        return ChoiceView.create({
          helpText: 'Search within:',
          data$: this.location.can$,
          choices:[
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
      factory: function() { return TextFieldView.create({
        name: 'search',
        displayWidth: 5,
        type: 'search',
        data$: this.location.q$ }); }
    },
    {
      name: 'refreshImg',
      factory: function() {
        return ImageView.create({value: SimpleValue.create('images/refresh.png')});
      }
    },
    {
      name: 'logo',
      factory: function() {
        return ImageView.create({value: SimpleValue.create(this.url + '/logo')});
      }
    },
    {
      name: 'favouritesLink',
      factory: function() {
        return ActionLink.create({action: this.model_.FAVOURITES, value: SimpleValue.create(this)});
      }
    },
    {
      name: 'legacyUrl',
      getter: function() {
        return this.url + '/issues/list?' + this.location.toURL(this);
      }
    },
    {
      name: 'mementoMgr',
      factory: function() { return MementoMgr.create({memento: this.memento$}); }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isAnimated: true,
      code: function(evt) {
        var self = this;
        this.view.dao.select(COUNT())(function (c) { self.selectedIssueCount = c.count; });
      }
    },
    {
      name: 'onSyncManagerUpdate',
      isAnimated: true,
      code: function(evt) {
        if ( this.syncManager.isSyncing ) {
          this.timer.step();
          this.timer.start();
        } else {
          this.timer.stop();
          // Should no longer be necessary since both views listen for dao updates.
          // this.view.choice = this.view.choice;
        }
      }
    },
    {
      name: 'performQuery',
      isAnimated: true,
      code: function(evt) {
        if ( ! this.maybeSetLegacyUrl(this.location.q) ) {
          this.search(AND(
            QueryParser.parseString(this.location.can) || TRUE,
            QueryParser.parseString(this.location.q) || TRUE
          ).partialEval());
        }
      }
    },
    {
      name: 'keyPress',
      code: function(e) {
        if ( e.ctrlKey && e.shiftKey ) {
          if ( e.keyCode == 189 ) this.zoomOut();
          if ( e.keyCode == 187 ) this.zoomIn();
        }
      }
    },
    {
      name: 'onLocationUpdate',
      isAnimated: true,
      code: function(evt) { this.memento = this.location.toMemento(this); }
    },
  ],

  actions: [
    {
      model_: 'Action',
      name:  'zoomIn',
      action: function() { this.zoom *= 1.1; }
    },
    {
      model_: 'Action',
      name:  'zoomOut',
      action: function() { this.zoom *= 0.9; }
    },
    {
      model_: 'Action',
      name:  'zoomReset',
      action: function() { this.zoom = 1.0; }
    },
    {
      model_: 'Action',
      name:  'link',
      label: '',
      iconUrl: 'images/link.svg',
      help:  'Link to code.google.com', // disable until tooltips work better
      action: function() {
        var url = this.legacyUrl;
        console.log(url);
        this.openURL(url);
      }
    },
    {
      model_: 'Action',
      name:  'launchBrowser',
      action: function() { this.project.launchBrowser(); }
    },
    {
      model_: 'Action',
      name:  'launchSync',
      label: 'Sync Status',
      action: function() { this.project.launchSync(); }
    },
    {
      model_: 'Action',
      name: 'favourites',
      label: 'My Favorites &#x25BE;',
      action: function() {
        if ( this.favouritesMenu ) {
          this.favouritesMenu.close();
          return;
        }

        var view = ToolbarView.create({
          horizontal: false,
          value: SimpleValue.create(this),
          document: this.X.document
        });

        view.addChild(
          StaticHTML.create({ content: '<b>Projects</b>' }));
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

        view.left = this.favouritesLink.$.offsetLeft;
        view.top = this.favouritesLink.$.offsetTop + this.favouritesLink.$.offsetHeight;
        view.openAsMenu();

        var self = this;
        view.subscribe('close', function() {
          self.favouritesMenu = '';
        });

        this.favouritesMenu = view;
      }
    },
    {
      model_: 'Action',
      name: 'findProjects',
      label: 'Find open source projects...',
      action: function() { this.openURL('https://code.google.com/hosting/'); }
    },
    {
      model_: 'Action',
      name: 'createProject',
      label: 'Create a project...',
      action: function() { this.openURL('https://code.google.com/hosting/createProject'); }
    },
    {
      model_: 'Action',
      name: 'configProjects',
      label: 'Configure projects...',
      action: function() { this.project.launchConfigProjects(); }
    },
    {
      model_: 'Action',
      name: 'changeUser',
      help: 'Change the current user.',
      labelFn: function() {
        return AbstractView.getPrototype().strToHTML(this.project.user.email);
      },
      action: function() {
        var self = this;
        this.qbug.authAgent.auth(function() {
          self.qbug.refreshUser();
          self.project.IssueSplitDAO.invalidate();
          self.performQuery();
        });
      }
    },
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.memento = '';

      Events.follow(this.project.issueCount$, this.issueCount$);

      Events.dynamic(
        function() { this.issueCount; this.selectedIssueCount; }.bind(this),
        function() {
          this.countField.data =
            this.selectedIssueCount.toLocaleString() + ' selected of ' + this.issueCount.toLocaleString();
        }.bind(this));

      this.location.q$.addListener(this.performQuery);
      this.location.can$.addListener(this.performQuery);

      this.rowSelection.addListener(function(_,_,_,issue) {
        this.project.editIssue(issue.id);
      }.bind(this));

      this.refreshImg.$.onclick = this.syncManager.forceSync.bind(this.syncManager);

      var timer = this.timer;
      Events.dynamic(function() {
        // TODO: This doesn't work because the listener is merged()' which doesn't cascade the Exception,
        // but it should
        //        if ( ! this.refreshImg.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        if ( ! this.refreshImg.$ ) return;
        this.refreshImg.$.style.webkitTransform = 'rotate(' + timer.i + 'deg)';
      }.bind(this));

      this.X.document.addEventListener('mousemove', function(evt) {
        if ( this.currentPreview && ! this.currentPreview.$.contains(evt.target) && ! this.view.$.contains(evt.target) ) {
          this.preview(null);
        }
      }.bind(this));

      this.searchChoice.choice = this.searchChoice.choices[1];

      this.X.document.addEventListener('keyup', this.keyPress);

      this.location.addListener(this.onLocationUpdate);

      this.IssueDAO.listen(this.onDAOUpdate);

      this.syncManager.isSyncing$.addListener(this.onSyncManagerUpdate);
      this.onSyncManagerUpdate();
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

          var v = self.X.QIssueDetailView.create({
            value: SimpleValue.create(obj),
            QIssueCommentDAO: self.project.issueCommentDAO(id),
            QIssueDAO: self.IssueDAO,
            mode: 'read-only',
            url: self.url
          }).addDecorator(QIssuePreviewBorder.create());

          var popup = self.currentPreview = PopupView.create({
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
      var regex = new RegExp("https://code.google.com/p/([^/]+)/issues/list(\\?(.*))?");
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
      this.X.document.body.style.zoom = this.zoom;
      this.layout();
    },

    /** Filter data with the supplied predicate, or select all data if null. **/
    search: function(p) {
      if ( p ) console.log('SEARCH: ', p.toSQL());
      this.filteredIssueDAO = p ? this.IssueDAO.where(p) : this.IssueDAO;
    },

    openURL: function(url) {
      this.X.document.location = url;
    }
  },

  templates: [
    { name: "toHTML" }
  ]
});


/** A subclass of Browser which works as a Chrome-App. **/
FOAModel({
  name: 'ChromeAppBrowser',

  extendsModel: 'Browser',

  methods: {
    openURL: function(url) {
      console.log('openURL: ', url);
      this.X.window.open(url);
    }
  }

});
