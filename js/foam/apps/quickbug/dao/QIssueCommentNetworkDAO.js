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
  name: 'QIssueCommentNetworkDAO',
  package: 'foam.apps.quickbug.dao',
  extends: 'foam.core.dao.RestDAO',

  requires: [
    'foam.apps.quickbug.model.QIssueComment',
  ],

  properties: [
    'IssueDAO',
  ],

  methods: {
    buildURL: function(outquery, extra) {
      var query = outquery[0];

      if ( ! query ) return this.url;

      var id;

      if ( AndExpr.isInstance(query) &&
           NeqExpr.isInstance(query.args[0]) &&
           query.args[0].arg1 == this.QIssueComment.ISSUE_ID &&
           ConstantExpr.isInstance(query.args[0].arg2) && query.args[0].arg2.arg1 == '' &&
           EqExpr.isInstance(query.args[1]) &&
           query.args[1].arg1 === this.QIssueComment.ISSUE_ID ) {
        id = query.args[1].arg2.arg1
        query = TRUE;
      } else if ( EqExpr.isInstance(query) && query.arg1 === this.QIssueComment.ISSUE_ID ) {
        id = query.arg2.arg1;
        query = TRUE
      }

      if ( OrExpr.isInstance(query) ) {
        for ( var i = 0; i < query.args.length; i++ ) {
          var arg = query.args[i];

          if ( AndExpr.isInstance(arg) ) {
            for ( var j = 0; j < arg.args.length; j++ ) {
              var subarg = arg.args[j];

              if ( EqExpr.isInstance(subarg) && subarg.arg1 === this.X.QIssue.ISSUE_ID ) {
                if ( id && subarg.arg2.arg1 === id ) id = subarg.arg2.arg1;
                arg.args[j] = TRUE;
              }
            }
          } else if ( EqExpr.isInstance(arg) && arg.arg1 === this.X.QIssue.ISSUE_ID ) {
            id = arg.arg2.arg1;
            query.args[i] = TRUE;
          }
        }
      }

      extra.issueId = id;

      outquery[0] = query.partialEval();
      return this.url + '/' + id + '/comments';
    },
    jsonToObj: function(obj, extra) {
      var obj = this.SUPER(obj);
      obj.issueId = extra.issueId;
      obj.seqNo = obj.id;
      obj.id = obj.id + '_' + extra.issueId;
      return obj;
    },
    objToJson: function(obj, extra) {
      if ( ! obj.content ) obj.content = "(No comment was entered for this change.)";
      extra.issueId = obj.issueId;
      var json = JSONUtil.where(
          IN(Property.NAME, [
            'author',
            'content',
            'published',
            'updates',
            'cc',
            'labels',
            'owner',
            'status',
            'summary'
          ])).stringify(obj);
      return json;
    },
    buildPutURL: function(obj) {
      return this.url + '/' + obj.issueId + '/comments';
    }
  }
});
