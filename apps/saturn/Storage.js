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

var EMailMDAO = MDAO.create({model: EMail})
   .addIndex(EMail.TIMESTAMP)
//   .addIndex(EMail.SUBJECT);
  .addIndex(EMail.CONV_ID);
// .addIndex(EMail.TO);
// .addIndex(EMail.LABELS);
// .addIndex(EMail.FROM);

var EMailDAO = CachingDAO.create(EMailMDAO, EMailIDBDAO);

EMailDAO = EMailBodyDAO.create({
  delegate: EMailDAO,
  bodyDAO: EMailBodyIDBDAO
});

var EMailThreadingDAO = FOAM({
  model_: 'Model',
  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'emailDao',
    },
    {
      name: 'threadDao',
      factory: function() {
        return MDAO.create({ model: Conversation });
      }
    },
    {
      name: 'model',
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);

      var self = this;

      this.emailDao.pipe({
        put: function(msg) {
          self.threadDao.find(msg.convId, {
            put: function(thread) {
              thread = thread.clone();
              thread.put(msg);
              self.threadDao.put(thread);
            },
            error: function() {
              var conv = Conversation.create({});
              conv.put(msg);
              self.threadDao.put(conv);
            }
          });
        },
        remove: function(msg) {
          self.threadDao.find(msg.convId, {
            put: function(thread) {
              thread = thread.clone();
              thread.remove(msg);
              self.threadDao.put(thread);
            }
          });
        }
      });

      this.relay_ = {
        put: function() { this.notify_('put', arguments); }.bind(this),
        remove: function() { this.notify_('remove', arguments); }.bind(this)
      };

      this.threadDao.listen(this.relay_);
    },

    select: function(sink, options) {
      var future = afuture();

      var queryoptions = {};
      var convoptions = {};

      if ( options ) {
        if ( options.query ) queryoptions.query = options.query;
        if ( options.skip ) convoptions.skip = options.skip;
        if ( options.limit ) convoptions.limit = options.limit;
        if ( options.order ) convoptions.order = options.order;
      }
        
      this.emailDao.select(DISTINCT(EMail.CONV_ID, []), queryoptions)((function(convs) {
        this.threadDao.where(IN(Conversation.ID, Object.keys(convs.values)))
          .select(sink, convoptions)(function(s) {
            future.set(sink);
        });
      }).bind(this));

      return future.get;
    },

    find: function(id, sink) {
      this.threadDao.find(id, sink);
    }
  }
});

var ConversationDAO = EMailThreadingDAO.create({
  emailDao: EMailDAO,
  model: Conversation
});
ConversationDAO.threadDao.addIndex(Conversation.TIMESTAMP);

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
  MDAO.create({model: Contact}).addIndex(Contact.EMAIL).addIndex(Contact.FIRST).addIndex(Contact.LAST),
  IDBDAO.create({model: Contact})
);

var ContactAvatarDAO = LRUCachingDAO.create({
  maxSize: 50,
  delegate: FutureDAO.create(aseq(asleep(200), function(ret) {
    ret(LazyCacheDAO.create({
      cache: IDBDAO.create({ model: Contact, name: 'ContactAvatars2' }),
      delegate: ContactAvatarNetworkDAO.create({
        xhrFactory: OAuthXhrFactory.create({
          authAgent: authAgent,
          responseType: "blob"
        })
      })
    }));
  }))
});

ContactAvatarDAO = PropertyOffloadDAO.create({
  property: Contact.AVATAR,
  model: Contact,
  offloadDAO: ContactAvatarDAO,
  delegate: ContactDAO,
  loadOnSelect: true
});

aseq(asleep(1000), function() {
  ContactDAO.select(COUNT())(function(c) {
    if ( c.count === 0 ) {
      console.log('Importing contacts...');
      importContacts(ContactDAO, xhrFactory);
    }
  });
})();

if ( this.InstallEMailDriver ) InstallEMailDriver(function(){}, EMail, window, true, true, true, true, true);
