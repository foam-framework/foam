var gmailSyncManager = createGmailSyncAgent();

var view = TableView.create({
  dao: gmailSyncManager.dstDAO,
  model: EMail,
  scrollEnabled: true
});

gmailSyncManager.write(document);
view.write(document);
