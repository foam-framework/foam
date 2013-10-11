chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('apps/saturn/main.html', {
      width:1200, height:800
    });
});
