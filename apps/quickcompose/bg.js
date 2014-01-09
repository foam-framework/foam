var openWindow;

function launchComposer() {
  // This block implements the feature which disables launching multiple
  // instances and instead un-minimizes the existing instance when attempting
  // to launch a new one.
  if ( openWindow ) {
    openWindow.open();
    return;
  }
  chrome.app.window.create(
    'empty.html',
    {
      top: 0,
      left: 0,
      width: 335,
      height: 478,
      type: 'panel',
      frame: 'none'
    },
    function(w) {
      w.contentWindow.onload = function() {
        var dialog = self.dialog = w.contentWindow;
        var screen = dialog.screen;
        var bounds = w.getBounds();
        w.moveTo(screen.availWidth-150-bounds.width, screen.availHeight-bounds.height);
        aseq(
          arequire('QuickEMailView'),
          arequire('QuickCompose'),
          arequire('LinkView'),
          arequire('ContactListTileView'),
          arequire('AutocompleteListView')
        )(function () {
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
        });
      };
      w.onClosed.addListener(function() {
        $removeWindow(self.dialog);
        openWindow = undefined;
      });
    });
}

if ( chrome.app.runtime ) {
  chrome.app.runtime.onLaunched.addListener(launchComposer);
}
