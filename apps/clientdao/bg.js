var PersonDAO = ClientDAO.create({
  model: Person,
  asend: asendjson('http://127.0.0.1:8080/api')
});

chrome.app.runtime.onLaunched.addListener(function() {
  FOAM.browse(Person);
});
