var p;
function launch() {
  if ( ! p ) p = QProject.create();
  p.launchBrowser();
}

if ( chrome.app.runtime ) {
  ajsonp = (function() {
    var factory = OAuthXhrFactory.create({
      authAgent: ChromeAuthAgent.create({}),
      responseType: "json"
    });

    return function(url, params, opt_method) {
      return function(ret) {
        var xhr = factory.make();
        return xhr.asend(ret, opt_method ? opt_method : "GET", url + (params ? '?' + params.join('&') : ''));
      };
    };
  })();

  chrome.app.runtime.onLaunched.addListener(function() {
    console.log('launched');
    launch();
  });
}
