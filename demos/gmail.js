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

MODEL({
  name: 'EMailAdapterDAO',

  extendsModel: 'ProxyDAO',

  methods: {
    put: function(obj, sink) {
      var headersMap = {};
      var headers = obj.payload.headers || [];
      for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        headersMap[header.name] = header.value;
      }

      var email = EMail.create({
        id: obj.id,
        convId: obj.threadId,
        timestamp: headersMap['Date'],
        from: headersMap['From'],
        to: headersMap['To'],
        cc: headersMap['Cc'],
        bcc: headersMap['Bcc'],
        replyTo: headersMap['Reply-To'],
        subject: headersMap['Subject'],
        labels: obj.labelIds,
        historyId: obj.historyId,
        // attachments: obj.attachments,
        // body: ab2String(decode(obj.payload.body.data)),
      });
      this.delegate.put(email, sink);
    }
  }
});

var emailAdapterDAO = EMailAdapterDAO.create({
  delegate: MDAO.create({ model: EMail }),
});

var gmailSyncManager = GmailSyncManager.create({
  historyDao: historyDao,
  messageDao: messageDao,
  dstDAO: emailAdapterDAO,
  historyProperty: EMail.HISTORY_ID,
  threadDao: threadDao,
});

var view = TableView.create({
  dao: gmailSyncManager.dstDAO,
  model: EMail,
  scrollEnabled: true
});

gmailSyncManager.write(document);
view.write(document);
