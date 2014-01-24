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
      name: 'ProjectNetworkDAO',
      valueFactory: function() {
        var dao = RestDAO.create({
          url: 'https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/',
          model: Project
        });

        dao.buildURL = function(options) {
console.log('*********** url', this.url + options.query.arg2.f());
          return this.url + options.query.arg2.f();
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
      name: 'projects_',
      defaultValue: [],
      transient: true
    }
  ],

  methods: {
    getProject: function(projectName, sink) {
      if ( this.projects_[projectName] ) {
        sink.put(this.projects_[projectName]);
        return;
      }

      var self = this;

      this.ProjectNetworkDAO.find(EQ(Project.NAME, projectName), {
        __proto__: sink,
        put: function(project) {
          var p = QProject.create({qbug: self, name: projectName, project: project});

          this.projects_[projectName] = p;

          sink.put(p);
        }
      });
    },

    getDefaultProject: function(sink) {
      this.getProject(this.defaultProjectName, sink);
    },

    launchBrowser: function() {
      this.getDefaultProject({put: function(p) {
        console.log('launch: ', p);
        p.launchBrowser();
      }});
    }
  }
});
