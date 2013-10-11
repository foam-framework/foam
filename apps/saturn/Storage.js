
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

var UserInfo = FOAM({
  model_: 'Model',

  name: 'UserInfo',
  label: 'UserInfo',

  properties: [
    {
      model_: 'StringProperty',
      name: 'email',
      postSet: function(newValue, oldValue) {
        ME = newValue;
      }
    }
  ]
});

var pc = PersistentContext.create({
  dao: IDBDAO.create({model: Binding}),
  predicate: NOT_TRANSIENT,
  context: GLOBAL
});


var EMailLabels = MDAO.create({model: EMailLabel})
   .addIndex(EMailLabel.DISPLAY_NAME);

EMailLabels = CachingDAO.create(
    EMailLabels,
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
   .addIndex(EMail.TIMESTAMP);
//   .addIndex(EMail.SUBJECT);
// .addIndex(EMail.CONV_ID);
// .addIndex(EMail.TO);
// .addIndex(EMail.LABELS);
// .addIndex(EMail.FROM);

var EMails = CachingDAO.create(EMailMDAO, EMailIDBDAO);

EMails = EMailBodyDAO.create({
  delegate: EMails,
  bodyDAO: EMailBodyIDBDAO
});

var timer = Timer.create({});

var StorageFuture = afuture();

if (chrome.app.runtime) {
   var auth = ChromeAuthAgent.create({});
   var xhrFactory = OAuthXhrFactory.create({
      authAgent: auth
   });

     aseq(
       function(ret) {
          pc.bindObject('userInfo', UserInfo, {})(ret);
       },
       function(ret) {
         var xhr = xhrFactory.make();
         xhr.responseType = "text";
         xhr.asend(ret, "GET", "https://www.googleapis.com/oauth2/v1/userinfo?alt=json");
       },
       function(ret, response) {
         if (response) {
           var info = JSON.parse(response);
           userInfo.email = info.email;
         }
         StorageFuture.set();
       }
     )();
}


var ContactDAO = CachingDAO.create(
   MDAO.create({model: Contact}),
   IDBDAO.create({model: Contact})
);
