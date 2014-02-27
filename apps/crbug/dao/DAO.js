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
    },

    buildSelectParams: function(sink, outquery) {
      var query = outquery[0];

      if ( ! query ) return this.url;

      var candidates = [];
      var updatedMin;
      var required = 1;

      // TODO: Generify this and move it to a helper function.
      // When mLangs have compareTo this will be much easier.
      if ( GtExpr.isInstance(query) && query.arg1 === QIssue.MODIFIEDn ) {
        updatedMin = query.arg2.arg1.getTime();
        query = TRUE
      } else if ( AndExpr.isInstance(query) ) {
        for ( var j = 0; j < query.args.length; j++ ) {
          var arg = query.args[j];

          if ( GtExpr.isInstance(arg) && arg.arg1 === QIssue.UPDATED ) {
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

              if ( GtExpr.isInstance(subarg) && subarg.arg1 === QIssue.MODIFIED ) {
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
          } else if ( GtExpr.isInstance(arg) && arg.arg1 === QIssue.MODIFIED ) {
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

      if ( updatedMin ) return ["updatedMin=" + Math.floor(updatedMin/1000)];
      return [];
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
    buildURL: function(outquery, extra) {
      var query = outquery[0];

      if ( ! query ) return this.url;

      var id;

      if ( EqExpr.isInstance(query) && query.arg1 === QIssueComment.ISSUE_ID ) {
        id = query.arg2.arg1;
        query = TRUE
      }

      if ( OrExpr.isInstance(query) ) {
        for ( var i = 0; i < query.args.length; i++ ) {
          var arg = query.args[i];

          if ( AndExpr.isInstance(arg) ) {
            for ( var j = 0; j < arg.args.length; j++ ) {
              var subarg = arg.args[j];

              if ( EqExpr.isInstance(subarg) && subarg.arg1 === QIssue.ISSUE_ID ) {
                if ( id && subarg.arg2.arg1 === id ) id = subarg.arg2.arg1;
                arg.args[j] = TRUE;
              }
            }
          } else if ( EqExpr.isInstance(arg) && arg.arg1 === QIssue.ISSUE_ID ) {
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
      return obj;
    },
    objToJson: function(obj) {
      if ( ! obj.content ) obj.content = "(No comment was entered for this change.)";
      var json = JSONUtil.compact.where(
          IN(Property.NAME, [
            'author',
            'content',
            'published',
            'updates',
            'blockedOn',
            'blocking',
            'cc',
            'labels',
            'mergedInto',
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

/*
IssueNetworkDAO
  .where(GT(QIssue.MODIFIED, new Date(Date.now() - FIVE_MINS)))
  .limit(10)
  .select(console.log.json);

IssueCommentNetworkDAO.where(EQ(CrIssue.ID, 225776)).select(console.log.json);
*/

/**
 * Merge data from the local and network Issue DAO's.
 * Remote data is stored non-permanently in the local MDAO.
 * Also merges DAO update events so as to not force the GUI to update on every frame.
 **/
var QIssueSplitDAO = FOAM({
   model_: 'Model',
   extendsModel: 'AbstractDAO',

   name: 'QIssueSplitDAO',

   properties: [
      {
         model_: 'StringProperty',
         name: 'activeQuery'
      },
      {
         name: 'local',
         type: 'DAO',
         mode: "read-only",
         hidden: true,
         required: true
      },
      {
         name: 'remote',
         type: 'DAO',
         mode: "read-only",
         hidden: true,
         required: true
      }
   ],

   methods: {
    init: function() {
      this.relay_ =  {
        put:    EventService.merged(function() { this.notify_('put',    arguments); }.bind(this), 1000),
        remove: EventService.merged(function() { this.notify_('remove', arguments); }.bind(this), 1000)
      };

      this.local.listen(this.relay_);
    },

     put: function(value, sink) {
       this.local.put(value, sink);
     },

     remove: function(query, sink) {
       this.local.remove(query, sink);
     },

     putIfMissing: function(issue) {
       var local = this.local;

       local.find(issue.id, {
         error: function() { local.put(issue); }
       });
     },

     // If we don't find the data locally, then look in the remote DAO (and cache locally)
     find: function(key, sink) {
       var local  = this.local;
       var remote = this.remote;

       local.find(key, {
         __proto__: sink,
         error: function() {
           remote.find(key, {
             put: function(issue) {
               sink.put(issue);
               local.put(issue);
             }
           });
         }
       });
     },

     select: function(sink, options) {
       if ( CountExpr !== sink.model_ ) {
         var query = ( options && options.query && options.query.toSQL() ) || "";

         if ( query && query !== this.activeQuery ) {
           this.activeQuery = query;
           this.remote.limit(500).select({put: this.putIfMissing.bind(this)}, {query: options.query});
         }
       }

       return this.local.select.apply(this.local, arguments);
     }
   }
});


/*
  Merge DAO update events.  Merged into QIssueSplitDAO.
var MergedNotifyDAO = FOAM({
  model_: 'Model',

  name: 'MergedNotifyDAO',

  help: 'A DAO decorator which removes update notification.',

  extendsModel: 'ProxyDAO',

  methods: {
    init: function() {
      this.relay_ =  {
        put:    EventService.merged(function() { this.notify_('put', arguments);    }.bind(this), 1000),
        remove: EventService.merged(function() { this.notify_('remove', arguments); }.bind(this), 1000)
      };

      this.delegate.listen(this.relay_);
    }
  }
});
*/


var WaitCursorDAO = FOAM({
  model_: 'Model',
  name: 'WaitCursorDAO',
  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'count',
      defaultValue: 0,
      postSet: function(oldValue, newValue) {
        if ( ! this.window ) return;
        if ( oldValue == 0 ) DOM.setClass(this.window.document.body, 'waiting');
        else if ( newValue == 0 ) DOM.setClass(this.window.document.body, 'waiting', false);
      }
    },
    {
      name: 'window'
    }
  ],

  methods: {
    select: function(sink, options) {
      var self = this;

      this.count++;

      var future = afuture();

      this.window.setTimeout(function() {
        self.delegate.select(sink, options)(function(sink) {
          self.count--;
          future.set(sink);
        });
      }, 0);

      return future.get;
    }
  }
});


