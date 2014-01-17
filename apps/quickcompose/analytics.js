var metricsSrv = analytics.getService('Quick Compose').getTracker('UA-47217230-1');
var loadStartTiming = metricsSrv.startTiming('Load');

var ametric = function(name, afunc) {
  return function(ret) {
    var metric = metricsSrv.startTiming(name);
    afunc(function() {
      metric.send();
      ret();
    })
  };
};
