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
  name: 'QBug',
  package: 'foam.apps.quickbug.model',
  label: 'Quick Bug',

  requires: [
    'PersistentContext',
    'foam.dao.IDBDAO',
    'foam.core.dao.MigrationDAO',
    'foam.core.dao.MigrationRule',
    'Binding',
    'foam.core.dao.RestDAO',
    'foam.dao.LazyCacheDAO',
    'foam.apps.quickbug.dao.ProjectNetworkDAO',
    'foam.apps.quickbug.model.imported.Project',
    'foam.apps.quickbug.model.QUser',
    'foam.apps.quickbug.model.QProject',
    'foam.metrics.Metric'
  ],

  imports: [
    'metricDAO'
  ],

  properties: [
    {
      name: 'baseURL',
      defaultValue: 'https://code.google.com/p/'
    },
    {
      name: 'jsonpFuture',
      transient: true,
      factory: function() { return deferJsonP(this.X); }
    },
    {
      name: 'user',
      type: 'foam.apps.quickbug.model.QUser',
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removePropertyListener('email', this.onUserUpdate);
        newValue.addPropertyListener('email', this.onUserUpdate);
        this.onUserUpdate();
      }
    },
    {
      name: 'userFuture',
      transient: true,
      factory: function() { return afuture(); }
    },
    {
      name: 'userReady',
      factory: function() { return afuture(); }
    },
    {
      name: 'persistentContext',
      transient: true,
      factory: function() {
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({ model: this.Binding }),
          predicate: NOT_TRANSIENT,
          context: this
        });
      }
    },
    {
      name: 'projectNetworkDAO',
      factory: function() {
        return this.ProjectNetworkDAO.create();
      },
      transient: true
    },
    {
      name: 'ProjectDAO',
      transient: true,
      factory: function() {
        return this.LazyCacheDAO.create({
          cache: this.MigrationDAO.create({
            name: 'project-dao',
            delegate: this.IDBDAO.create({
              model: this.Project,
              useSimpleSerialization: false
            }),
            rules: [
              this.MigrationRule.create({
                modelName: 'QProject',
                version: 3,
                migration: function(ret, dao) {
                  dao.removeAll()(ret);
                }
              })
            ]
          }),
          delegate: this.projectNetworkDAO
        });
      }
    },
    {
      // Cache of QProject objects
      name: 'projects_',
      factory: function() { return {}; },
      transient: true
    },
    {
      name: 'defaultProjectName',
      defaultValue: 'chromium'
    },
    {
      name: 'authAgent2'
    },
    {
      type: 'StringArray',
      name: 'scopes',
      factory: function() {
        return [
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/projecthosting"
        ];
      }
    }
  ],

  methods: {
    init: function(args) {
      // Fix up the imported models.

      this.X.foam.apps.quickbug.model.imported.Issue.properties.forEach(function(p) {
        if ( ! p["tableFormatter"] ) {
          p["tableFormatter"] = function(v) {
            return v || '----';
          };
        }
        if ( ! p["tableWidth"] ) {
          p["tableWidth"] = '80px;'
        }
      });

      this.X.foam.apps.quickbug.model.imported.IssuePerson.ids = ['name'];

      this.SUPER(args);
      var self = this;

      this.initOAuth(args && args.authClientId, args && args.authClientSecret);

      this.persistentContext.bindObject('user', this.QUser, undefined, 2)(function(user) {
        self.userFuture.set(user);
        if ( user.email ) self.userReady.set(user);
        else self.refreshUser();
      });
    },

    initOAuth: function(opt_clientId, opt_clientSecret) {
      var self = this;
      var model = this.X.lookup('foam.oauth2.EasyOAuth2');
      this.persistentContext.bindObject('authAgent2', model, {
        clientId: opt_clientId ||
          '18229540903-ajaqivrvb8vu3c1viaq4drg3847vt9nq.apps.googleusercontent.com',
        clientSecret: opt_clientSecret ||
          'mbxy7-eZlosojSZgHTRT15o9',
        scopes: self.scopes
      }, 3)(function(oauth2) {
        oauth2.setJsonpFuture(self.X, self.jsonpFuture);
      });
    },

    refreshUser: function() {
      var self = this;
      this.userFuture.get(function(user) {
        apar(
          self.X.ajsonp("https://www.googleapis.com/oauth2/v1/userinfo", ["alt=json"]),
          self.X.ajsonp("https://www.googleapis.com/projecthosting/v2/users/me"))(function(resp1, status1, resp2, status2) {
            if ( resp1 ) user.email = resp1.email;
            if ( resp2 ) user.copyFrom(resp2);
            self.userReady.set(user);
          })
      });
    },

    findProject: function(projectName, sink, opt_X) {
      if ( this.projects_[projectName] ) {
        sink.put(this.projects_[projectName]);
        return;
      }

      var self = this;

      this.ProjectDAO.find(projectName, {
        __proto__: sink,
        put: function(project) {
          var p = self.QProject.create({
            qbug: self,
            project: project
          }, (opt_X || self.Y));

          self.projects_[projectName] = p;

          sink.put(p);
        },
        error: function() {
          sink.error && sink.error();
        }
      });
    },

    getDefaultProject: function(sink, opt_X) {
      this.findProject(this.defaultProjectName, sink, opt_X);
    },

    launchBrowser: function(opt_projectName, opt_url, opt_X) {
      var self = this;
      this.userReady.get(function(user) {
        self.findProject(opt_projectName || user.defaultProject, {
          put: function(p) {
            console.log('launch: ', p);
            p.launchBrowser(opt_url);
          },
          error: function() {
            self.metricDAO.put(self.Metric.create({
              type: 'error',
              name: 'defaultProjectNotFound'
            }));
            console.warn("Couldn't find default project, default to ", self.defaultProjectName);
            if ( opt_projectName === self.defaultProjectName) {
              // TODO: Some sort of error view that we couldn't find the project.
              console.error("Couldn't find a project, you're probably offline.");
              self.metricDAO.put(self.Metric.create({
                type: 'error',
                name: 'noProjectFound'
              }));
              return;
            }
            self.launchBrowser(self.defaultProjectName, undefined, opt_X);
          },
        }, opt_X);
      });
    }
  },

  listeners: [
    {
      name: 'onUserUpdate',
      code: function() {
        this.X.ME = this.user.email;
      }
    }
  ]
});
