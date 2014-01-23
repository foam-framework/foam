var p;
function launch() {
  if ( ! p ) p = Project.create();
  p.launchBrowser();
}

if ( chrome.app.runtime ) {
  chrome.app.runtime.onLaunched.addListener(function() {
    console.log('launched');
    launch();
  });
}
