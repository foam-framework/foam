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
var IssueRestDAO = FOAM({
  model_: 'Model',
  extendsModel: 'RestDAO',

  name: 'IssueRestDAO',

  methods: {
    jsonToObj: function(json) {
      // Adapt IssuePerson types to just Strings
      if ( json.cc ) {
        for ( var i = 0 ; i < json.cc.length ; i++ )
          json.cc[i] = json.cc[i].name.intern();
      }
      if ( json.owner ) json.owner = json.owner.name.intern();
      if ( json.author ) json.author = json.author.name.intern();
      if ( json.blocking ) json.blocking = json.blocking.map(function(b) { return b.issueId });
      if ( json.blockedOn ) json.blockedOn = json.blockedOn.map(function(b) { return b.issueId });

      if ( json.mergedInto ) json.mergedInto = json.mergedInto.issueId;
      if ( json.state ) json.state = json.state.intern();
      if ( json.status ) json.status = json.status.intern();
      if ( json.summary == json.title ) json.summary = json.title;
      delete json['kind'];
      delete json['projectId'];
      if ( json.labels ) json.labels = json.labels.intern();
      if ( json.closed ) json.closed = new Date(json.closed).getTime()/1000;
      if ( json.updated ) json.updated = new Date(new Date(json.updated).getTime());
      if ( json.published ) json.published = new Date(json.published).getTime()/1000;

      return this.model.create(json);
    }
  }
});

var QIssueStarringDAO = FOAM({
  model_: 'Model',
  name: 'QIssueStarringDAO',
  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'url'
    }
  ],

  methods: {
    put: function(obj, sink) {
      var star = obj.starred ? '/star' : '/unstar';
      var self = this;
      ajsonp(this.url + '/' + obj.id + star, undefined, 'POST')(
        function(resp, status){
          if ( status >= 200 && status < 300 ) {
            self.delegate.put(obj, sink);
          } else {
            sink && sink.error && sink.error('put', obj);
          }
        });
    }
  }
});

var QIssueCommentNetworkDAO = FOAM({
  model_: 'Model',
  name: 'QIssueCommentNetworkDAO',
  extendsModel: 'RestDAO',

  methods: {
    buildURL: function(options) {
      if ( EqExpr.isInstance(options.query) ) {
        return this.url + '/' + options.query.arg2.f() + '/comments';
      }
      return this.url;
    }
  }
});

/*
IssueNetworkDAO
  .where(GT(QIssue.UPDATED, new Date(Date.now() - FIVE_MINS)))
  .limit(10)
  .select(console.log.json);

IssueCommentNetworkDAO.where(EQ(CrIssue.ID, 225776)).select(console.log.json);
*/
