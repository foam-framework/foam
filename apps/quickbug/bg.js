var metricsSrv = analytics.getService('Quick Bug').getTracker('UA-47217230-3');

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
function launch() {
  if ( ! qb ) qb = X.QBug.create();
  qb.launchBrowser();
}

if ( chrome.app.runtime ) {
  chrome.app.runtime.onLaunched.addListener(function(opt_launchData) {
    // launchData is provided by the url_handler
    if ( opt_launchData ) console.log(opt_launchData.url);

    console.log('launched');
    launch();
  });
}

//GridView.getPrototype().updateHTML = OAM.time('GridView.updateHTML', OAM.profile(GridView.getPrototype().updateHTML));
GridView.getPrototype().updateHTML   = OAM.time('GridView.updateHTML',  GridView.getPrototype().updateHTML);
TableView.getPrototype().repaint     = OAM.time('TableView.repaint',    TableView.getPrototype().repaint);
// TableView2.getPrototype().repaintNow = OAM.time('TableView.repaintNow', TableView2.getPrototype().repaintNow);
// GridView.getPrototype().updateHTML   = OAM.profile(GridView.getPrototype().updateHTML);
GridByExpr.getPrototype().initHTML   = OAM.time('GridByExpr.initHTML',  GridByExpr.getPrototype().initHTML);
// GridCView.getPrototype().paint       = OAM.time('GridCView.paint',      GridCView.getPrototype().paint);
// TableView2.getPrototype().tableToHTML = OAM.profile(TableView2.getPrototype().tableToHTML);
