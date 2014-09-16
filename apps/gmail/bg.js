chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('app.html', {
    width: 340,
    height: 640
  });
});
