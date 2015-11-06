var period = 1;

chrome.runtime.onInstalled.addListener(function() {
  chrome.alarms.create("update", {
    periodInMinutes: period
  });
});

chrome.runtime.onUpdateAvailable.addListener(function() {
  // Restart is for Kiosk apps, no-op in non-kiosk
  chrome.runtime.restart();

  // Reload is for non-kiosk apps.
  chrome.runtime.reload();
});


chrome.alarms.onAlarm.addListener(function(alarms) {
  chrome.runtime.requestUpdateCheck(function(u) {
    if ( u == 'throttled' ) {
      period *= 2;
      chrome.alarms.create("update", {
        periodInMinutes: period
      });
    } else {
      period = 1;
    }
  });
});

function launchWindow() {
  var windows = chrome.app.window.getAll();
  for ( var i = 0 ; i < windows.length ; i++ ) {
    windows[i].close();
  }

  chrome.app.window.create("main.html", {
    frame: 'none',
    innerBounds: {
      left: -3240,
      top: 0,
      width: 2700,
      height: 1920
    }
  }, function(w) {
  });
}

chrome.app.runtime.onLaunched.addListener(function() {
  launchWindow();
});
