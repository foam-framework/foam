// Read the query parameters and instantiate the model.
(function() {
  var search = /([^&=]+)=?([^&]*)/g;
  var query = window.location.search.substring(1);
  var decode = function(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  };
  var params = {};
  var match;
  while (match = search.exec(query)) {
    params[decode(match[1])] = decode(match[2]);
  }

  var models = [];

  var model = params.model || 'foam.navigator.Controller';

  models.push(arequire(model));
  delete params.model;

  var viewName = params.view;
  if ( viewName ) {
    models.push(arequire(viewName));
    delete params.view;
  }

  var showActions = params.showActions;
  if ( showActions ) {
    showActions = showActions.equalsIC('y')    ||
                  showActions.equalsIC('yes')  ||
                  showActions.equalsIC('true') ||
                  showActions.equalsIC('t');
  } else {
    showActions = true;
  }
  delete params.showActions;

  apar.apply(null, models).aseq(
    function() {
      var obj = FOAM.lookup(model, X).create(params);
      var view;
      if ( viewName ) {
        view = FOAM.lookup(viewName, X).create({ data: obj });
      } else if ( X.foam.ui.View.isInstance(obj) || ( 'CView' in GLOBAL && CView.isInstance(obj) ) ) { // OLD CView, not foam.graphics.CView
        view = obj;
      } else if ( obj.toView_ ) {
        view = obj.toView_();
      } else {
        view = X.foam.ui.DetailView.create({ data: obj, showActions: showActions });
      }
      document.body.insertAdjacentHTML('beforeend', view.toHTML());
      view.initHTML();
    })();
})();
