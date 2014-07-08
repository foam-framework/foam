var auth = EasyOAuth2.create({
  clientId: "945476427475-oaso9hq95r8lnbp2rruo888rl3hmfuf8.apps.googleusercontent.com",
  clientSecret: "GTkp929u268_SXAiHitESs-1",
  scopes: [
    "https://mail.google.com/"
  ]
});

X.registerModel(XHR.create({
  authAgent: auth,
  retries: 3,
  delay: 10
}), 'XHR');

var m = GMailMessage;

var dao = X.GMailRestDAO.create({
  model: m,
});

var view = TableView.create({
  dao: dao,
  model: m,
  scrollEnabled: true
});

view.write(document);
