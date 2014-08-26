var metricsSrv = analytics.getService('Quick Bug').getTracker('UA-47217230-3');

X = bootCORE(Application.create({
  name: 'QuickBug',
  version: 119,
  chromeAppVersion: '1.18'
}));

X = X.subWindow(window, 'BACKGROUND WINDOW', true);

ametric = function(name, afunc) {
  var metric;
  return atime(name, afunc, function(name) {
    metric = metricsSrv.startTiming('Load', name);
    console.time(name);
  }, function(name, time) {
    console.timeEnd(name);
    metric.send();
  });
};

var qb;
// Forwards its arguments to QBug.launchBrowser(), if any.
function launch() {
  if ( ! qb ) qb = X.QBug.create();
  qb.launchBrowser.apply(qb, arguments);
}

if ( chrome.app.runtime ) {
  chrome.app.runtime.onLaunched.addListener(function(opt_launchData) {
    // launchData is provided by the url_handler
    if ( opt_launchData ) console.log(opt_launchData.url);

    console.log('launched');
    launch();
  });

  chrome.runtime.onMessageExternal.addListener(function(msg) {
    if ( msg && msg.type === 'openUrl' ) {
      // Extract the project name and call launchBrowser.
      var start = msg.url.indexOf('/p/') + 3;
      var end = msg.url.indexOf('/', start);
      var project = msg.url.substring(start, end);
      launch(project, msg.url);
    }
  });
}

//GridView.getPrototype().updateHTML = OAM.time('GridView.updateHTML', OAM.profile(GridView.getPrototype().updateHTML));
GridView.getPrototype().updateHTML   = OAM.time('GridView.updateHTML',  GridView.getPrototype().updateHTML);
// TableView.getPrototype().repaint     = OAM.time('TableView.repaint',    TableView.getPrototype().repaint);
// TableView.getPrototype().repaintNow = OAM.time('TableView.repaintNow', TableView.getPrototype().repaintNow);
// GridView.getPrototype().updateHTML   = OAM.profile(GridView.getPrototype().updateHTML);
GridByExpr.getPrototype().initHTML   = OAM.time('GridByExpr.initHTML',  GridByExpr.getPrototype().initHTML);
// GridCView.getPrototype().paint       = OAM.time('GridCView.paint',      GridCView.getPrototype().paint);
// TableView.getPrototype().tableToHTML = OAM.profile(TableView.getPrototype().tableToHTML);
