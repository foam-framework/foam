var QUICKBUG_APP_ID = 'hmdcjljmcglpjnmmbjhpialomleabcmg';

// There are two sets of rules here.
// First, we redirect code.google.com navigations to open QuickBug.
// - Only if a particular cookie is not set.
// Second, if the user goes to noqbug.code.google.com, that's a signal to
// create the cookie, then redirect.
// That allows the escape hatch from Qbug to work.

// TODO: We leak small amounts of memory here, since tabs are never removed
// from the whitelist even when they are closed.
var whitelist = {};

chrome.management.get(QUICKBUG_APP_ID, function(entry) {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var id = sender && sender.tab && sender.tab.id;
    if ( request && request.type === 'redirect' ) {
      // Check if the tab is whitelisted.
      if ( ! (id && whitelist[id]) ) {
        chrome.runtime.sendMessage(QUICKBUG_APP_ID, { type: 'openUrl', url: request.url });
        sendResponse('redirected');
      } else {
        sendResponse('whitelisted');
      }
    } else if ( request && request.type === 'whitelist' ) {
      if ( id ) whitelist[id] = true;
    }
  });
});

