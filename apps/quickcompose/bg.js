function launchComposer() {
  chrome.app.window.create(
    'empty.html',
    {top: 0, left: 0, width: 335, height: 478, type: 'panel', frame: 'none'},
    function(w) {
      w.contentWindow.onload = function() {
        var dialog = self.dialog = w.contentWindow;
        aseq(
          arequire('QuickEMailView'),
          arequire('QuickCompose'),
          arequire('LinkView')
        )(function () {
          var b = QuickCompose.create({
            window: dialog,
            userInfo: userInfo
          });
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
      });
    });
}

if ( chrome.app.runtime ) {
  chrome.app.runtime.onLaunched.addListener(launchComposer);
}
