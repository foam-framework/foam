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

// Uncomment to remove storage.
/*MDAO.create = function() {
   var ret = [];
   ret.addIndex = function() { return this; };
   return ret;
};
*/

// IDBDAO.create = function(m) { var ret = []; return ret; };


if (chrome.app.runtime) {
   chrome.app.runtime.onLaunched.addListener(function() { console.log('launched'); launchController(); });
}

var persistentContext = PersistentContext.create({
  dao: IDBDAO.create({model: Binding}),
  predicate: NOT_TRANSIENT,
  context: GLOBAL
});


var EMailLabelDAO = MDAO.create({model: EMailLabel})
   .addIndex(EMailLabel.DISPLAY_NAME);

EMailLabelDAO = CachingDAO.create(
    EMailLabelDAO,
    IDBDAO.create({model: EMailLabel})).orderBy(
       { compare: function(o1, o2) { return o1.displayName == EMailLabel.getPrototype().SystemLabels.INBOX ? -1 : o2.displayName == EMailLabel.getPrototype().SystemLabels.INBOX ? 1 : 0; } },
       { compare: function(o1, o2) { return -o1.isSystemLabel().compareTo(o2.isSystemLabel()); } },
       { compare: function(o1, o2) { return o1.getRenderName() > o2.getRenderName() ? 1 : o1.getRenderName() < o2.getRenderName() ? -1 : 0; } }
);



var EMailPreferences = CachingDAO.create(
   MDAO.create({model: EMailPreference})
      .addIndex(EMailPreference.NAME),
   IDBDAO.create({model: EMailPreference }));



var EMailIDBDAO     = IDBDAO.create({model: EMail});
var EMailBodyIDBDAO = IDBDAO.create({model: EMail, name: 'EMailBodies'});

var EMailMDAO = MDAO.create({model: EMail});
//   .addIndex(EMail.TIMESTAMP);
//   .addIndex(EMail.SUBJECT);
// .addIndex(EMail.CONV_ID);
// .addIndex(EMail.TO);
// .addIndex(EMail.LABELS);
// .addIndex(EMail.FROM);

var EMailDAO = CachingDAO.create(EMailMDAO, EMailIDBDAO);

EMailDAO = EMailBodyDAO.create({
  delegate: EMailDAO,
  bodyDAO: EMailBodyIDBDAO
});

// TODO: this is a modified clone of the QIssueSplitDAO.
// a common base should be able to be drived from these two.
var EMailThreadingSplitDAO = FOAM({
   model_: 'Model',
   extendsModel: 'AbstractDAO',

   name: 'EMailThreadingSplitDAO',

   properties: [
      {
         model_: 'StringProperty',
         name: 'activeQuery'
      },
      {
         model_: 'StringProperty',
         name: 'activeOrder'
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

     newQuery: function(sink, options, query, order, bufOptions, future) {
       if ( (query && query !== this.activeQuery) ||
            (order && order !== this.activeOrder) ) return;

       var buf = this.buf = MDAO.create({ model: this.model });
       var auto = AutoIndex.create(buf);

       // Auto index the buffer, but set an initial index for the current
       // sort order.
       if ( options && options.order) auto.addIndex(options.order);
       buf.addRawIndex(auto);

       this.activeQuery = query;

      var queryoptions = {};
      var self = this;
      if ( options && options.query ) queryoptions.query = options.query;

       this.local.select(DISTINCT(EMail.CONV_ID, []), queryoptions)((function(convs) {
         this.local
           .orderBy(EMail.TIMESTAMP)
           .where(IN(EMail.CONV_ID, Object.keys(convs.values)))
           .select(GROUP_BY(EMail.CONV_ID, Conversation.create({})))((function(convs) {
             for (var conv in convs.groups) {
               buf.put(convs.groups[conv]);
             }

             buf.select(sink, bufOptions)(function(s) { future.set(s); });

             var remoteOptions = {};
             if ( options && options.query ) remoteOptions.query = options.query;
             if ( options && options.order ) remoteOptions.order = options.order;

             this.remote.limit(500).select({
               put: (function(obj) {
               }).bind(this)
             }, remoteOptions);
           }).bind(this));
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
         if ( options.skip ) bufOptions.skip = options.skip;
         if ( options.limit ) bufOptions.limit = options.limit;
       }

       var query = ( options && options.query && options.query.toSQL() ) || "";
       var order = ( options && options.order && options.order.toSQL() ) || "";

       var future = afuture();

       if ( this.buf && query === this.activeQuery ) {
         if ( order && order !== this.activeOrder ) {
           this.activeOrder = order;

           this.buf.select(sink, bufOptions)(function(s) {
             future.set(s);
           });
         } else {
           return this.buf.select(sink, bufOptions);
         }
       } else {
         this.activeQuery = query;
         this.activeOrder = order;
         this.newQuery(sink, options, query, order, bufOptions, future);
       }

       return future.get;
     }
   }
});

var ConversationDAO = EMailThreadingSplitDAO.create({
  local: EMailDAO,
  remote: NullDAO.create({}),
  model: Conversation
});

var timer = Timer.create({});

var StorageFuture = afuture();

if (chrome.app.runtime) {
   var authAgent = ChromeAuthAgent.create({});
   var xhrFactory = OAuthXhrFactory.create({
     authAgent: authAgent,
     responseType: "json"
   });

     aseq(
       function(ret) {
          persistentContext.bindObject('userInfo', UserInfo, {})(ret);
       },
       function(ret) {
         var xhr = xhrFactory.make();
         xhr.asend(ret, "GET", "https://www.googleapis.com/oauth2/v1/userinfo?alt=json");
       },
       function(ret, response) {
         if (response) {
           userInfo.email = response.email;
         }
         StorageFuture.set();
       }
     )();
}


var ContactDAO = CachingDAO.create(
   MDAO.create({model: Contact}),
   IDBDAO.create({model: Contact})
);

var ContactAvatarDAO = NullDAO.create({});

if ( this.InstallEMailDriver ) InstallEMailDriver(function(){}, EMail, window, true, true, true, true);
