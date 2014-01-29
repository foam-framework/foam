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
var QBug = Model.create({
  name: 'QBug',
  label: 'Quick Bug',

  properties: [
    {
      name: 'baseURL',
      defaultValue: 'https://code.google.com/p/'
    },
    {
      name: 'defaultProjectName',
      defaultValue: 'foam-framework'
    },
    {
      model_: 'StringProperty',
      name: 'user',
      postSet: function(newValue) {
        QueryParser.ME = newValue;
      }
    },
    {
      name: 'persistentContext',
      valueFactory: function() {
        return PersistentContext.create({
          dao: IDBDAO.create({
            model: Binding
          }),
          context: this
        });
      }
    },
    {
      name: 'userInfo',
      type: 'UserInfo',
      postSet: function(newValue, oldValue) {
        // TODO clean this up when scopes are implemented.
        oldValue && oldValue.removePropertyListener('email', this.userInfoUpdate);
        newValue.addPropertyListener('email', this.userInfoUpdate);
        this.userInfoUpdate();
      }
    },
    {
      name: 'ProjectNetworkDAO',
      valueFactory: function() {
        var dao = RestDAO.create({
          url: 'https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/',
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
      defaultValue: [],
      transient: true
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.persistentContext.bindObject('userInfo', UserInfo)(function(userInfo) {
        ajsonp("https://www.googleapis.com/oauth2/v1/userinfo?alt=json")(
          function(response) {
            if ( response ) {
              userInfo.copyFrom(response);
            }
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
          var p = QProject.create({qbug: self, project: project});

          self.projects_[projectName] = p;

          sink.put(p);
        }
      });
    },

    getDefaultProject: function(sink) {
      this.findProject(this.defaultProjectName, sink);
    },

    launchBrowser: function(opt_projectName) {
      this.findProject(opt_projectName || this.defaultProjectName, {put: function(p) {
        console.log('launch: ', p);
        p.launchBrowser();
      }});
    }
  },

  listeners: [
    {
      name: 'userInfoUpdate',
      code: function() {
        this.user = this.userInfo.email;
      }
    }
  ]
});
