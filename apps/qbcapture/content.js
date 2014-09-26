// Need to avoid a race condition between finding out the page is whitelisted
// and the DOMContentLoaded handler adding the overlay.
var whitelisted = false;
var QBUG_OVERLAY_ID = '__qbug_overlay';

// Attach a DOMContentLoaded handler that will render an overlay to hide codesite.
document.addEventListener('DOMContentLoaded', function(e) {
  if ( ! whitelisted) {
    document.body.insertAdjacentHTML('afterbegin',
        '<div id="' + QBUG_OVERLAY_ID + '" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 50000; background-color: white;"></div>');
  }
});

function hideOverlay() {
  whitelisted = true;
  var el = document.getElementById(QBUG_OVERLAY_ID);
  if ( el ) el.parentElement.removeChild(el);
}

// Check for the no_qbug=1 query parameter.
function checkRedirect() {
  if ( window.location.search.indexOf('no_qbug=1') >= 0 ) {
    // no_qbug is present, so whitelist this URL and let it load.
    chrome.runtime.sendMessage(chrome.runtime.id, { type: 'whitelist' });
    hideOverlay();
  } else {
    // Send the redirect message, and wait for the response.
    chrome.runtime.sendMessage(chrome.runtime.id, { type: 'redirect', url: window.location.href }, {}, function(response) {
      if ( response === 'whitelisted' ) {
        // Let the load continue.
        // But we need to get rid of the overlay, if present.
        hideOverlay();
      } else if ( response === 'redirected' ) {
        window.location = 'chrome-extension://' + chrome.runtime.id + '/redirected.html?url=' + encodeURIComponent(window.location.href);
      }
    });
  }
}

// Check whether we're being prerendered or not.
if ( document.webkitVisibilityState === 'prerender' ) {
  // Prerendering, so attach an event handler.
  var handler = function() {
    if ( document.webkitVisibilityState === 'visible' ) {
      // No longer hidden, so remove the listener and checkRedirect.
      document.removeEventListener('webkitvisibilitychange', handler);
      checkRedirect();
    }
  };

  document.addEventListener('webkitvisibilitychange', handler);
} else {
  // Already visible, so fire away.
  checkRedirect();
}
