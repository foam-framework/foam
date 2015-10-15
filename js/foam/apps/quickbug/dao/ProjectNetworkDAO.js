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
  package: 'foam.apps.quickbug.dao',
  name: 'ProjectNetworkDAO',
  extends: 'foam.core.dao.RestDAO',

  requires: [
    'foam.apps.quickbug.model.imported.Project',
    'foam.apps.quickbug.model.imported.IssuePerson',
    'foam.apps.quickbug.model.QIssueStatus',
    'foam.apps.quickbug.model.QIssueLabel'
  ],

  properties: [
    {
      name: 'url',
      defaultValue: 'https://www.googleapis.com/projecthosting/v2/projects/'
    },
    {
      name: 'model',
      defaultValueFn: function() { return this.X.lookup('foam.apps.quickbug.model.imported.Project'); }
    }
  ],
  methods: {
    buildFindURL: function(key) {
      return this.url + key;
    },
    jsonToObj: function(json) {
      if ( json.members ) {
        for ( var i = 0; i < json.members.length; i++ ) {
          json.members[i] = this.IssuePerson.create(json.members[i]);
        }
      }

      if ( json.issuesConfig ) {
        if ( json.issuesConfig.statuses ) {
          for ( i = 0; i < json.issuesConfig.statuses.length; i++ ) {
            json.issuesConfig.statuses[i] =
              this.QIssueStatus.create(json.issuesConfig.statuses[i]);
          }
        }

        if ( json.issuesConfig.labels ) {
          for ( i = 0; i < json.issuesConfig.labels.length; i++ ) {
            json.issuesConfig.labels[i] =
              this.QIssueLabel.create(json.issuesConfig.labels[i]);
          }
        }
      }
      return this.model.create(json);
    }
  }
});
