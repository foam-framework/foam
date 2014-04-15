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
FOAModel({
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
        return PersistentContext.create({
          dao: IDBDAO.create({
            model: Binding
          }),
          context: this
        });
      }
    },
    {
      name: 'ProjectNetworkDAO',
      factory: function() {
        var dao = RestDAO.create({
          url: 'https://www.googleapis.com/projecthosting/v2/projects/',
          model: Project
        });

        dao.buildFindURL = function(key) {
          return this.url + key;
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
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      var self = this;
      this.persistentContext.bindObject('user', QUser)(function(user) {
        self.userFuture.set(user);

        ajsonp("https://www.googleapis.com/oauth2/v1/userinfo", ["alt=json"])(
          function(response) {
            if ( response ) {
              user.email = response.email;
            }
          });

        ajsonp("https://www.googleapis.com/projecthosting/v2/users/me")(
          function(response) {
            response && user.copyFrom(response);
          });
      });
    },

    findProject: function(projectName, sink) {
      if ( this.projects_[projectName] ) {
        sink.put(this.projects_[projectName]);
        return;
      }

      var self = this;

      this.ProjectNetworkDAO.find(projectName, {
        __proto__: sink,
        put: function(project) {
          var p = self.X.QProject.create({qbug: self, project: project});

          self.projects_[projectName] = p;

          sink.put(p);
        }
      });
    },

    getDefaultProject: function(sink) {
      this.findProject(this.defaultProjectName, sink);
    },

    launchBrowser: function(opt_projectName, opt_url) {
      var self = this;
      this.userFuture.get(function(user) {
        self.findProject(opt_projectName || user.defaultProject, {put: function(p) {
          console.log('launch: ', p);
          p.launchBrowser(opt_url);
        }});
      });
    }
  },

  listeners: [
    {
      name: 'onUserUpdate',
      code: function() {
        QueryParser.ME = this.user.email;
      }
    }
  ]
});
