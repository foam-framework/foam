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

MODEL({
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
      name: 'openPredicate',
      factory: function() {
        var ss = this.project.issuesConfig.statuses;
        var os = [];
        for ( var i = 0 ; i < ss.length ; i++ ) {
          var s = ss[i];
          if ( ! s.meansOpen ) os.push(s.status);
        }
        return '-status=' + os.join(',');
      },
      postSet: function(_, value) { this.__ctx__.openPredicate = value; }
    },
    {
      name: 'LabelDAO',
      help: 'DAO of known labels.',
      factory: function() {
        var dao = MDAO.create({model: this.__ctx__.QIssueLabel});
        this.project.issuesConfig && this.project.issuesConfig.labels.select(dao);
        return dao;
      },
      postSet: function(_, value) { this.__ctx__.LabelDAO = value; }
    },
    {
      name: 'StatusDAO',
      help: 'DAO of known statuses.',
      factory: function() {
        var dao = MDAO.create({model: this.__ctx__.QIssueStatus});
        this.project.issuesConfig && this.project.issuesConfig.statuses.select(dao);
        return dao;
      },
      postSet: function(_, value) { this.__ctx__.StatusDAO = value; }
    },
    {
      name: 'PersonDAO',
      help: 'DAO of known people.',
      factory: function() {
        var dao = MDAO.create({ model: IssuePerson });
        this.project.members.select(dao);
        return dao;
      },
      postSet: function(_, value)  {
        this.__ctx__.PersonDAO = value;
      }
    },
    {
      name: 'IssueMDAO',
      factory: function() {
        var dao  = this.__ctx__.MDAO.create({model: this.__ctx__.QIssue});
        var auto = this.__ctx__.AutoIndex.create(dao);

        auto.addIndex(this.__ctx__.QIssue.STATUS);
        dao.addRawIndex(auto);

        return dao;
      }
    },
    {
      name: 'IssueIDBDAO',
      factory: function() {
        return this.__ctx__.EasyDAO.create({
          model: this.__ctx__.QIssue,
          name: this.projectName + '_' + this.__ctx__.QIssue.plural,
          migrationRules: [
            MigrationRule.create({
              modelName: 'QIssue',
              version: 120,
              migration: function(ret, dao) {
                console.log("Migrating to ", this.version);
                dao.removeAll()(ret);
              }
            })
          ]
        });
      },
      transient: true
    },
    {
      name: 'IssueCachingDAO',
      lazyFactory: function() {
        console.log('Creating IssueCachingDAO.');
        return this.__ctx__.CachingDAO.create({cache: this.IssueMDAO, src: this.IssueIDBDAO});
      },
      transient: true
    },
    {
      name: 'IssueCommentNetworkDAO',
      factory: function() {
        return this.__ctx__.LazyCacheDAO.create({
          model: this.__ctx__.QIssueComment,
          cacheOnSelect: true,
          cache: IDBDAO.create({
            model: this.__ctx__.QIssueComment,
            name: this.projectName + '_' + this.__ctx__.QIssueComment.plural,
            useSimpleSerialization: false }).addIndex(QIssueComment.ISSUE_ID),
          delegate: this.__ctx__.QIssueCommentNetworkDAO.create({
            model: this.__ctx__.QIssueComment,
            url: 'https://www.googleapis.com/projecthosting/v2/projects/' + this.projectName + '/issues',
          })
        });
      }
    },
    {
      name: 'IssueCommentDAO',
      factory: function() {
        return this.__ctx__.QIssueCommentUpdateDAO.create({
          delegate: this.IssueCommentNetworkDAO
        });
      },
      postSet: function(_, v) {
        if ( ! this.__ctx__.IssueCommentDAO )
          this.__ctx__.QIssueCommentDAO = ProxyDAO.create({ delegate: v });
        else
          this.__ctx__.QIssueCommentDAO.delegate = v;
      }
    },
    {
      name: 'IssueNetworkDAO',
      factory: function() {
        return this.__ctx__.IssueRestDAO.create({
          url: 'https://www.googleapis.com/projecthosting/v2/projects/' + this.projectName + '/issues',
          IssueCommentDAO: this.IssueCommentNetworkDAO,
          model: this.__ctx__.QIssue,
          batchSize: 500
        });
      },
      postSet: function(_, v) {
        this.IssueCommentDAO.IssueNetworkDAO = v;
      },
      transient: true
    },
    {
      name: 'IssueDAO',
      lazyFactory: function() {
        return this.IssueCachingDAO;
      },
      transient: true
    },
    {
      name: 'bookmarkDAO',
      factory: function() {
        var newDAO = this.__ctx__.EasyDAO.create({
          model:   Bookmark,
          name:    this.projectName + '_' + Bookmark.plural,
          cache:   true,
          guid:    true,
          daoType: 'SYNC'
        }).orderBy(Bookmark.ID);

        // Migrate bookmarks from old DAO to new SyncStorage.
        // TODO: Remove this code after a couple versions when all data has been translated.
        var oldDAO = this.__ctx__.EasyDAO.create({
          model:   Bookmark,
          name:    this.projectName + '_' + Bookmark.plural,
          cache:   true
        });

        oldDAO.select({put: function(bookmark) {
          bookmark.id = '';
          newDAO.put(bookmark);
        }})(function() {
          oldDAO.removeAll();
        });

        return newDAO;
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
      factory: function() { return this.__ctx__.Timer.create(); },
      transient: true
    },
    {
      name: 'persistentContext',
      factory: function() {
        return this.__ctx__.PersistentContext.create({
          dao: this.__ctx__.IDBDAO.create({
            model: this.__ctx__.Binding,
            name: 'QProject-' + this.projectName + '-Bindings'
          }),
          predicate: NOT_TRANSIENT,
          context: this
        });
      }
    },
    {
      name: 'syncManager'
    },
    {
      name: 'syncManagerFuture',
      factory: function() { return afuture(); }
    },
    {
      name: 'defaultSortChoices',
      factory: function() {
        return [
          [ DESC(this.__ctx__.QIssue.MODIFIED),      'Last modified' ],
          [ this.__ctx__.QIssue.PRI, 'Priority' ],
          [ DESC(this.__ctx__.QIssue.ID),            'Issue ID' ]
        ];
      }
    },
    {
      name: 'defaultFilterChoices',
      factory: function() {
        var open = 'status=Accepted,Assigned,Available,New,Started,Unconfirmed,Untriaged';

        return [
//          ['',                     'ALL ISSUES'],
          [open,                   'OPEN ISSUES'],
          [open + ' is:starred',   'STARRED'],
          [open + ' owner=me',     'OWNED BY ME']
//          [open + ' reporter=me',  'Open and reported by me'],
//          [open + ' commentby:me', 'Open and comment by me'],
//          ['status=New',           'New issues'],
//          ['status=Fixed,Done',    'Issues to verify']
        ];
      }
    }
  ],

  listeners: [
    {
      model_: 'Method',
      name: 'onDAOUpdate',
      isMerged: 16,
      code: function() {
        this.IssueMDAO.select(COUNT())(function (c) { this.issueCount = c.count; }.bind(this));

        var self = this;
        this.IssueMDAO.select(GROUP_BY(this.__ctx__.QIssue.CC, COUNT()))(function(g) {
          Object.keys(g.groups).forEach(function(key) {
            self.PersonDAO.find(key, { error: function() {
              self.PersonDAO.put(IssuePerson.create({ name: key }));
            }});
          });
        });
      }
    }
  ],

  methods: {
    init: function(args) {
      var labelToProperty = {
        App:          'app',
        Type:         'type',
        Milestone:    'm',
        Mstone:       'm',
        M:            'm',
        Cr:           'cr',
        Iteration:    'iteration',
        Week:         'week',
        ReleaseBlock: 'releaseBlock',
        OS:           'OS',
        MovedFrom:    'movedFrom',
        Pri:          'pri',
        Priority:     'priority'
      };

      var propertyLabels_ = {};

      function isPropertyLabel(l) {
        if ( l in propertyLabels_ ) return propertyLabels_[l];

        var keyValue = l.match(/([^\-]*)\-(.*)/) || l.match(/(\D*)(.*)/);
        if ( keyValue ) {
          var key   = labelToProperty[keyValue[1]];
          var value = keyValue[2];

          if ( key ) {
            var kv = [key, value.intern()];
            propertyLabels_[l] = kv;
            return kv;
          }
        }

        return propertyLabels_[l] = false;
      }

      this.__ctx__.registerModel(Model.create({
        extendsModel: 'GeneratedQIssue',

        name: 'QIssue',

        tableProperties: [
          'starred',
          'id',
          //      'app',
          'priority',
          'm',
          'iteration',
          'releaseBlock',
          'cr',
          'status',
          'owner',
          'summary',
          'OS',
          'modified'
        ],

        ids: ['id'],

        properties: [
          {
            model_: 'IntProperty',
            name: 'id',
            shortName: 'i',
            label: 'ID',
            required: true,
            tableWidth: '48px',
            tableFormatter: function(value, row, table) {
              var id = table.nextID();

              table.on('mouseover', function(e) {
                table.browser.preview(e, value);
              }, id);

              return '<div id="' + id + '">' + value + '</div>';
            }
          },
          /*
    {
      model_: 'StringArrayProperty',
      name: 'keywords',
      preSet: function(_, a) {
        for ( var i = 0 ; i < a.length ; i++ ) a[i] = a[i].intern();
        a.sort();
        return a;
      }
    },
    */
          {
            name: 'labels',
            shortName: 'l',
            aliases: ['label'],
            type: 'String',
            view: 'QIssueLabelsView',
            autocompleter: 'LabelCompleter',
            tableFormatter: function(a, row) {
              var s = '';
              for ( var i = 0 ; i < a.length ; i++ ) {
                if ( ! isPropertyLabel(a[i]) ) {
                  s += ' <span class="label">' + a[i] + '</span>';
                }
              }
              return s;
            },
            preSet: function(_, a) {
              for ( var i = 0; i < a.length; i++ ) a[i] = a[i].intern();
              return a.sort();
            },
            postSet: function(_, a) {
              // Reset all label properties to initial values.
              var newValues = {};

              // Create initial values
              for ( var i = 0 ; i < this.model_.properties.length ; i++ ) {
                var p = this.model_.properties[i];

                if ( LabelArrayProperty.isInstance(p) ) {
                  newValues[p.name] = [];
                } else if ( LabelStringProperty.isInstance(p) ) {
                  newValues[p.name] = "";
                }
              }

              // Add values from new list
              for ( var i = 0 ; i < a.length ; i++ ) {
                var kv = isPropertyLabel(a[i]);
                if ( kv ) {
                  // Cleanup 'movedFrom' labels
                  if ( kv[0] === 'movedFrom' ) {
                    kv[1] = typeof kv[1] === 'string' ? parseInt(kv[1].charAt(0) === 'M' ? kv[1].substring(1) : kv[1]) : kv[1];
                  }

                  if ( Array.isArray(newValues[kv[0]]) ) {
                    newValues[kv[0]] = newValues[kv[0]].binaryInsert(kv[1]);
                  } else {
                    newValues[kv[0]] = kv[1];
                  }
                }
              }

              // Set new values back to object, but only if they've changed
              for ( var key in newValues ) {
                var value = newValues[key];
                if ( this[key].compareTo(value) ) this[key] = value;
              }
            }
          },
          {
            name: 'author',
            preSet: function(_, a) { return a.intern(); },
            aliases: ['reporter']
          },
          {
            model_: 'LabelStringEnumProperty',
            name: 'priority',
            tableLabel: 'Priority',
            tableWidth: '60px',
            compareProperty: function(p1, p2) {
              var priorities = ['Low', 'Medium', 'High', 'Critical'];
              var i1 = priorities.indexOf(p1);
              var i2 = priorities.indexOf(p2);
              if ( i1 < 0 && i2 < 0 ) {
                // Neither is a proper priority - return normal string order.
                return p1 === p2 ? 0 : p1 < p2 ? -1 : 1;
              } else if ( i1 < 0 ) {
                return 1; // Nonstandard come after standard priorities
              } else if ( i2 < 0 ) {
                return -1;  // Likewise.
              } else {
                var r = i2 - i1;
                return r === 0 ? 0 : r < 0 ? -1 : 1;
              }
            },
            choices: ['Low', 'Medium', 'High', 'Critical'],
          },
          {
            model_: 'LabelStringEnumProperty',
            name: 'pri',
            tableLabel: 'Pri',
            tableWidth: '60px',
            compareProperty: function(p1, p2) {
              if ( p1.length === 0 && p2.length != 0 ) return 1;
              else if ( p2.length === 0 && p1.length != 0 ) return -1;
              return p1.compareTo(p2);
            },
            choices: [
              ['0', 'Priority 0 -- Critical'],
              ['1', 'Priority 1 -- High'],
              ['2', 'Priority 2 -- Medium'],
              ['3', 'Priority 3 -- Low']
            ]
          },
          {
            model_: 'LabelArrayProperty',
            name: 'app',
            tableWidth: '70px'
          },
          {
            model_: 'LabelArrayProperty',
            name: 'type',
            tableWidth: '70px'
          },
          {
            model_: 'LabelArrayProperty',
            name: 'm',
            label: 'Milestone',
            aliases: ['mstone', 'milestone'],
            tableLabel: 'M',
            tableWidth: '70px'
          },
          {
            model_: 'LabelArrayProperty',
            name: 'iteration',
            shortName: 'it',
            aliases: ['iter'],
            tableWidth: '69px'
          },
          {
            model_: 'LabelArrayProperty',
            name: 'week',
            tableWidth: '69px'
          },
          {
            model_: 'LabelArrayProperty',
            name: 'releaseBlock',
            shortName: 'rb',
            aliases: ['rBlock', 'release'],
            type: 'String',
            tableWidth: '103px',
            defaultValue: ''
          },
          {
            model_: 'LabelArrayProperty',
            name: 'cr',
            shortName: 'c',
            aliases: ['cat', 'cr'],
            label: 'Cr',
            tableWidth: '87px',
          },
          {
            model_: 'StringProperty',
            name: 'status',
            shortName: 's',
            aliases: ['stat'],
            type: 'String',
            preSet: function(_, s) { return s.capitalize(); },
            tableWidth: '58px',
            autocompleter: 'StatusCompleter',
            defaultValue: ''
          },
          {
            model_: 'StringArrayProperty',
            name: 'cc',
            autocompleter: 'PersonCompleter',
            displayWidth: 70
          },
          {
            name: 'owner',
            shortName: 'o',
            tableWidth: '181px',
            type: 'String',
            autocompleter: 'PersonCompleter',
            preSet: function(_, a) { return a.intern(); }
          },
          {
            name: 'summary',
            shortName: 'su',
            label: 'Summary',
            type: 'String',
            tableWidth: '350px',
            displayWidth: 70,
            //          tableWidth: '100%'
            tableFormatter: function(value, row, tableView) {
              return tableView.strToHTML(value);
            }
          },
          {
            name: 'description',
            displayHeight: 20,
            displayWidth: 70
          },
          {
            name: 'summaryPlusLabels',
            label: 'Summary + Labels',
            tableLabel: 'Summary + Labels',
            type: 'String',
            tableWidth: '100%',
            tableFormatter: function(value, row, tableView) {
              return tableView.strToHTML(row.summary) +
                value.model_.LABELS.tableFormatter(row.labels, row);
            }
          },
          {
            model_: 'LabelArrayProperty',
            name: 'OS',
            tableWidth: '61px',
            type: 'String'
          },
          {
            model_: 'BooleanProperty',
            name: 'blocked',
            tableWidth: '20px',
            getter: function() { return !! this.blockedOn.length; }
          },
          {
            model_: 'DateTimeProperty',
            name: 'modified',
            shortName: 'mod',
            mode: 'read-write',
            required: true,
            tableWidth: '100px',
            factory: function() { return new Date(); }
          },
          {
            name: 'updated',
            hidden: true,
            setter: function(v) { this.modified = v; }
          },
          {
            model_: 'BooleanProperty',
            name: 'starred',
            tableLabel: '',
            tableWidth: '18px',
            tableFormatter: function(val, obj, tableView) {
              var view = CSSImageBooleanView.create({
                className: 'star-image',
                data: obj.starred
              });

              view.data$.addListener(function() {
                var tmp = obj.clone();
                tmp.starred = view.data;
                tableView.browser.IssueDAO.put(tmp);
              });

              tableView.addChild(view);
              return view.toHTML();
            },
            view: { model_: 'CSSImageBooleanView', className: 'star-image' },
            help: 'Whether the authenticated user has starred this issue.'
          },
          {
            model_: 'IntProperty',
            name: 'stars',
            tableWidth: '20px',
            help: 'Number of stars this issue has.',
            compareProperty: function(o2, o1) {
              return o1 === o2 ? 0 : o1 > o2 ? 1 : -1;
            }
          },
          {
            model_: 'LabelArrayProperty',
            name: 'movedFrom',
            tableWidth: '100px'
          },
          {
            name: 'movedTo',
            preSet: function(_, v) {
              // TODO: looks like we're getting bad values, investigate and fix
              /*
                if ( v.length ) console.log('movedTo: ', v);
                return v;
              */
              return [];
            }
          },
          {
            model_: 'StringProperty',
            name: 'content',
            displayHeight: 4
          }
        ],

        methods: {
          replaceLabels: function(label, values) {
            var prefix = label + '-';
            var labels = this.labels.filter(function(l) { return ! l.startsWith(prefix); });
            if ( Array.isArray(values) ) {
              for ( var i = 0 ; i < values.length ; i++ ) {
                labels.binaryInsert(label + '-' + values[i]);
              }
            } else {
              labels.binaryInsert(label + '-' + values);
            }

            if ( this.labels.compareTo(labels) ) this.labels = labels;
          },
          isOpen: function() {
            return !! ({
              'New':       true,
              'Accepted':  true,
              'Started':   true,
              'Untriaged': true
            }[this.status]);
          },
          writeActions: function(other, out) {
            var diff = this.diff(other);
            delete diff.starred;

            if ( Object.keys(diff).length == 0 ) return;

            function convertArray(key) {
              if ( ! diff[key] ) {
                diff[key] = [];
                return;
              }

              var delta = diff[key].added;
              for ( var i = 0; i < diff[key].removed.length; i++ )
                delta.push("-" + diff[key].removed[i]);
              diff[key] = delta;
            }

            convertArray('blockedOn');
            convertArray('blocking');
            convertArray('cc');
            convertArray('labels');
            convertArray('m');
            convertArray('iteration');
            convertArray('week');

            var comment = this.__ctx__.QIssueComment.create({
              issueId: this.id,
              content: other.content,
              updates: this.__ctx__.QIssueCommentUpdate.create(diff)
            });

            out(comment);
          },
          newComment: function() {
            return this.__ctx__.QIssueComment.create({
              issueId: this.id,
              updates: this.__ctx__.QIssueCommentUpdate.create({
                labels: this.labels.clone(),
                owner: this.owner,
                blockedOn: this.blockedOn.clone(),
                blocking: this.blocking.clone(),
                cc: this.cc.clone(),
                mergedInto: this.mergedInto,
                status: this.status,
                summary: this.summary
              })
            })
          }
        },
        relationships: [
          {
            name: 'comments',
            label: 'Comments on this issue.',
            relatedModel: 'QIssueComment',
            relatedProperty: 'issueId'
          }
        ]
      }));

      this.__ctx__.QIssue.getPrototype();

      this.__ctx__.QIssue.properties.forEach(function(p) {
        if ( ! p["tableFormatter"] ) {
          p["tableFormatter"] = function(v) {
            return v || '----';
          };
        }
      });

      this.__ctx__.QIssue.LABELS.toMQL = function() { return 'label'; };
      this.__ctx__.QIssue.AUTHOR.toMQL = function() { return 'reporter'; };

      this.__ctx__.QueryParser = {
        __ctx__: this.__ctx__,
        __proto__: QueryParserFactory(this.__ctx__.QIssue),

        isOpen: literal_ic('is:open'),

        stars: seq(literal_ic('stars:'), sym('number')),

        labelMatch: seq(sym('fieldname'), alt(':', '='), sym('valueList')),

        summary: str(plus(notChar(' ')))

      }.addActions({
        isOpen: function(v) {
          return this.__ctx__.QueryParser.parseString(this.__ctx__.openPredicate);
        },
        stars: function(v) {
          return GTE({
            f: function(i) { return i.stars; },
            partialEval: function() {return this;},
            toSQL: function() { return 'stars > ' + v[1]; },
            toMQL: function() { return 'stars > ' + v[1]; }
          }, v[1]);
        },

        labelMatch: function(v) {
          var a = [];
          for ( var i = 2 ; i < v.length ; i++ ) {
            a.push(v[0] + '-' + v[i]);
          }

          return IN(this.__ctx__.QIssue.LABELS, a).partialEval();
          /*
            var or = OR();
            var values = v[2];
            for ( var i = 0 ; i < values.length ; i++ ) {
            or.args.push(CONTAINS_IC(QIssue.LABELS, v[0] + '-' + values[i]));
            }
            return or;
          */
        },

        summary: function(v) {
          return this.__ctx__.DefaultQuery.create({arg1: v});
        }
      });


      this.__ctx__.QueryParser.expr = alt(
        sym('isOpen'),
        this.__ctx__.QueryParser.export('expr'),
        sym('stars'),
        sym('labelMatch'),
        sym('summary')
      );

      this.SUPER(args);

      if ( ! this.__ctx__.DontSyncProjectData ) {
        this.IssueDAO.listen(this.onDAOUpdate);

        this.persistentContext.bindObject('syncManager', SyncManager.xbind({
          syncInterval: 60*5,
          batchSize: 500,
        }), {
          queryParser: this.__ctx__.QueryParser,
          srcDAO: this.IssueNetworkDAO,
          dstDAO: this.IssueCachingDAO,
          modifiedProperty: this.__ctx__.QIssue.MODIFIED
        })(function(manager) {
          this.syncManager = manager;
          this.syncManagerFuture.set(manager);
          manager.start();
        }.bind(this));

        if ( this.projectName !== 'chromium' ) {
          this.defaultSortChoices = [
            [ DESC(this.__ctx__.QIssue.MODIFIED),      'Last modified' ],
            [ this.__ctx__.QIssue.PRIORITY, 'Priority' ],
            [ DESC(this.__ctx__.QIssue.ID),            'Issue ID' ]
          ];
        }
      }
    },

    /** Open a Browser in a Window for a Chome Packaged App. **/
    launchBrowser: function(opt_url) {
      var self = this;

      chrome.app.window.create('empty.html', {width: 1000, height: 800}, function(w) {
        w.contentWindow.onload = function() {
          var window = self.window = w.contentWindow;

          apar(
            arequire('Browser'),
            arequire('ConfigureProjectsView'),
            arequire('GridView'),
            arequire('QIssueCommentAuthorView'),
            arequire('QIssueCommentCreateView'),
            arequire('QIssueCommentUpdateView'),
            arequire('QIssueCommentView'),
            arequire('QIssueDetailView'),
            arequire('QIssueLabel'),
            arequire('QIssueStatus'),
            arequire('QIssueTileView')
          )(function () {
            $addWindow(window);
            var Y = self.__ctx__.subWindow(window, 'Browser Window');
            var b = Y.ChromeAppBrowser.create({project: self});
            Y.touchManager = Y.TouchManager.create({});
            window.browser = b; // for debugging
            BROWSERS.push(b); // for debugging
            w.browser = b;
            window.document.firstChild.innerHTML = b.toHTML();
            b.initHTML();
            if ( opt_url ) b.maybeSetLegacyUrl(opt_url);
            w.focus();
            metricsSrv.sendAppView('Browser');
          });
        };

        w.onClosed.addListener(function() {
          $removeWindow(window);
          // for debugging
          BROWSERS.deleteI(window);
        });
      });
    },

    /** Create a Browser for use in a hosted app. **/
    createBrowser: function(window) {
      var b = this.__ctx__.Browser.create({project: this, window: window});
      window.browser = b;
      return b;
    },

    launchSync: function() {
      var self = this;

      this.syncManagerFuture.get((function(syncManager) {
        chrome.app.window.create('empty.html', {width: 600, height: 600}, function(w) {
          var window = w.contentWindow;
          w.contentWindow.onload = function() {
            $addWindow(window);
            var Y = self.__ctx__.subWindow(window, 'Sync Config')
            var b = Y.DetailView.create({
              model: Y.SyncManager,
              title: '<img style="vertical-align:bottom;" src="images/refresh.png"> Sync Config: ' + self.projectName,
              data: syncManager,
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
      }).bind(this));
    },

    launchConfigProjects: function() {
      var self = this;

      chrome.app.window.create('empty.html', {width: 430, height: 440}, function(w) {
        var window = w.contentWindow;
        w.contentWindow.onload = function() {
          $addWindow(window);

          var view = ConfigureProjectsView.create({ model: QUser });
          view.data = self.user;

          window.document.body.innerHTML = view.toHTML();
          view.initHTML();

          w.focus();
        };
        w.onClosed.addListener(function() {
          $removeWindow(window);
        });
      });
    }
  },

});
