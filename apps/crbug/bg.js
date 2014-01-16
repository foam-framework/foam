var p;
function launch() {
  if ( ! p ) p = Project.create();
  p.launchBrowser();
}

if ( chrome.app.runtime ) {
  chrome.app.runtime.onLaunched.addListener(function(opt_launchData) {
    console.log('launched');
    if ( opt_launchData ) console.log(opt_launchData.url);
    launch();
  });
}
