var period = 1;

chrome.runtime.onUpdateAvailable.addListener(function() {
  // Restart is for Kiosk apps, no-op in non-kiosk
  chrome.runtime.restart();

  // Reload is for non-kiosk apps.
  chrome.runtime.reload();
});

function windowCheck() {
  var windows = chrome.app.window.getAll();
  if ( ! windows.length ) {
    launchWindow();
    return;
  }
}

function displayCheck() {
  chrome.system.display.getInfo(function(info) {
    chrome.storage.local.get("info", function(stored) {
      chrome.storage.local.set({ "info": info });
      if ( info.length !== stored.info.length ) {
        launchWindow();
      }
    });
  });
}

chrome.alarms.onAlarm.addListener(function(alarm) {
  if ( alarm.name == "update" ) {
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
  } else if ( alarm.name == "displayCheck" ) {
    displayCheck();
  } else if ( alarm.name == "restart" ) {
    scheduleRestart();
    chrome.runtime.restart();
    chrome.runtime.reload();
  } else if ( alarm.name == "windowCheck" ) {
    windowCheck();
  }
});

var launchWindow = (function() {
  var launching = false;

  return function() {
    chrome.system.display.getInfo(function(info) {
      chrome.storage.local.set({ "info": info }, function(){});
      var windows = chrome.app.window.getAll();
      for ( var i = 0 ; i < windows.length ; i++ ) {
        windows[i].close();
      }

      if ( ! launching ) {
        launching = true;
        chrome.app.window.create("main.html", {
          frame: 'none',
          innerBounds: {
            left: -3240,
            top: 0,
            width: 2700,
            height: 1920
          }
        }, function(w) {
          launching = false;
        });
      }
    });
  };
})();

chrome.app.runtime.onLaunched.addListener(function() {
  launchWindow();
});

function scheduleRestart() {
  var restart = new Date();
  restart.setHours(2);
  restart.setMinutes(0);
  restart.setSeconds(0);
  restart.setDate(restart.getDate() + 1);
  chrome.alarms.create("restart", {
    when: restart.getTime()
  });
}

chrome.runtime.onInstalled.addListener(function() {
  launchWindow();
  chrome.alarms.create("windowCheck", {
    periodInMinutes: 1
  });
  chrome.alarms.create("update", {
    periodInMinutes: period
  });
  chrome.alarms.create("displayCheck", {
    periodInMinutes: 1
  });
  scheduleRestart();
});

chrome.runtime.onStartup.addListener(function() {
  launchWindow();
});
