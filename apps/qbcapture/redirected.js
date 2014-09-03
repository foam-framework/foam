
if ( window.history.length <= 2 ) {
  // Close this tab.
  // We can't close it ourselves, but we can signal the extension to do it.
  chrome.runtime.sendMessage({ type: 'killTab' });
} else {
  // There's more history, so go back by three to the original page.
  // (3 because we have this page, about:blank, codesite, and the original source.)
  window.history.go(-2);
}

