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

  extends: 'foam.ui.View',

  requires: [
    'foam.ui.AlternateView',
    'foam.ui.ActionButton',
    'foam.ui.ActionLink',
    'foam.ui.GridView',
    'foam.ui.ToolbarView',
    'foam.ui.StaticHTML',
    'Action',
    'foam.apps.quickbug.ui.CursorView',
    'foam.ui.RelationshipView',
    'foam.apps.quickbug.model.Location',
    'foam.apps.quickbug.dao.QIssuesSplitDAO',
    'foam.util.Timer',
    'foam.ui.TextFieldView',
    'foam.ui.ChoiceView',
    'foam.ui.ChoiceListView',
    'foam.ui.PopupChoiceView',
    'foam.ui.PopupView',
    'foam.ui.ImageView',
    'foam.apps.quickbug.ui.MementoMgr',
    'foam.lib.bookmarks.AddBookmarkDialog',
    'foam.lib.bookmarks.Bookmark',
    'foam.apps.quickbug.ui.QIssueCreateView',
    'foam.apps.quickbug.ui.QIssueDetailView',
    'foam.apps.quickbug.ui.QIssuePreviewBorder',
    'foam.apps.quickbug.ui.QIssueTableView',
    'foam.apps.quickbug.ui.QIssueTileView',
    'foam.apps.quickbug.ui.QIssueTileView2',
    'foam.apps.quickbug.ui.ColExpr',
    'foam.apps.quickbug.ui.ItemCount',
    'foam.apps.quickbug.ui.DragAndDropGrid',
    'foam.core.dao.WaitCursorDAO',
    'foam.glang.PieExpr',
    'foam.metrics.Metric',
    'foam.ui.ViewChoice'
  ],

  exports: [
    'as stack',
    'as browser',
    'IssueDAO',
    'IssueDAO as issueDAO'
  ],

  imports: [
    'metricDAO',
    'document'
  ],

  properties: [
    'project',
    'previewID',
    'favouritesMenu',
    'createMenu',
    {
      name: 'QIssue',
      defaultValueFn: function() { return this.X.QIssue; }
    },
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
          model: this.QIssue,
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
          package: 'foam.ui',
          extends: 'foam.ui.ChoiceListView',
          methods: {
            choiceToHTML: function(id, choice) {
              var id2 = this.nextID();
              this.on('click', function() {
                self.bookmarkDAO.remove(choice[2]);
              }, id2);
              return '<li style="display:flex;display:-webkit-flex" class="choice"><span style="width:100%;" id="' + id + '">' + choice[1] + '</span><span id="' + id2 + '" class="DeleteBookmark">X</span></li>';
            }
          }
        }));

        // TODO: this was a bad idea to make this a ChoiceView because
        // it only fires events when the data changes, not when you select
        // an item like a regular menu.  Make into something else.
        var v = this.PopupChoiceView.create({
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
      model_: 'foam.core.types.DAOProperty',
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
      type: 'foam.ui.TextFieldView',
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
        var view = this.createView(this.rowSelection$, this);
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
      factory: function() { return this.MementoMgr.create({mementoValue: this.memento$}); }
    },
    {
      model_: 'foam.core.types.DocumentInstallProperty',
      name: 'installFOAMCSS',
      documentInstallFn: function(X) {
        var e = X.document.createElement('link');
        e.setAttribute('rel', 'stylesheet');
        e.setAttribute('href', 'foam.css');
        X.document.head.insertBefore(e, X.document.head.firstElementChild);
      }
    }
  ],

  listeners: [
    {
      name: 'onSearch',
      code: function(_, __, ___,q) {
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
        this.metricDAO.put(this.Metric.create({
          name: 'browserQuery'
        }));
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
      code: function() { this.zoom *= 1.1; }
    },
    {
      name:  'zoomOut',
      code: function() { this.zoom *= 0.9; }
    },
    {
      name: 'zoomReset',
      code: function() { this.zoom = 1.0; }
    },
    {
      name: 'link',
      label: '',
      iconUrl: 'images/link.svg',
      help:  'Link to code.google.com',
      code: function() {
        var url = this.legacyUrl;
        console.log(url);
        this.openURL(url);
      }
    },
    {
      name: 'launchBrowser',
      code: function() { this.project.launchBrowser(); }
    },
    {
      name:  'launchSync',
      label: 'Sync Status',
      code: function() { this.project.launchSync(); }
    },
    {
      name: 'favourites',
      label: 'Projects &#x25BE;',
      code: function() {
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
              code: function() {
                this.qbug.launchBrowser(p);
              }
            });
          }));

        view.addSeparator();
        view.addAction(this.FIND_PROJECTS);
        view.addAction(this.CREATE_PROJECT);

        view.addSeparator();
        view.addAction(this.CONFIG_PROJECTS);

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
      code: function() { this.openURL('https://code.google.com/hosting/'); }
    },
    {
      name: 'createProject',
      label: 'Create a project...',
      code: function() { this.openURL('https://code.google.com/hosting/createProject'); }
    },
    {
      name: 'configProjects',
      label: 'Configure projects...',
      code: function() { this.project.launchConfigProjects(); }
    },
    {
      name: 'addBookmark',
      iconUrl: 'images/star_off.gif',
      label: '',
      help: 'Create Bookmark',
      code: function() {
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
      code: function() {
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
      code: function() {
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
              code: function() {
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

      this.location.y = this.QIssue.OWNER;
      this.location.x = this.QIssue.STATUS;

      this.searchField.data$.addListener(this.onSearch);
      Events.follow(this.location.q$, this.searchField.data$);

      Events.follow(this.project.issueCount$, this.issueCount$);

      this.X.dynamicFn(
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

    createView: function(rowSelectionValue) {
      var browser = this;

      return this.AlternateView.create({
        dao: this.filteredIssueDAO$Proxy,
        headerView: this.countField,
        views: [
          this.ViewChoice.create({
            label: 'List',
            view: function() {
              var tableView = browser.QIssueTableView.create({
                model:               browser.QIssue,
                dao:                 browser.filteredIssueDAO$Proxy,
                browser:             browser,
                hardSelection$:      rowSelectionValue,
                columnResizeEnabled: true,
                scrollEnabled:       true,
                editColumnsEnabled:  true
              });

              tableView.sortOrder$  = browser.location.sort$;
              tableView.properties$ = browser.location.colspec$;
              return tableView;
            }
          }),
          this.ViewChoice.create({
            label: 'Grid',
            view: function() {
              // TODO: this is a bit complex because it was written before Contexts. Fix.
              var g = Model.create({
                name: 'QIssueGridView',
                extends: 'foam.ui.GridView',
                methods: {
                  filteredDAO: function() {
                    return ( this.acc.choice && this.acc.choice[1] === 'Tiles' ) ?
                      this.dao.limit(2000) :
                      this.dao ;
                  }
                }
              }).create({
                model: browser.QIssue,
                accChoices: [
                  [ MAP(browser.QIssueTileView.create({browser: browser}), browser.ColExpr.create()),  'Tiles' ],
                  [ MAP(browser.QIssueTileView2.create({browser: browser}), browser.ColExpr.create()), 'Tiles+' ],
                  [
                    MAP({
                      f: function(i) {
                        var url = browser.url + '/issues/detail?id=' + i.id;
                        return '<a target="_blank" href="' + url + '">' + i.id + '</a>&nbsp;';
                      }
                    }, browser.ColExpr.create()), 'IDs' ],
                  [ browser.ItemCount.create({browser: browser}),                          'Counts' ],
                  [ browser.PieExpr.create({ arg1: browser.QIssue.STATUS }),                                            'Pie(Status)'  ],
                  [
                    browser.PieExpr.create({
                      arg1: browser.QIssue.PRIORITY,
                      opt_args: {
                        colorMap: {
                          Critical: 'hsl(   0, 100%, 70%)',
                          High:     'hsl(-340, 100%, 70%)',
                          Medium:   'hsl(-320, 100%, 70%)',
                          Low:      'hsl(-300, 100%, 70%)',
                          '':       'lightgray'
                        }
                      }
                    }), 'Pie(Priority)' ]
                ],
                grid: browser.DragAndDropGrid.create({dao: browser.filteredIssueDAO$Proxy})
              }, browser.Y);

              g.row.data$   = browser.location.y$;
              g.col.data$   = browser.location.x$;
              g.scrollMode$ = browser.location.scroll$;

              // TODO: cleanup this block
              function setAcc() {
                var acc = g.accChoices[0];
                for ( var i = 1 ; i < g.accChoices.length ; i++ ) {
                  if ( location.cells === g.accChoices[i][1].toLowerCase() ) acc = g.accChoices[i];
                }
                g.acc.choice = acc;
              }
              setAcc(location.cells);

              g.acc.data$.addListener(function(choice) { browser.location.cells = g.acc.choice[1].toLowerCase(); });
              browser.location.cells$.addListener(setAcc);

              return g;
            }
          })
        ]
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
          var v = self.QIssueDetailView.create({
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
  var manifest = chrome.runtime.getManifest();
  var browserLink  = this.ActionLink.create(  {action: this.LAUNCH_BROWSER, data: this});
  var linkButton   = this.ActionButton.create({action: this.LINK,           data: this});
  var syncLink     = this.ActionLink.create(  {action: this.LAUNCH_SYNC,    data: this});
  var backButton   = this.ActionButton.create({action: this.MementoMgr.BACK,            data: this.mementoMgr});
  var forthButton  = this.ActionButton.create({action: this.MementoMgr.FORTH,           data: this.mementoMgr});
%>
<body id="{{this.id}}" class="column"><div class="column expand" style="height:100%;">
 <div class="topHeader row" style="align-items:center;-webkit-align-items:center">
  <%= backButton, forthButton %> %%refreshImg <span class="expand"></span> <span>$$newIssue{model_: 'foam.ui.ActionLink'} | $$changeUser{model_: 'foam.ui.ActionLink'} | $$favourites{model_: 'foam.ui.ActionLink'} | %%bookmarksMenu | <%= syncLink %> | <%= browserLink %> |<%= linkButton %></span>
 </div>
 <div class="stack" style="display:none;">
 </div>
 <div class="header row" style="align-items:baseline;-webkit-align-items:baseline">
  <span class="logo">%%logo</span>
  <div>
    <span class="title">%%projectName</span>
    <div class="subtitle">%%summary</div>
  </div>
  <span style="width:60px;flex-shrink:10000;-webkit-flex-shrink:10000"></span>
  <span>Search %%searchChoice for </span>
  <span class="expand" style="padding-left:4px;">%%searchField</span> $$addBookmark
  <span class="link" style="align-self:center;-webkit-align-self:center"> &nbsp; <a target="_blank" href="<%= this.url %>/issues/searchtips">Search&nbsp;tips</a></span>
 </div>
 <div class="BrowserView expand column">%%view</div>
 <div class="footer"><%= FOAM_POWERED %> <span class="appName"><%= manifest.name %> v<%= manifest.version%></span></div>
</div></body>
*/},
    function CSS() {/*
body {
  margin-bottom: 5px;
  margin-top: 0;
  overflow: hidden;
  -webkit-user-select: text;
}

.scrollSpacer { height: 24px }

.title {
  color: #666;
  font-family: arial, sans-serif;
  font-size: 32px;
  font-style: normal;
  font-variant: normal;
  font-weight: normal;
}

.subtitle {
  color: #666;
  font-family: arial, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-variant: normal;
  font-weight: normal;
}

#settings {
  margin-left: 15px;
}

.searchBar {
  color: black;
  font-family: arial, sans-serif;
  font-size: 13px;
  font-style: normal;
  font-variant: normal;
  font-weight: bold;
}

.QIssueTableHeader {
  background:rgb(235, 239, 249);
  border-color: rgb(187, 187, 187);
  border-style: solid;
  border-width: 1px;
  flex: none;
  height: 23px;
  margin-left: 6px;
}

.QIssueTable {
  background: #fff;
  border: 1px solid #ccc;
  font-family: arial, sans-serif;
  font-size: 13px;
  margin-left:6px;
  margin-top:0;
  min-width: 1200px;
  width:99.6%;
}

.QIssueTable thead {
  background-color: #eee;
  height: 90px;
}

.QIssueTable th {
  font-weight: bold;
  padding: 2px;
  font: 100% arial,sans-serif;
  color: #00c;
  border: 1px solid #ccc;
}

.QIssueTable td {
  color: #000;
  padding: 2px;
  border-top: 1px solid #ccc;
}

.QIssueTable .OS {
  white-space: normal;
  overflow: auto;
}

.QIssueTable .summary {
  white-space: normal;
  overflow: auto;
}

.QIssueTable .label {
  color: green!important;
  white-space: nowrap;
}

.altViewButtons {
  margin-top: 18px;
  position: absolute;
  right: 5px;
}

#countField {
  margin-left: 30px;
  margin-right: 5px;
  font-weight: normal;
}

.QIssuePreview {
  border: 1px solid #666;
  overflow: auto;
}

.actionButton-link {
  vertical-align: middle;
}

.actionButton-link, .actionButton-link:hover {
  border: none;
  background: white;
}

.qmaincol {
  padding: 3px;
  background: white;
}

.QIssuePreview .qissuepage {
  min-height: 100%;
}

.qissuepage td {
  white-space: normal;
}

.qissueheader {
  margin: 0.5em 0 0 0;
  border: 3px solid #e5ecf9;
  background: #e5ecf9;
}

.qpreviewtable {
  border-collapse: separate;
  font: 12px arial, sans-serif;
}

.qh3 {
  font-size: 130%;
  font-width: bolder;
}

.qvt {
  vertical-align: top;
}

.qissuepage {
  margin-top: 0;
  font: 12px arial, sans-serif;
}

.qissuemeta {
  width: 12em;
  border-right: 3px solid #e5ecf9;
  font-size: 95%;
  vertical-align: top;
}

.qissuepage td {
  padding: 0.5em .5em .5em 0;
}

.qissuemeta table td, .qissuemeta table th {
  margin: 0;
  padding: 0;
  padding-top: 5px;
}

.qlabel {
  color: green;
  text-decoration: none;
}

.topHeader {
  border-bottom: 2px solid rgb(150,192,250);
  flex: none;
  font: 13px arial, sans-serif;
  margin: 0;
  margin-bottom: 2px;
  text-align: right;
}

.topHeader img { padding: 2px; }

.topHeader .imageView {
  margin-left: 10px;
}

.header {
  border-bottom: 2px solid rgb(150,192,250);
  flex: none;
  padding-bottom: 4px;
}

.qissueupdates {
  margin: 1em 0 .5em .7em;
  background: #e5ecf9;
  width: 80%;
  font-size: 90%;
}

.qupdatesround1, .qupdatesround2, .qupdatesround4 {
  font-size: 0;
  margin: 0;
  padding: 0;
  height: 1px;
}

.qupdatesround1 {
  border-left: 1px solid #fff;
  border-right: 1px solid #fff;
}

.qupdatesround2 {
  border-left: 2px solid #fff;
  border-right: 2px solid #fff;
}

.qupdatesround4 {
  border-left: 4px solid #fff;
  border-right: 4px solid #fff;
}

.qissueinnerupdates {
  margin: 0;
  padding: 0 13px 0 13px;
}

.qissuecomment {
  border-top: 3px solid #e5ecf9;
  padding-top: 0.5em;
  font-size: 13px;
}

.qissuecomment pre {
  white-space: pre-wrap;
  max-width: 80em;
  padding-left: .7em;
}

.qissuecommentdate {
  float: right;
  margin-right: .3em;
  text-align: right;
}

.qissuecommentauthor {
  margin-bottom: 1em;
  display: inline;
}

.qissuelabels {
  text-decoration: none;
  color: green;
  white-space: nowrap;
}

.qissuerelated {
  color: #00c;
  white-space: nowrap;
}

.ActionMenuPopup {
  border-color: #c9d7f1 #36c #36c #a2bae7
  border-style: solid;
  border-width: 1px;
  width: 175px;
}

.actionButton {
  color: #00c;
  padding: 3px;
  text-decoration: none;
  font-weight: normal;
  box-shadow: none;
}

.menuSeparator {
  margin: 0 0.5em;
  border: 0;
  border-top: 1px solid #c9d7f1
}

.gridtile {
  background: white;
}

.qbugCount {
  margin-right: 25px;
}

.actionButton-link img {
  vertical-align: sub;
}

input[name="search"] {
  width: 100%;
}

input[name="labels"] {
  color: #060
}

.logo img {
  padding-right: 10px;
  vertical-align: middle;
}

.gridViewArea {
  overflow: auto;
}

.actionButton-back img, .actionButton-forth img { width: 22px; }

.footer {
  flex: none;
}

.foamTable tr.rowSelected {
  border: none;
}

.actionButton-back, .actionButton-forth {
  border: none;
  background: transparent;
  padding: 4px;
}

.QIssueTable, .gridViewControl table {
  table-layout: fixed;
}

div.gridViewControl {
  margin-top: 10px;
  flex-shrink: 0;
}

.star-image {
  width: 15px;
  height: 15px;
  background-repeat: no-repeat;
  padding: 0 2px;
}

.star-image.true {
  background-image: url('data:image/gif;base64,R0lGODlhDwAPAMQfAF9h4RYVnZeQJC0u0lRQU42R6P/7Fv74L05NrRkZxi4tW52XXv71D8nAIWxnjnRxr3NuMJKOluXbBe7kCa2x7UFD1vPoB77D8Jqe6n6B5tvTUr62BMrP8lJPh1xbuv///yH5BAEAAB8ALAAAAAAPAA8AAAWD4CeOWQKMaDpESepi3tFlLgpExlK9RT9ohkYi08N8KhWP8nEwMBwIDyJRSTgO2CaDYcBOCAlMgtDYmhmTDSFQ+HAqgbLZIlAMLqiKw7m1EAYuFQsGEhITEwItKBc/EgIEAhINAUYkCBIQAQMBEGonIwAKa21iCgo7IxQDFRQjF1VtHyEAOw==');
}

.star-image:not(.true) {
  background-image: url('data:image/gif;base64,R0lGODlhDwAPALMPAP///8zj++r7/7vb/rHW/tPt/9Lk+qzT/rbY/sHh/8Te/N7q+Nzy/7nY/djn+f///yH5BAEAAA8ALAAAAAAPAA8AAARg8MkZjpo4k0KyNwlQBB42MICAfEF7APDRBsYzIEkewGKeDI1DgUckMg6GTdFIqC0QgyUgQVhgGkOi4OBBCJYdzILAywIGNcoOgCAQvowBRpE4kgzCQgPjQCAcEwsNTRIRADs=');
}

.autocompletePopup {
  width: 600px;
  overflow-x: hidden;
}

.autocomplete,ul {
  color: #00c;
  background: white;
  border: 1px solid #bbb;
}

.autocomplete .choice:hover {
  background: #c3d9ff;
}

.autocomplete .popup {
  width: 600px;
}

.autocompleteTable {
  width: 598px;
  padding: 0;
  margin: 0;
}

.autocompleteTable .label {
  word-wrap: nowrap;
  display: table-cell;
}

.autocompleteTable .description {
  display: table-cell;
}

.autocompleteTable > li {
  display: table-row;
}

.autocompleteTable {
  display: table;
}

.stack {
  overflow: auto;
  flex-grow: 1;
}

.bookmarks-menu button {
  background: white;
  border: none;
  color: blue;
  font: 13px arial, sans-serif;
  text-decoration: underline;
}

.actionButton-addBookmark, .actionButton-addBookmark:hover {
  background: white;
  border: none;
  margin-left: 4px;
}

.popupChoiceList li {
  margin: 0;
  margin-left: -40px;
  padding: 0;
  font-size: 14px;
}

.popupChoiceList li span {
  padding: 8px;
}

.popupChoiceList li:hover {
  background: #f0f0f0;
}

.DeleteBookmark {
  float: right;
  padding: 2px;
  margin-left: 15px;
  margin-top: -2px;
}

.DeleteBookmark:hover {
  font-weight: 900;
}

.actionLink-prev[disabled=disabled], .actionLink-next[disabled=disabled] {
  display: none;
}

.actionLink-backToList {
  margin-left: 8px;
}

.appName {
  margin-top: 3px;
  float: right;
}

.issue_restrictions {
  padding: 2px 4px;
  background-color: #f9edbe;
  border: 1px solid #ccc;
  min-width: 14em;
}

.issue_restrictions .restrictions_header {
  padding: 0 0 2px 0;
  text-align: center;
  font-weight: bold;
}

.issue_restrictions ul {
  background-color: #f9edbe;
  border: none;
  color: black;
  margin: 0;
  padding-left: 15px;
}
*/}
  ]
});
