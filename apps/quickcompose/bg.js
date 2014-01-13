var openWindow;

var WIDTH = 335;
var HEIGHT = 478;

/** Requirements. **/
var req = amemo(aseq(
  arequire('QuickEMailView'),
  arequire('QuickCompose'),
  arequire('LinkView'),
  arequire('ContactListTileView'),
  arequire('AutocompleteListView')
));

req(function(){});

function launchComposer() {
  // This block implements the feature which disables launching multiple
  // instances and instead un-minimizes the existing instance when attempting
  // to launch a new one.
  if ( openWindow ) {
    openWindow.restore();
    return;
  }
  req(function() {
    var screen = window.screen;
    chrome.app.window.create(
      'empty.html',
      {
        top: screen.availHeight-HEIGHT,
        left: screen.availWidth-150-WIDTH,
        width: WIDTH,
        height: HEIGHT,
        type: 'panel',
        frame: 'none'
      },
      function(w) {
        w.contentWindow.onload = function() {
          var dialog = self.dialog = w.contentWindow;
          var b = QuickCompose.create({
            window: dialog,
            userInfo: userInfo || undefined
          });
          openWindow = w;
          b.appWindow = w;
          dialog.browser = window.browser = b; // for debugging
          $addWindow(dialog);
          dialog.document.body.innerHTML = b.toHTML();
          b.initHTML();
          w.focus();
        };
        w.onClosed.addListener(function() {
          $removeWindow(self.dialog);
          openWindow = undefined;
        });
      });
  });
}

if ( chrome.app.runtime ) {
  chrome.app.runtime.onLaunched.addListener(launchComposer);
}
