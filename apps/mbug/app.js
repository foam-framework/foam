var mbug;

(function() {
    var service = analytics.getService('MBug');
    var tracker = service.getTracker('UA-47217230-4');
    tracker.sendAppView('MainView');
})();

window.onload = function() {
  var Y = bootCORE(Application.create({
    name: 'MBug'
  }));

  arequire('MBug')(
    function() {
      var w = Y.Window.create({ window: window });
      mbug = Y.MBug.create();
      w.view = mbug;
    });
};
