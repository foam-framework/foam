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

var BROWSERS = []; // for debugging


/** QuickBug Top-Level Object. **/
MODEL({
  name: 'QBug',
  label: 'Quick Bug',

  properties: [
    {
      name: 'baseURL',
      defaultValue: 'https://code.google.com/p/'
    },
    {
      name: 'user',
      type: 'QUser',
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removePropertyListener('email', this.onUserUpdate);
        newValue.addPropertyListener('email', this.onUserUpdate);
        this.onUserUpdate();
      }
    },
    {
      name: 'userFuture',
      factory: function() { return afuture(); }
    },
    {
      name: 'persistentContext',
      factory: function() {
        return this.X.PersistentContext.create({
          dao: this.X.IDBDAO.create({ model: this.X.Binding }),
          context: this
        });
      }
    },
    {
      name: 'ProjectNetworkDAO',
      factory: function() {
        var dao = this.X.RestDAO.create({
          url: 'https://www.googleapis.com/projecthosting/v2/projects/',
          model: Project
        });

        dao.buildFindURL = function(key) {
          return this.url + key;
        };

        dao.jsonToObj = function(json) {
          if ( json.members ) {
            for ( var i = 0; i < json.members.length; i++ ) {
              json.members[i] = IssuePerson.create(json.members[i]);
            }
          }

          if ( json.issuesConfig ) {
            if ( json.issuesConfig.statuses ) {
              for ( i = 0; i < json.issuesConfig.statuses.length; i++ ) {
                json.issuesConfig.statuses[i] =
                  this.X.QIssueStatus.create(json.issuesConfig.statuses[i]);
              }
            }

            if ( json.issuesConfig.labels ) {
              for ( i = 0; i < json.issuesConfig.labels.length; i++ ) {
                json.issuesConfig.labels[i] =
                  this.X.QIssueLabel.create(json.issuesConfig.labels[i]);
              }
            }
          }
          return this.model.create(json);
        };

          /*
        dao.jsonToObj = function(json) {
          if ( json.author ) json.author = json.author.name;

          return this.model.create(json);
        };
        */

        return dao;
      },
      transient: true
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
      model_: 'StringArrayProperty',
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
      this.SUPER(args);
      var self = this;

      this.initOAuth(args && args.authClientId, args && args.authClientSecret);

      this.persistentContext.bindObject('user', QUser)(function(user) {
        self.userFuture.set(user);
        self.refreshUser();
      });
    },

    initOAuth: function(opt_clientId, opt_clientSecret) {
      var jsonpFuture = deferJsonP(this.X);

      var self = this;
      this.persistentContext.bindObject('authAgent2', EasyOAuth2.xbind({
        clientId: opt_clientId ||
          '18229540903-ajaqivrvb8vu3c1viaq4drg3847vt9nq.apps.googleusercontent.com',
        clientSecret: opt_clientSecret ||
          'mbxy7-eZlosojSZgHTRT15o9'
      }), {
        scopes: self.scopes
      })(function(oauth2) {
        oauth2.setJsonpFuture(self.X, jsonpFuture);
      });
    },

    refreshUser: function() {
      var self = this;
      this.userFuture.get(function(user) {
        self.X.ajsonp("https://www.googleapis.com/oauth2/v1/userinfo", ["alt=json"])(
          function(response) {
            if ( response ) {
              user.email = response.email;
            }
          });

        self.X.ajsonp("https://www.googleapis.com/projecthosting/v2/users/me")(
          function(response) {
            response && user.copyFrom(response);
          });
      });
    },

    findProject: function(projectName, sink, opt_X) {
      if ( this.projects_[projectName] ) {
        sink.put(this.projects_[projectName]);
        return;
      }

      var self = this;

      this.ProjectNetworkDAO.find(projectName, {
        __proto__: sink,
        put: function(project) {
          var p = (opt_X || (self.X.sub())).QProject.create({qbug: self, project: project});

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
      this.userFuture.get(function(user) {
        self.findProject(opt_projectName || user.defaultProject, {
          put: function(p) {
            console.log('launch: ', p);
            p.launchBrowser(opt_url);
          },
          error: function() {
            metricsSrv.sendException('Failed to find default project.');
            console.warn("Couldn't find default project, default to ", self.defaultProjectName);
            if ( opt_projectName === self.defaultProjectName) {
              // TODO: Some sort of error view that we couldn't find the project.
              console.error("Couldn't find a project, you're probably offline.");
              metricsSrv.sendException('Failed to find project.', true);
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
