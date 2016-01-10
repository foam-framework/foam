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
  package: 'foam.apps.quickbug.model',
  name: 'QProject',

  tableProperties: [
    'projectName',
    'baseURL'
  ],

  requires: [
    'Binding',
    'foam.dao.CachingDAO',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.dao.LazyCacheDAO',
    'foam.dao.ContextualizingDAO',
    'MDAO',
    'PersistentContext',
    'foam.util.Timer',
    'foam.apps.quickbug.dao.IssueRestDAO',
    'foam.apps.quickbug.dao.QIssueCommentNetworkDAO',
    'foam.apps.quickbug.dao.QIssueCommentUpdateDAO',
    'foam.apps.quickbug.dao.SyncManager',
    'foam.apps.quickbug.model.DefaultQuery',
    'foam.apps.quickbug.model.LabelArrayProperty',
    'foam.apps.quickbug.model.LabelStringEnumProperty',
    'foam.apps.quickbug.model.LabelStringProperty',
    'foam.apps.quickbug.model.QIssueComment',
    'foam.apps.quickbug.model.QIssueCommentUpdate',
    'foam.apps.quickbug.model.QIssueLabel',
    'foam.apps.quickbug.model.QIssueStatus',
    'foam.apps.quickbug.model.imported.Issue',
    'foam.apps.quickbug.model.imported.IssuePerson',
    'foam.apps.quickbug.model.LabelCompleter',
    'foam.apps.quickbug.model.PersonCompleter',
    'foam.apps.quickbug.model.StatusCompleter',
    'foam.core.dao.MigrationRule',
    'foam.lib.bookmarks.Bookmark',
    'foam.core.dao.WhenIdleDAO',
    'foam.metrics.Metric',
    'foam.ui.CSSImageBooleanView'
  ],

  exports: [
    'IssueCommentDAO as qIssueCommentDAO',
    'IssueCommentDAO as QIssueCommentDAO',
    'StatusDAO as issueStatusDAO',
    'StatusDAO as StatusDAO',
    'LabelDAO as issueLabelDAO',
    'LabelDAO as LabelDAO',
    'PersonDAO as issuePersonDAO',
    'PersonDAO as PersonDAO',
    'openPredicate',
    'QueryParser'
  ],

  imports: [
    'metricDAO'
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
      lazyFactory: function() {
        var ss = this.project.issuesConfig.statuses;
        var os = [];
        for ( var i = 0 ; i < ss.length ; i++ ) {
          var s = ss[i];
          if ( ! s.meansOpen ) os.push(s.status);
        }
        return '-status=' + os.join(',');
      }
    },
    {
      name: 'LabelDAO',
      help: 'DAO of known labels.',
      factory: function() {
        var dao = this.MDAO.create({model: this.QIssueLabel});
        this.project.issuesConfig && this.project.issuesConfig.labels.select(dao);
        return dao;
      }
    },
    {
      name: 'StatusDAO',
      help: 'DAO of known statuses.',
      factory: function() {
        var dao = this.MDAO.create({model: this.QIssueStatus});
        this.project.issuesConfig && this.project.issuesConfig.statuses.select(dao);
        return dao;
      }
    },
    {
      name: 'PersonDAO',
      help: 'DAO of known people.',
      factory: function() {
        var dao = this.MDAO.create({ model: this.IssuePerson });
        this.project.members.select(dao);
        return dao;
      }
    },
    {
      name: 'IssueMDAO',
      lazyFactory: function() {
        var dao  = this.MDAO.create({model: this.QIssueModel}, this.Y);
        var auto = this.X.AutoIndex.create(dao, this.Y);

        auto.addIndex(this.QIssueModel.STATUS);
        dao.addRawIndex(auto);

        return dao;
      }
    },
    {
      name: 'IssueIDBDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.QIssueModel,
          name: this.projectName + '_' + this.QIssueModel.plural,
          migrationRules: [
            this.MigrationRule.create({
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
        return this.CachingDAO.create({cache: this.IssueMDAO, src: this.IssueIDBDAO}, this.Y);
      },
      transient: true
    },
    {
      name: 'IssueCommentNetworkDAO',
      lazyFactory: function() {
        return this.LazyCacheDAO.create({
          model: this.QIssueComment,
          cacheOnSelect: true,
          cache: this.IDBDAO.create({
            model: this.QIssueComment,
            name: this.projectName + '_' + this.QIssueComment.plural,
            useSimpleSerialization: false }).addIndex(this.QIssueComment.ISSUE_ID),
          delegate: this.QIssueCommentNetworkDAO.create({
            model: this.QIssueComment,
            url: 'https://www.googleapis.com/projecthosting/v2/projects/' + this.projectName + '/issues',
          })
        });
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'IssueCommentDAO',
      factory: function() {
        return this.WhenIdleDAO.create({
          delegate: this.QIssueCommentUpdateDAO.create({
            delegate: this.IssueCommentNetworkDAO
          })
        });
      }
    },
    {
      name: 'IssueNetworkDAO',
      lazyFactory: function() {
        return this.IssueRestDAO.create({
          url: 'https://www.googleapis.com/projecthosting/v2/projects/' + this.projectName + '/issues',
          IssueCommentDAO: this.IssueCommentNetworkDAO,
          model: this.QIssueModel,
          batchSize: 500
        });
      },
      postSet: function(_, v) {
        this.IssueCommentDAO.delegate.IssueNetworkDAO = v;
      },
      transient: true
    },
    {
      name: 'IssueDAO',
      lazyFactory: function() {
        return this.ContextualizingDAO.create({
          delegate: this.IssueCachingDAO
        });
      },
      transient: true
    },
    {
      name: 'bookmarkDAO',
      lazyFactory: function() {
        var newDAO = this.EasyDAO.create({
          model:   this.Bookmark,
          name:    this.projectName + '_' + this.Bookmark.plural,
          cache:   true,
          guid:    true,
          daoType: 'SYNC'
        }).orderBy(this.Bookmark.ID);

        // Migrate bookmarks from old DAO to new SyncStorage.
        // TODO: Remove this code after a couple versions when all data has been translated.
        var oldDAO = this.EasyDAO.create({
          model:   this.Bookmark,
          name:    this.projectName + '_' + this.Bookmark.plural,
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
      factory: function() { return this.Timer.create(); },
      transient: true
    },
    {
      name: 'persistentContext',
      lazyFactory: function() {
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({
            model: this.Binding,
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
      lazyFactory: function() {
        return [
          [ DESC(this.QIssueModel.MODIFIED), 'Last modified' ],
          [ this.QIssueModel.PRI,            'Priority' ],
          [ DESC(this.QIssueModel.ID),       'Issue ID' ]
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
    },
    {
      name: 'QIssueModel',
      factory: function() {
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

        var model = Model.create({
          extends: 'foam.apps.quickbug.model.imported.Issue',

          name: 'QIssue',
          requires: [
            'foam.ui.CSSImageBooleanView',
          ],

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
              type: 'Int',
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
            {
              name: 'labels',
              shortName: 'l',
              aliases: ['label'],
              type: 'String',
              view: 'foam.apps.quickbug.ui.QIssueLabelsView',
              autocompleter: 'foam.apps.quickbug.model.LabelCompleter',
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
                var properties = this.model_.getRuntimeProperties();
                for ( var i = 0 ; i < properties.length ; i++ ) {
                  var p = properties[i];
                  
                  if ( p.name_ === 'LabelArrayProperty' ) {
                    newValues[p.name] = [];
                  } else if ( p.name_ === 'LabelStringProperty' ) {
                    newValues[p.name] = '';
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
              model_: 'foam.apps.quickbug.model.LabelStringEnumProperty',
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
              model_: 'foam.apps.quickbug.model.LabelStringEnumProperty',
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
              type: 'String',
              name: 'metaPriority',
              compareProperty: (this.projectName == "chromium") ?
                (function(p1, p2) {
                  if ( p1.length === 0 && p2.length != 0 ) return 1;
                  else if ( p2.length === 0 && p1.length != 0 ) return -1;
                  return p1.compareTo(p2);
                }) : (function(p1, p2) {
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
                }),
              getter: (this.projectName == "chromium") ?
                (function() { return this.pri; }) :
                (function() { return this.priority; }),
              setter: (this.projectName == "chromium") ?
                (function(value) { this.pri = value; }) :
                (function(value) { this.priority = value; })
            },
            {
              model_: 'foam.apps.quickbug.model.LabelArrayProperty',
              name: 'app',
              tableWidth: '70px'
            },
            {
              model_: 'foam.apps.quickbug.model.LabelArrayProperty',
              name: 'type',
              tableWidth: '70px'
            },
            {
              model_: 'foam.apps.quickbug.model.LabelArrayProperty',
              name: 'm',
              label: 'Milestone',
              aliases: ['mstone', 'milestone'],
              tableLabel: 'M',
              tableWidth: '70px'
            },
            {
              model_: 'foam.apps.quickbug.model.LabelArrayProperty',
              name: 'iteration',
              shortName: 'it',
              aliases: ['iter'],
              tableWidth: '69px'
            },
            {
              model_: 'foam.apps.quickbug.model.LabelArrayProperty',
              name: 'week',
              tableWidth: '69px'
            },
            {
              model_: 'foam.apps.quickbug.model.LabelArrayProperty',
              name: 'releaseBlock',
              shortName: 'rb',
              aliases: ['rBlock', 'release'],
              type: 'String',
              tableWidth: '103px',
              defaultValue: ''
            },
            {
              model_: 'foam.apps.quickbug.model.LabelArrayProperty',
              name: 'cr',
              shortName: 'c',
              aliases: ['cat', 'cr'],
              label: 'Cr',
              tableWidth: '87px',
            },
            {
              type: 'String',
              name: 'status',
              shortName: 's',
              aliases: ['stat'],
              type: 'String',
              preSet: function(_, s) { return s.capitalize(); },
              tableWidth: '58px',
              autocompleter: 'foam.apps.quickbug.model.StatusCompleter',
              defaultValue: ''
            },
            {
              type: 'StringArray',
              name: 'cc',
              autocompleter: 'foam.apps.quickbug.model.PersonCompleter',
              displayWidth: 70
            },
            {
              name: 'owner',
              shortName: 'o',
              tableWidth: '181px',
              type: 'String',
              autocompleter: 'foam.apps.quickbug.model.PersonCompleter',
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
              model_: 'foam.apps.quickbug.model.LabelArrayProperty',
              name: 'OS',
              tableWidth: '61px',
              type: 'String'
            },
            {
              type: 'Boolean',
              name: 'blocked',
              tableWidth: '20px',
              getter: function() { return !! this.blockedOn.length; }
            },
            {
              type: 'DateTime',
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
              type: 'Boolean',
              name: 'starred',
              tableLabel: '',
              tableWidth: '18px',
              tableFormatter: function(val, obj, tableView) {
                var view = obj.CSSImageBooleanView.create({
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
              view: { factory_: 'foam.ui.CSSImageBooleanView', className: 'star-image' },
              help: 'Whether the authenticated user has starred this issue.'
            },
            {
              type: 'Int',
              name: 'stars',
              tableWidth: '20px',
              help: 'Number of stars this issue has.',
              compareProperty: function(o2, o1) {
                return o1 === o2 ? 0 : o1 > o2 ? 1 : -1;
              }
            },
            {
              model_: 'foam.apps.quickbug.model.LabelArrayProperty',
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
              type: 'String',
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

              delete diff.stars;

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

              var empty = true;
              for ( var key in diff ) {
                if ( ! Array.isArray(diff[key]) || diff[key].length > 0 ){
                  empty = false;
                  break;
                }
              }

              if ( empty ) return;

              var comment = this.X.lookup('foam.apps.quickbug.model.QIssueComment').create({
                issueId: this.id,
                content: other.content,
                updates: this.X.lookup('foam.apps.quickbug.model.QIssueCommentUpdate').create(diff)
              }, this.Y);

              out(comment);
            },
            newComment: function() {
              return this.X.lookup('foam.apps.quickbug.model.QIssueComment').create({
                issueId: this.id,
                updates: this.X.lookup('foam.apps.quickbug.model.QIssueCommentUpdate').create({
                  labels: this.labels.clone(),
                  owner: this.owner,
                  blockedOn: this.blockedOn.clone(),
                  blocking: this.blocking.clone(),
                  cc: this.cc.clone(),
                  mergedInto: this.mergedInto,
                  status: this.status,
                  summary: this.summary
                })
              }, this.Y)
            }
          },
          relationships: [
            {
              name: 'comments',
              label: 'Comments on this issue.',
              relatedModel: 'foam.apps.quickbug.model.QIssueComment',
              relatedProperty: 'issueId'
            }
          ]
        });

        model.getPrototype();

        model.getRuntimeProperties().forEach(function(p) {
          if ( ! p["tableFormatter"] ) {
            p["tableFormatter"] = function(v) {
              return v || '----';
            };
          }
        });

        model.LABELS.toMQL = function() { return 'label'; };
        model.AUTHOR.toMQL = function() { return 'reporter'; };
        return model;
      },
      postSet: function(_, m) {
        this.X.registerModel(m);
      }
    },
    {
      name: 'QueryParser',
      factory: function() {
        var parser = {
          X: this.Y,
          __proto__: QueryParserFactory(this.QIssueModel),

          isOpen: literal_ic('is:open'),

          stars: seq(literal_ic('stars:'), sym('number')),

          labelMatch: seq(sym('fieldname'), alt(':', '='), sym('valueList')),

          summary: str(plus(notChar(' ')))

        }.addActions({
          isOpen: function(v) {
            return this.X.QueryParser.parseString(this.X.openPredicate);
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

            return IN(this.X.QIssue.LABELS, a).partialEval();
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
            return this.X.lookup('foam.apps.quickbug.model.DefaultQuery').create({arg1: v});
          }
        });
        parser.expr = alt(
          sym('isOpen'),
          parser.export('expr'),
          sym('stars'),
          sym('labelMatch'),
          sym('summary')
        );

        return parser;
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
        this.IssueMDAO.select(GROUP_BY(this.QIssueModel.CC, COUNT()))(function(g) {
          Object.keys(g.groups).forEach(function(key) {
            self.PersonDAO.find(key, { error: function() {
              self.PersonDAO.put(self.IssuePerson.create({ name: key }));
            }});
          });
        });
      }
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);

      if ( this.projectName !== 'chromium' ) {
        this.defaultSortChoices = [
          [ DESC(this.QIssueModel.MODIFIED), 'Last modified' ],
          [ this.QIssueModel.PRIORITY,       'Priority' ],
          [ DESC(this.QIssueModel.ID),       'Issue ID' ]
        ];
      }

      if ( ! this.X.DontSyncProjectData ) {
        this.IssueDAO.listen(this.onDAOUpdate);

        this.persistentContext.bindObject('syncManager', this.SyncManager.xbind({
          syncInterval: 60*5,
          batchSize: 500,
        }), {
          queryParser: this.QueryParser,
          srcDAO: this.IssueNetworkDAO,
          dstDAO: this.IssueCachingDAO,
          modifiedProperty: this.QIssueModel.MODIFIED
        }, 2)(function(manager) {
          this.syncManager = manager;
          this.syncManagerFuture.set(manager);
          manager.start();
        }.bind(this));
      }
    },

    /** Open a Browser in a Window for a Chome Packaged App. **/
    launchBrowser: function(opt_url) {
      var self = this;

      chrome.app.window.create('empty.html', {width: 1000, height: 800}, function(w) {
        w.contentWindow.onload = function() {
          var window = self.window = w.contentWindow;

          self.X.arequire('foam.apps.quickbug.ui.ChromeAppBrowser')(
            function (model) {
              $addWindow(window);
              var Y = self.Y.subWindow(window, 'Browser Window');
              var b = model.create({project: self}, Y);
              Y.touchManager = Y.foam.input.touch.TouchManager.create({}, Y);
              window.document.body.outerHTML = b.toHTML()
              b.initHTML();
              if ( opt_url ) b.maybeSetLegacyUrl(opt_url);
              w.focus();
              self.metricDAO.put(self.Metric.create({
                name: 'browserLaunched'
              }));
            });
        };

        w.onClosed.addListener(function() {
          $removeWindow(window);
        });
      });
    },

    /** Create a Browser for use in a hosted app. **/
    createBrowser: function(window) {
      var b = this.X.Browser.create({project: this, window: window}, this.Y);
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
            var Y = self.Y.subWindow(window, 'Sync Config')
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
