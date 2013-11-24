function launchComposer() {
  chrome.app.window.create('empty.html', {width: 335, height: 478, type: 'panel', frame: 'none'}, function(w) {
    w.contentWindow.onload = function() {
      var window = self.window = w.contentWindow;
      aseq(
        arequire('QuickEMailView'),
        arequire('QuickCompose'),
        arequire('LinkView')
      )(function () {
        var b = QuickCompose.create({window: window});
        b.appWindow = w;
        window.browser = b; // for debugging
        $addWindow(window);
        window.document.body.innerHTML = b.toHTML();
        b.initHTML();
        w.focus();
      });
    };
    w.onClosed.addListener(function() {
      $removeWindow(self.window);
    });
 });
}

if ( chrome.app.runtime ) {
  chrome.app.runtime.onLaunched.addListener(launchComposer);
}
