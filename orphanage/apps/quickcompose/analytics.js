var foamDone = performance.now();

var metricsSrv = analytics.getService('Quick Compose').getTracker('UA-47217230-1');
metricsSrv.sendTiming('Load', 'analytics', Math.floor(analyticsDone - loadStartTime));
metricsSrv.sendTiming('Load', 'foam', Math.floor(foamDone - analyticsDone));
console.log('load_analytics: ' + Math.floor(analyticsDone - loadStartTime) + 'ms');


ametric = function(name, afunc) {
  return function(ret) {
    var args = argsToArray(arguments);
    args[0] = function() {
      console.timeEnd(name);
      metric.send();
      ret && ret.apply(null, arguments);
    };

    var metric = metricsSrv.startTiming('Load', name);
    console.time(name);
    afunc.apply(null, args);
  };
};
