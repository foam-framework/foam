// Check for the no_qbug=1 query parameter.
function checkRedirect() {
  if ( window.location.search.indexOf('no_qbug=1') >= 0 ) {
    // no_qbug is present, so whitelist this URL and let it load.
    chrome.runtime.sendMessage(chrome.runtime.id, { type: 'whitelist' });
  } else {
    // Send the redirect message, and wait for the response.
    chrome.runtime.sendMessage(chrome.runtime.id, { type: 'redirect', url: window.location.href }, {}, function(response) {
      if ( response === 'whitelisted' ) {
        // Do nothing, let the load continue.
      } else if ( response === 'redirected' ) {
        window.location = 'chrome-extension://pdpojlbfiaejollkomjbdmlmoapejnfa/redirected.html?url=' + encodeURIComponent(window.location.href);
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
