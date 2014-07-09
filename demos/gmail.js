var auth = EasyOAuth2.create({
  clientId: "945476427475-oaso9hq95r8lnbp2rruo888rl3hmfuf8.apps.googleusercontent.com",
  clientSecret: "GTkp929u268_SXAiHitESs-1",
  scopes: [
    "https://mail.google.com/"
  ]
});

X.registerModel(XHR.xbind({
  authAgent: auth,
  retries: 3,
  delay: 2
}), 'XHR');

var messageDao = X.GMailRestDAO.create({
  model: GMailMessage,
});

var historyDao = X.GMailRestDAO.create({
  model: GMailHistory,
});

var threadDao = X.GMailRestDAO.create({
  model: GMailThread,
});

var gmailSyncManager = GmailSyncManager.create({
  historyDao: historyDao,
  messageDao: messageDao,
  dstDAO: MDAO.create({ model: GMailMessage }),
  historyProperty: GMailMessage.HISTORY_ID,
  threadDao: threadDao,
});

var view = TableView.create({
  dao: gmailSyncManager.dstDAO,
  model: GMailMessage,
  scrollEnabled: true
});

gmailSyncManager.write(document);
view.write(document);
