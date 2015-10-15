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
  name: 'IssueConfig',
  package: 'foam.navigator',
  extends: 'foam.navigator.BrowserConfig',
  requires: [
    'XHR',
    'foam.navigator.types.Issue',
  ],

  properties: [
    {
      name: 'name',
      defaultValue: 'IssueBrowser'
    },
    {
      name: 'model',
      defaultValueFn: function() { return this.Issue; }
    },
    {
      name: 'dao',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Issue,
          cache: true
        });
      }
    },
    {
      name: 'queryParserFactory',
      defaultValue: function() {
        // Produces a query parser function. Currently this parser understands:
        // - assignee:me and assignee:adamvy
        // - reporter:me and reporter:kgr
        // - status:open
        // - cc:kgr
        // - star:true and star:false
        // - text searches against title and comment.
        var model = this.Issue;
        return function(q) {
          var terms = q.split(/ +/);
          var queries = [];
          for ( var i = 0 ; i < terms.length ; i++ ) {
            var t = terms[i];
            var parts = t.split(':');
            if (parts.length === 1) {
              queries.push(CONTAINS_IC(SEQ(model.TITLE, model.COMMENT), t));
            } else if ( parts[0] === 'assignee' ) {
              queries.push(EQ(model.ASSIGNEE, parts[1]));
            } else if ( parts[0] === 'reporter' ) {
              queries.push(EQ(model.REPORTER, parts[1]));
            } else if ( parts[0] === 'status' ) {
              var base = IN(model.STATUS, ['NEW', 'ASSIGNED', 'ACCEPTED']);
              if ( parts[1] === 'closed' ) {
                queries.push(NOT(base));
              } else if ( parts[1] === 'open' ) {
                queries.push(base);
              } else {
                queries.push(EQ(model.STATUS, parts[1]));
              }
            } else if ( parts[0] === 'star' ) {
              queries.push(EQ(model.STARRED, parts[1]));
            } else if ( parts[0] === 'cc' ) {
              queries.push(CONTAINS_IC(model.CC, parts[1]));
            }
          }
          return AND.apply(null, queries).partialEval();
        };
      }
    }
  ]
});
