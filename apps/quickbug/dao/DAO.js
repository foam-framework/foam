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

MODEL({
  name: 'IssueRestDAO',
  extendsModel: 'RestDAO',

  properties: [
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
      if ( GtExpr.isInstance(query) && query.arg1 === this.__ctx__.QIssue.MODIFIED ) {
        updatedMin = query.arg2.arg1.getTime();
        query = TRUE
      } else if ( AndExpr.isInstance(query) ) {
        for ( var j = 0; j < query.args.length; j++ ) {
          var arg = query.args[j];

          if ( GtExpr.isInstance(arg) && arg.arg1 === this.__ctx__.QIssue.MODIFIED ) {
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

              if ( GtExpr.isInstance(subarg) && subarg.arg1 === this.__ctx__.QIssue.MODIFIED ) {
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
          } else if ( GtExpr.isInstance(arg) && arg.arg1 === this.__ctx__.QIssue.MODIFIED ) {
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

      function stripDefaultQuery(m) {
        if ( DefaultQuery.isInstance(m) ) return TRUE;
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
            self.__ctx__.ajsonp(self.url + '/' + issue.id + star, undefined, 'POST')(ret);
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
                    if ( result ) sink.put && sink.put(result);
                    else sink.error && sink.error('put', issue);
                  }
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

MODEL({
  name: 'QIssueCommentUpdateDAO',
  help: 'Decorates a comment dao, and on put, updates an associated issue dao.',
  extendsModel: 'ProxyDAO',

  properties: [
    'IssueNetworkDAO'
  ],

  methods: {
    put: function(obj, sink) {
      var issueDAO = this.IssueNetworkDAO;
      this.SUPER(obj, {
        put: function(o) {
          issueDAO.invalidate(obj.issueId);
          sink && sink.put && sink.put(o);
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      });
    }
  }
});

MODEL({
  name: 'QIssueCommentNetworkDAO',
  extendsModel: 'RestDAO',

  properties: [
    'IssueDAO'
  ],

  methods: {
    buildURL: function(outquery, extra) {
      var query = outquery[0];

      if ( ! query ) return this.url;

      var id;

      if ( EqExpr.isInstance(query) && query.arg1 === this.__ctx__.QIssueComment.ISSUE_ID ) {
        id = query.arg2.arg1;
        query = TRUE
      }

      if ( OrExpr.isInstance(query) ) {
        for ( var i = 0; i < query.args.length; i++ ) {
          var arg = query.args[i];

          if ( AndExpr.isInstance(arg) ) {
            for ( var j = 0; j < arg.args.length; j++ ) {
              var subarg = arg.args[j];

              if ( EqExpr.isInstance(subarg) && subarg.arg1 === this.__ctx__.QIssue.ISSUE_ID ) {
                if ( id && subarg.arg2.arg1 === id ) id = subarg.arg2.arg1;
                arg.args[j] = TRUE;
              }
            }
          } else if ( EqExpr.isInstance(arg) && arg.arg1 === this.__ctx__.QIssue.ISSUE_ID ) {
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
MODEL({
  name: 'QIssueSplitDAO',
  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'queryCache',
      help: 'An array of [query, order, MDAO<data>] entries, oldest first, and a maximum of queryCount.',
      factory: function() { return []; }
    },
    {
      name: 'queryCount',
      help: 'The maximum number of queries to cache.',
      defaultValue: 5
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
    },
    {
      name: 'model'
    },
    {
      name: 'maxLimit',
      defaultValue: 500
    }
  ],

  listeners: [
    {
      model_: 'Method',
      name: 'mergedPutNotify',
      isMerged: 1000,
      code: function() { this.notify_('put', []); }
    },
    {
      model_: 'Method',
      name: 'mergedRemoveNotify',
      isMerged: 1000,
      code: function() { this.notify_('remove', []); }
    }
  ],

   methods: {
     init: function() {
       this.SUPER();
       this.relay_ = {
         put:    function() { this.invalidate(); this.mergedPutNotify();    }.bind(this),
         remove: function() { this.invalidate(); this.mergedRemoveNotify(); }.bind(this)
       };

       this.remoteListener_ = {
         put:    function() { this.onRemotePut.apply(this, arguments);    }.bind(this),
         remove: function() { this.onRemoteRemove.apply(this, arguments); }.bind(this)
       };

       this.local.listen(this.relay_);
       this.remote.listen(this.remoteListener_);
     },

     onRemotePut:    function(obj) { this.local.put(obj); },
     onRemoteRemove: function(obj) { this.local.remove(obj);},

     invalidate: function() { this.queryCache = []; },

     put: function(value, sink) {
       var self = this;
       this.remote.put(value, {
         put: function(value) {
           self.local.put(value, sink);
         },
         error: ( sink && sink.error ) ? sink.error.bind(sink) : function() {}
       });
     },

     remove: function(obj, sink) {
       var self = this;
       this.remote.remove(value, {
         remove: function(obj) {
           self.local.remove(obj, sink);
         },
         error: ( sink && sink.error ) ? sink.error.bind(sink) : function() {}
       });
     },

     putIfMissing: function(issue) {
       var local = this.local;

       local.find(issue.id, {
         put:   function(o) { if ( o.modified.compareTo(issue.modified) ) local.put(issue); },
         error: function() { local.put(issue); }
       });
     },

     // If we don't find the data locally, then look in the remote DAO (and cache locally)
     find: function(key, sink) {
       var local  = this.local;
       var remote = this.remote;

       local.find(key, {
         put: function(obj) {
           sink && sink.put && sink.put(obj);
         },
         error: function() {
           remote.find(key, {
             put: function(issue) {
               sink && sink.put && sink.put(issue);
               local.put(issue);
             },
             error: function() {
               sink && sink.error && sink.error.apply(sink, arguments);
             }
           });
         }
       });
     },

     newQuery: function(sink, options, query, order, bufOptions, future) {
       var daoFuture = afuture();
       var buf = MDAO.create({ model: this.model });
       // TODO: switch to MDAO's 'autoIndex: true' feature when improved.
       /*
       var auto = AutoIndex.create(buf);

       // Auto index the buffer, but set an initial index for the current
       // sort order.
       if ( options && options.order && Property.isInstance(options.order) ) {
         auto.addIndex(options.order);
         buf.addRawIndex(auto);
       }
       */

       var cacheEntry = [query, order, FutureDAO.create({future: daoFuture.get})];
       if ( this.queryCache.length >= this.queryCount ) this.queryCache.shift();
       this.queryCache.push(cacheEntry);

       this.local.select({ put: function(x) { console.assert(x !== undefined, 'SplitDAO.local put: undefined'); buf.put(x); } }, options && options.query ? { query: options.query } : {})(
         (function() {
           buf.select(sink, bufOptions)(function(s) {
             daoFuture.set(buf);
             future.set(s);
           });

           var remoteOptions = {};
           if ( options && options.query ) remoteOptions.query = options.query;
           if ( options && options.order ) remoteOptions.order = options.order;

           this.remote.limit(this.maxLimit).select({
             put: (function(obj) {
               // Put the object in the buffer, but also cache it in the local DAO
               console.assert(obj !== undefined, 'SplitDAO.remote put: undefined');
               buf.put(obj);
               this.putIfMissing(obj);

               // Sometimes the item might not be missing, but the local
               // query processing didn't match it, so force a notification
               // regardless.  These are merged to 1s, so no harm done.
               this.mergedPutNotify();
             }).bind(this)
           }, remoteOptions);
         }).bind(this));
     },

     select: function(sink, options) {
       // Don't pass QUERY to buf, it always contains only the items
       // which match the query.  This allows us offload full text searches
       // to a server, where we can't necessarily do keyword matches locally
       // with the available data.
       var bufOptions = {};
       if ( options ) {
         if ( options.order ) bufOptions.order = options.order;
         if ( options.skip  ) bufOptions.skip  = options.skip;
         if ( options.limit ) bufOptions.limit = options.limit;
       }

       var query = ( options && options.query && options.query.toMQL() ) || "";
       var order = ( options && options.order && options.order.toMQL() ) || "";

       var future = afuture();

       // Search the cache of buffers for a matching query and order.
       var matchingQueries = this.queryCache.filter(function(e) { return e[0] === query; });

       if ( matchingQueries.length ) {
         var matchingOrder = matchingQueries.filter(function(e) { return e[1] === order; });

         if ( matchingOrder.length > 0 ) {
           return matchingOrder[0][2].select(sink, bufOptions);
         }

         // We did NOT find a matching order.
         // But we do have at least one match for this query with a different order.
         // Check the size of the first match's buffer. If it's < maxLimit we've
         // got all the data and can simply compute the order ourselves.
         // If it's >= maxLimit, we have only a subset and need to query the server.
         var match = matchingQueries[0];
         match[2].select(COUNT())((function(c) {
           if ( c.count < this.maxLimit ) {
             match[2].select(sink, bufOptions)(function(s) {
               future.set(s);
             });
           } else {
             // console.log('Creating new query: ' + query + '   ' + order);
             this.newQuery(sink, options, query, order, bufOptions, future);
           }
         }).bind(this));

       } else {
//         if ( CountExpr.isInstance(sink) ) return this.local.select(sink, options);

         // console.log('Creating new query: ' + query + '   ' + order);
         this.newQuery(sink, options, query, order, bufOptions, future);
       }

       return future.get;
     }
   }
});
