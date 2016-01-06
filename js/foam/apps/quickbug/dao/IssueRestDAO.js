/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  name: 'IssueRestDAO',
  extends: 'foam.core.dao.RestDAO',

  requires: [
    'foam.apps.quickbug.model.DefaultQuery'
  ],

  properties: [
    {
      name: 'QIssue',
      factory: function() { return this.X.QIssue; }
    },
    {
      name: 'IssueCommentDAO',
      help: 'The associated IssueCommentDAO.  Required for updates to work.'
    }
  ],

  methods: {
    jsonToObj: function(json) {
      if ( json.cc ) {
        for ( var i = 0 ; i < json.cc.length ; i++ )
          json.cc[i] = json.cc[i].name;
      }
      if ( json.owner  ) json.owner  = json.owner.name;
      if ( json.author ) json.author = json.author.name;

      // Adapt IssuePerson types to just Strings
      if ( json.blocking ) json.blocking = json.blocking.map(function(b) { return b.issueId });
      if ( json.blockedOn ) json.blockedOn = json.blockedOn.map(function(b) { return b.issueId });

      if ( json.mergedInto ) json.mergedInto = json.mergedInto.issueId;
      if ( json.state ) json.state = json.state.intern();
      if ( json.status ) json.status = json.status.intern();
      if ( json.summary == json.title ) json.summary = json.title;
      delete json['kind'];
      delete json['projectId'];
      delete json['movedFrom']; // conflicts with movedFrom label/psedo-property
      if ( json.labels ) json.labels = json.labels.intern();
      if ( json.closed ) json.closed = new Date(json.closed);
      if ( json.updated ) json.updated = new Date(json.updated);
      if ( json.published ) json.published = new Date(json.published);

      return this.model.create(json);
    },

    objToJson: function(obj, extra) {
      var data = JSON.parse(this.SUPER(obj));
      if ( data.owner ) data.owner = { name: data.owner };
      return JSON.stringify(data);
    },

    buildSelectParams: function(sink, outquery) {
      var query = outquery[0];

      if ( ! query ) return [];

      var candidates = [];
      var updatedMin;
      var required = 1;

      // TODO: Generify this and move it to a helper function.
      // When mLangs have compareTo this will be much easier.
      if ( GtExpr.isInstance(query) && query.arg1 === this.QIssue.MODIFIED ) {
        updatedMin = query.arg2.arg1.getTime();
        query = TRUE
      } else if ( AndExpr.isInstance(query) ) {
        for ( var j = 0; j < query.args.length; j++ ) {
          var arg = query.args[j];

          if ( GtExpr.isInstance(arg) && arg.arg1 === this.QIssue.MODIFIED ) {
            candidates.push([arg.arg2.arg1.getTime(), [[query, j]]]);
          }
        }
      } else if ( OrExpr.isInstance(query) ) {
        required = query.args.length;

        for ( var i = 0; i < query.args.length; i++ ) {
          var arg = query.args[i];

          if ( AndExpr.isInstance(arg) ) {
            for ( j = 0; j < arg.args.length; j++ ) {
              var subarg = arg.args[j];

              if ( GtExpr.isInstance(subarg) && subarg.arg1 === this.QIssue.MODIFIED ) {
                for ( var k = 0; k < candidates.length; k++ ) {
                  if ( candidates[k][0] === subarg.arg2.arg1.getTime() ) {
                    candidates[k][1].push([arg, j]);
                  }
                }
                if ( k === candidates.length ) {
                  candidates.push([subarg.arg2.arg1.getTime(), [[arg, j]]]);
                }
              }
            }
          } else if ( GtExpr.isInstance(arg) && arg.arg1 === this.QIssue.MODIFIED ) {
            for ( k = 0; k < candidates.length; k++ ) {
              if ( candidates[k][0] === arg.arg2.arg1.getTime() ) {
                candidates[k][1].push([query, i]);
              }
            }
            if ( k === candidates.length ) {
              candidates.push([arg.arg2.arg1.getTime(), [[query, i]]]);
            }
          }
        }
      }

      for ( k = 0; k < candidates.length; k++ ) {
        if ( candidates[k][1].length === required ) {
          updatedMin = candidates[k][0];
          for ( i = 0; i < candidates[k][1].length; i++ ) {
            candidates[k][1][i][0].args[candidates[k][1][i][1]] = TRUE;
          }
          break;
        }
      }

      outquery[0] = query.partialEval();

      // Strip out DefaultQuery from the original query, we will
      // assume that the server does a perfect match for these fields and not
      // apply is locally.  The server does a full text search of keywords
      // and we don't have that data to process it locally, so we don't want to filter
      // those results.

      var defaultQuery = this.DefaultQuery
      function stripDefaultQuery(m) {
        if ( defaultQuery.isInstance(m) ) return TRUE;
        if ( m.args ) {
          for ( var i = 0; i < m.args.length; i++ ) {
            m.args[i] = stripDefaultQuery(m.args[i]);
          }
        }
        return m;
      }

      outquery[1] = stripDefaultQuery(outquery[1]).partialEval();

      return updatedMin ? ["updatedMin=" + Math.floor(updatedMin/1000)] : [];
    },

    put: function(issue, sink) {
      var self = this;
      var super_ = this.SUPER;

      aseq(
        apar(
          function(ret) {
            if ( issue.id ) self.find(issue.id, ret);
            else ret();
          },
          function(ret) {
            if ( ! issue.id ) {
              ret();
              return;
            }
            var star = issue.starred ? '/star' : '/unstar';
            self.X.ajsonp(self.url + '/' + issue.id + star, undefined, 'POST')(ret);
          }),
        function(ret, existing) {
          aif(!existing,
              function(ret) {
                super_.call(self, issue, sink);
                ret();
              },
              aseq(
                function(ret) {
                  var actions = [];
                  existing.writeActions(
                    issue,
                    function(a) { actions.push(function(ret) { self.IssueCommentDAO.put(a, ret); }); });
                  if ( actions.length ) aseq.apply(null, actions)(ret);
                  else ret();
                },
                function(ret) {
                  self.find(issue.id, ret);
                },
                function(ret, result) {
                  if ( sink ) {
                    if ( result ) {
                      sink.put && sink.put(result);
                    }
                    else sink.error && sink.error('put', issue);
                  }
                  if ( result ) self.notify_('put', [result]);
                  ret();
                })
             )(ret);
        })(function(){});
    },

    invalidate: function(id) {
      var self = this;
      this.find(id, {
        put: function(issue) {
          self.notify_('put', [issue]);
        }
      });
    }
  }
});
