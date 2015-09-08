// When window loads: Add window to FOAM context.
function onWindowLoad(window) {
  this.$addWindow(window);
  var Y = this.X.subWindow(window, 'Kiosk Window');
  this.DOM.init(Y);
}

// When window closes: Remove window from FOAM context.
function onWindowClose(window) {
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
  if (chrome.power) {
    chrome.power.requestKeepAwake('display');
  }
  chrome.app.window.create(
      'kiosk_view.html',
      {
        id: 'KioskWindow',
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
