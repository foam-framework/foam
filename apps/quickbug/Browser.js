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

MODEL({
  name: 'Browser',

  extendsModel: 'View',

  properties: [
    {
      name: 'X',
      preSet: function(_, x) { return x.sub({stack: this, browser: this}); }
    },
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
      factory: function() { return this.X.Location.create(); }
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
        return this.X.QIssueSplitDAO.create({
          local: this.project.IssueDAO,
          model: this.X.QIssue,
          remote: this.project.IssueNetworkDAO
        });

        return this.project.IssueDAO;
        return WaitCursorDAO.create({
          delegate: this.project.IssueDAO,
          window:   this.X.window
        });
      },
      postSet: function(_, v) {
        this.X.IssueDAO = v;
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
        var Y = this.X.sub({
          ChoiceListView: Model.create({
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
          })
        });
        // TODO: this was a bad idea to make this a ChoiceView because
        // it only fires events when the data changes, not when you select
        // an item like a regular menu.  Make into something else.
        var v = Y.PopupChoiceView.create({
          autoSetData: false,
          objToChoice: function(b) { return [b.url, b.title, b]; },
          dao: this.bookmarkDAO,
          linkLabel: 'Bookmarks &#x25BE;',
          extraClassName: 'bookmarks-menu'
        });
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
      factory: function() { return this.X.Timer.create(); }
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
        var view = createView(this.rowSelection$, this);
        view.choice$ = this.location.mode$;
        return view;
      }
    },
    {
      name: 'searchChoice',
      factory: function() {
        var open = this.project.openPredicate;

        return ChoiceView.create({
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
      factory: function() { return TextFieldView.create({
        name: 'search',
        type: 'search',
        displayWidth: 5
      });}
    },
    {
      name: 'refreshImg',
      factory: function() {
        return ImageView.create({data: 'images/refresh.png'});
      }
    },
    {
      name: 'logo',
      factory: function() {
        return ImageView.create({data: this.url + '/logo'});
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
      factory: function() { return this.X.MementoMgr.create({memento: this.memento$}); }
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
        metricsSrv.sendEvent('Browser', 'Query');
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

        var view = this.X.ToolbarView.create({
          horizontal: false,
          data: this,
          document: this.X.document
        });

        view.addChild(StaticHTML.create({ content: '<b>Projects</b>' }));
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
        var view   = this.X.AddBookmarkDialog.create({
          dao: this.bookmarkDAO,
          data: Bookmark.create({url: this.memento})
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
      labelFn: function() { return View.getPrototype().strToHTML(this.project.user.email); },
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

        var view = this.X.ToolbarView.create({
          horizontal: false,
          data: this,
          document: this.X.document
        });

        var self = this;

        view.addChild(StaticHTML.create({ content: '<b>Templates</b>' }));
        view.addActions(
          this.project.project.issuesConfig.prompts.map(function(c) {
            return Action.create({
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

      this.X.document.addEventListener('mousemove', (function(evt) {
        if ( this.currentPreview && ! this.currentPreview.$.contains(evt.target) && ! this.view.$.contains(evt.target) ) {
          this.preview(null);
        }
      }).bind(this));

      this.searchChoice.choice = this.searchChoice.choices[1];

      this.X.document.addEventListener('keyup', this.keyPress);

      this.IssueDAO.listen(this.onDAOUpdate);
      this.onDAOUpdate();

      this.syncManagerFuture.get((function(syncManager) {
        syncManager.isSyncing$.addListener(this.onSyncManagerUpdate);
      }).bind(this));

      this.onSyncManagerUpdate();

      this.bookmarkDAO.find(EQ(Bookmark.TITLE, 'Default'), {
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
          });
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
          });
      }


      var self = this;
      apar(
        arequire('QIssueCreateView')
      )(function() {
        var v = self.X.QIssueCreateView.create({
          data: data,
          mode: 'read-write'
        });
        self.pushView(v);
      });
    },

    editIssue: function(id) {
      if ( ! id ) return;

      var self = this;

      this.IssueDAO.find(id, {
        put: function(obj) {
          apar(
            arequire('AddBookmarkDialog'),
            arequire('QIssueDetailView'),
            arequire('CursorView'),
            arequire('QIssueCommentCreateView'),
            arequire('QIssueCommentView'),
            arequire('QIssueCommentAuthorView'),
            arequire('QIssueCommentUpdateView')
          )(function() {
            var v = self.X.QIssueDetailView.create({
              data:             obj,
              mode:             'read-write',
              url:              self.url,
              issueDAO:         self.IssueDAO,
              cursorIssueDAO:   self.location.sort ?
                self.filteredIssueDAO.orderBy(self.location.sort) :
                self.filteredIssueDAO
            });
            self.pushView(v);
//            w.focus();
          });
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

          var v = self.X.QIssueDetailView.create({
            data: obj,
            QIssueCommentDAO: self.project.issueCommentDAO(id),
            QIssueDAO: self.IssueDAO,
            mode: 'read-only',
            url: self.url
          }).addDecorator(self.X.QIssuePreviewBorder.create());

          var popup = self.currentPreview = self.X.PopupView.create({
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
      this.X.document.body.style.zoom = this.zoom;
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
      this.X.document.location = url;
    }
  },

  templates: [ { name: "toHTML" } ]
});


/** A subclass of Browser which works as a Chrome-App. **/
MODEL({
  name: 'ChromeAppBrowser',

  extendsModel: 'Browser',

  methods: {
    openURL: function(url) {
      console.log('openURL: ', url);
      var codesite = url.indexOf('code.google.com');
      if ( codesite >= 0 ) {
        var question = url.indexOf('?');
        if ( question == -1 ) question = url.length;
        var before = url.substring(0, question);
        var after = url.substring(question + 1);
        url = before + '?no_qbug=1&' + after;
      }
      this.X.window.open(url);
    }
  }

});
