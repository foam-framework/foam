var openWindow;
var launched = false;

var WIDTH = 335;
var HEIGHT = 478;

/** Requirements. **/
var req = amemo(ametric('init', aseq(
    function(ret) {
      if (self.InstallEMailDriver)
        self.InstallEMailDriver(ret, QuickEMail, self, false, false, true, false, false);
      else ret();
    },
    ametric('requires', aseq(          // should this be 'apar' instead?
      arequire('QuickEMailView'),
      arequire('QuickCompose'),
      arequire('LinkView'),
      arequire('ContactListTileView'),
      arequire('AutocompleteListView')
    )))
));

req(function(){
  console.timeEnd('page load');
  metricsSrv.sendTiming('Load', 'total', Math.floor(performance.now() - loadStartTime));
});


function launchComposer() {
  if ( ! authAgent.accessToken ) {
    console.log("No access token, refreshing and suppressing launch");
    authAgent.refresh(launchComposer);
    return;
  }

  metricsSrv.sendEvent('Composer', 'Launch');
  console.time('LaunchComposer');
  // This block implements the feature which disables launching multiple
  // instances and instead un-minimizes the existing instance when attempting
  // to launch a new one.
  if ( openWindow ) {
    openWindow.restore();
    return;
  }

  if ( launched ) return;
  launched = true;

  function launch(ret) {
    var screen = window.screen;
    var sessionTimer;

    chrome.app.window.create(
      'empty.html',
      {
        // Setting the 'id' causes the window to remember its
        // previous size.
        id: 'quickCompose',
        top: screen.availHeight-HEIGHT,
        left: screen.availWidth-150-WIDTH,
        width: WIDTH,
        height: HEIGHT,
        type: 'panel',
        frame: 'none',
        state: 'minimized' // Doesn't work with type: panel
      },
      function(w) {
        w.contentWindow.onload = function() {
          var dialog = self.dialog = w.contentWindow;
          $addWindow(dialog);
          console.time('CreateQuickCompose');
          var b = QuickCompose.create({
            window: dialog,
            userInfo: userInfo || undefined
          });
          console.timeEnd('CreateQuickCompose');
          openWindow = w;
          b.appWindow = w;
          dialog.browser = window.browser = b; // for debugging
          console.time('QuickCompose::toHTML');
          dialog.document.firstChild.innerHTML = b.toHTML();
          console.timeEnd('QuickCompose::toHTML');
          b.initHTML();
          w.restore();
          metricsSrv.sendAppView('Composer');
          sessionTimer = metricsSrv.startTiming('Composer', 'Session');
          ret();
        };
        w.onClosed.addListener(function() {
          sessionTimer.send();
          $removeWindow(self.dialog);
          openWindow = undefined;
          launched = false;
        });
      });
  }

  aseq(req, ametric('launch', launch))();
}

if ( chrome.app.runtime ) {
  chrome.app.runtime.onLaunched.addListener(launchComposer);
}
