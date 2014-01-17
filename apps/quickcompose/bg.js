var openWindow;
var launched = false;

var WIDTH = 335;
var HEIGHT = 478;

/** Requirements. **/
var req = amemo(ametric('init', aseq(
  arequire('QuickEMailView'),
  arequire('QuickCompose'),
  arequire('LinkView'),
  arequire('ContactListTileView'),
  arequire('AutocompleteListView')
)));

req(function(){});


function launchComposer() {
  // This block implements the feature which disables launching multiple
  // instances and instead un-minimizes the existing instance when attempting
  // to launch a new one.
  if ( openWindow ) {
    openWindow.restore();
    return;
  }

  if ( launched ) return;
  launched = true;

  req(ametric('launch', function(ret) {
    var screen = window.screen;
    chrome.app.window.create(
      'empty.html',
      {
        top: 0, //screen.availHeight-HEIGHT,
        left: 0, //screen.availWidth-150-WIDTH,
        width: 1, //WIDTH,
        height: 1, //HEIGHT,
        type: 'panel',
        frame: 'none'
//        state: 'minimized' // Doesn't work with type: panel
      },
      function(w) {
        w.contentWindow.onload = function() {
          var dialog = self.dialog = w.contentWindow;
          console.time('CreateQuickCompose');
          var b = QuickCompose.create({
            window: dialog,
            userInfo: userInfo || undefined
          });
          console.timeEnd('CreateQuickCompose');
          openWindow = w;
          b.appWindow = w;
          dialog.browser = window.browser = b; // for debugging
          $addWindow(dialog);
          console.time('QuickCompose::toHTML');
          dialog.document.firstChild.innerHTML = b.toHTML();
          console.timeEnd('QuickCompose::toHTML');
          b.initHTML();
          w.setBounds({
            left: screen.availWidth-150-WIDTH,
            top: screen.availHeight-HEIGHT,
            width: WIDTH,
            height: HEIGHT
          });
          w.restore();
          ret();
        };
        w.onClosed.addListener(function() {
          $removeWindow(self.dialog);
          openWindow = undefined;
          launched = false;
        });
      });
  }));
}

if ( chrome.app.runtime ) {
  chrome.app.runtime.onLaunched.addListener(launchComposer);
}
