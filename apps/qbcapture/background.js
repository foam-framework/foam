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
  chrome.runtime.onMessage.addListener(function(request, sender) {
    if ( request && request.type === 'killTab' ) {
      sender && sender.tab && sender.tab.id && chrome.tabs.remove(sender.tab.id);
    }
  });

  chrome.declarativeWebRequest.onMessage.addListener(function(details) {
    if ( details.message === 'openUrl' ) {
      if ( whitelist[details.tabId] ) {
        // Whitelisted tab, therefore navigate it.
        var queryString = details.url.indexOf('?');
        var newUrl = details.url.substring(0, queryString) + '?no_qbug=1&' + details.url.substring(queryString + 1);
        chrome.tabs.update(details.tabId, { url: newUrl });
      } else {
        // Tab is not whitelisted, so open Quickbug for it.
        chrome.runtime.sendMessage(QUICKBUG_APP_ID, { type: 'openUrl', url: details.url });
        chrome.tabs.update(details.tabId, { url: 'chrome-extension://pdpojlbfiaejollkomjbdmlmoapejnfa/redirected.html' });
      }
    } else if ( details.message === 'escapeHatch' ) {
      // This tab had the no_qbug parameter, so make sure it's whitelisted.
      whitelist[details.tabId] = true;
    }
  });

  chrome.declarativeWebRequest.onRequest.removeRules(undefined, function() {
    chrome.declarativeWebRequest.onRequest.addRules([
      // High priority: codesite URLs with no_qbug=1 query parameter are allowed.
      // Need to cancel lower-priority rules.
      {
        priority: 1000,
        conditions: [
          new chrome.declarativeWebRequest.RequestMatcher({
            url: { hostSuffix: 'code.google.com', pathContains: 'issues', queryContains: 'no_qbug=1' },
            resourceType: ['main_frame'],
            stages: ['onBeforeRequest']
          })
        ],
        actions: [
          new chrome.declarativeWebRequest.SendMessageToExtension({ message: 'escapeHatch' }),
          new chrome.declarativeWebRequest.IgnoreRules({
            lowerPriorityThan: 1000
          })
        ]
      },
      // Low priority: If the above rule didn't override this one, then
      // cancel the request and open QuickBug.
      {
        conditions: [
          new chrome.declarativeWebRequest.RequestMatcher({
            url: { hostSuffix: 'code.google.com', pathContains: 'issues' },
            resourceType: ['main_frame'],
            stages: ['onBeforeRequest']
          })
        ],
        actions: [
          new chrome.declarativeWebRequest.SendMessageToExtension({ message: 'openUrl' }),
          new chrome.declarativeWebRequest.RedirectToEmptyDocument()
        ]
      }
    ]);
  });
});

