// Use global context.
var X = window.X;

// Fetch config file via XHR.
function agetConfig(ret) {
  var CONFIG_PATH = 'config.json';
  X.XHR.create().asend(function(str, xhr, status) {
    if ( ! status ) console.error('Failed to load app configuration from', CONFIG_PATH);
    // TODO(markdittmer): Shouldn't JSONUtil provide a Chrome App-friendly
    // API for this?
    aeval('(' + str + ')')(function(data) {
      ret(X.JSONUtil.mapToObj(X, data));
    });
  }, CONFIG_PATH);
}

// When window loads: Add window to FOAM context.
function onWindowLoad(window) {
  this.$addWindow(window);
  var Y = X.subWindow(window, X.appConfig.appWindow.name);
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
  if ( ! X ) { return; }
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
  agetConfig(function(config) {
    X.appConfig = config;
    if ( chrome.power && config.kioskEnabled ) {
      chrome.power.requestKeepAwake('display');
    }
    if ( chrome.accessibilityFeatures &&
        chrome.accessibilityFeatures.virtualKeyboard &&
        config.virtualKeyboardEnabled ) {
       chrome.accessibilityFeatures.virtualKeyboard.set({ value: true });
    }
    var w = config.appWindow;
    chrome.app.window.create(
        'app_view.html',
        {
          id: w.id,
          width: w.width,
          height: w.height,
          minWidth: w.minWidth,
          minHeight: w.minHeight,
        },
        onWindowCreate.bind(this));
  });
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
