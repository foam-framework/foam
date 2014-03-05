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

var CDAO = FOAM({
  model_: 'Model',
  name: 'CDAO',

  properties: [
  ],

  extendsModel: 'ProxyDAO',
  methods: {
    select: function(sink, options) {
      var future = afuture();

      var tmp = MDAO.create({ model: Conversation });
      var self = this;
      options = options || {};
      var queryoptions = {};
      if ( options.query ) queryoptions.query = options.query;

      this.delegate.select(DISTINCT(EMail.CONV_ID, []), queryoptions)(function(convs) {
        self.delegate.where(IN(EMail.CONV_ID, Object.keys(convs.values))).select(GROUP_BY(EMail.CONV_ID, Conversation.create({})))(function(convs) {
          for (var conv in convs.groups) {
            tmp.put(convs.groups[conv]);
          }

          var finaloptions = {
            __proto__: options,
            query: undefined
          };

          tmp.select(sink, finaloptions)(function(s) {
            future.set(s);
          });
        });
      });
      return future.get;
    }
  }
});

var ConversationDAO = CDAO.create({
  delegate: EMailDAO,
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

InstallEMailDriver(function(){}, EMail, window, true, true, true);
