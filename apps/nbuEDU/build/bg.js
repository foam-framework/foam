// Use global context.
var X = window.X;

// When window loads: Add window to FOAM context.
function onWindowLoad(window) {
  this.$addWindow(window);
  var Window = this.X.lookup('foam.ui.Window');
  var foamWindow = Window.create({
    name: 'Kiosk Designer Window',
    window: window,
  });
  var Y = foamWindow.Y.sub({
    appWindow: window,
  });

  this.DOM.init(Y);
}

// Simple window closed event listener support.
X.onWindowClosed = function(f) {
  arguments.callee.listeners_ = arguments.callee.listeners_ || [];
  arguments.callee.listeners_.push(f);
};
// When window closes: Remove window from FOAM context.
function onWindowClose(window) {
  if ( X.onWindowClosed.listeners_ ) {
    var listeners = X.onWindowClosed.listeners_ || [];
    for ( var i = 0; i < listeners.length; ++i ) {
      listeners[i]();
    }
  }
  this.$removeWindow(window);
}

// When window created: Bind load and close callbacks.
function onWindowCreate(win) {
  if ( ! this.X ) { return; }
  var window = win.contentWindow;
  window.onload = onWindowLoad.bind(this, window);
  win.onClosed.addListener(onWindowClose.bind(this, window));
}

/**
 * Creates the window for the application.
 *
 * @see http://developer.chrome.com/trunk/apps/app.window.html
 */
function runApp() {
  var chrome = this.chrome;
  var config = this.config;
  chrome.app.window.create(
      'designer_view.html',
      {
        id: 'KioskDesignerWindow',
        width: 800,
        height: 700,
        minWidth: 400,
        minHeight: 600
      },
      onWindowCreate.bind(this));
}

/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/trunk/apps/app.runtime.html
 * @see http://developer.chrome.com/trunk/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(runApp.bind(this));


/**
 * Listens for the app restarting then re-creates the window.
 *
 * @see http://developer.chrome.com/trunk/apps/app.runtime.html
 */
chrome.app.runtime.onRestarted.addListener(runApp.bind(this));
