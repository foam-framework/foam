/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

  var classpath = params.classpath;

  if ( classpath ) {
    classpath = classpath.split(',');
    for ( var i = 0 ; i < classpath.length ; i++ ) {
      X.ModelDAO = X.foam.core.bootstrap.OrDAO.create({
        delegate: X.foam.core.bootstrap.BrowserFileDAO.create({
          rootPath: classpath[i]
        }),
        primary: X.ModelDAO
      });
    }
  }

  var models = [];

  models.push(X.arequire('foam.u2.Element'));
  models.push(X.arequire('foam.u2.ElementParser'));
  models.push(X.arequire('foam.u2.DetailView'));
  models.push(X.arequire('foam.u2.ActionButton'));
  models.push(X.arequire('foam.ui.View'));

  var model = params.model_ || params.model || 'foam.navigator.Controller';

  models.push(X.arequire(model));

  if ( params.model_ )
    delete params.model_;
  else
    delete params.model;

  var viewName = params.view;
  if ( viewName ) {
    models.push(X.arequire(viewName));
    delete params.view;
  }
  var viewParams = {};
  Object_forEach(params, function(value, key) {
    var match = /^view([A-Z].*)$/.exec(key);
    var viewPropName;
    if ( match && (viewPropName = match[1]) ) {
      viewParams[viewPropName.charAt(0).toLowerCase() +
                 viewPropName.slice(1)] = value;
    }
  });

  Object_forEach(params, function(value, key) {
    var match = /^[a-z]+[.]([a-z]+[.])*[A-Z][a-zA-Z]*$/.exec(value);
    if ( match  ) models.push(X.arequire(value));
  });

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

  for ( var key in params ) {
    if ( key.startsWith('p:') ) {
      params[key.substring(2)] = params[key];
      delete params[key];
    }
  }

  aseq.apply(null, models).aseq(
    function() {
      var m = X.lookup(model);
      if ( ! m ) {
        document.body.innerHTML = 'Unable to load model: ' + model;
        return;
      }

      for ( var key in params ) {
        var p = m.getProperty(key);
        if ( p ) params[key] = p.fromString(params[key]);
        console.log(key, params[key]);
      }

      var obj = m.create(params, X);
      var view;

      GLOBAL.indexObj = obj; // for debugging

      if ( viewName ) {
        viewParams.data = obj;
        view = X.lookup(viewName).create(viewParams, obj.Y);
        // 'CView' refers to old CView
        // TODO(kgr): remove this check when CView's converted to foam.graphics.CView
      } else if (  ( X.lookup('foam.ui.BaseView').isInstance(obj) )
                   || ( 'CView' in GLOBAL && CView.isInstance(obj) ) ) {
        view = obj;
      } else if ( X.lookup('foam.u2.Element').isInstance(obj) ) {
        console.time('load');
        document.body.insertAdjacentHTML('beforeend', obj.outerHTML);
        obj.load();
        console.timeEnd('load');
        return;
      } else if ( obj.toE ) {
        var e = obj.toE(X);
        document.body.insertAdjacentHTML('beforeend', e.outerHTML);
        e.load();
        return;
      } else if ( obj.toView_ ) {
        view = obj.toView_();
      } else {
        X.arequire('foam.ui.DetailView')(function(m) {
          viewParams.data = obj;
          viewParams.model = obj.model_;
          viewParams.showActions = showActions;
          view = m.create(viewParams, obj.Y);
          document.body.insertAdjacentHTML('beforeend', view.toHTML());
          view.initHTML();
        });
        return;
      }
      console.time('load');
      document.body.insertAdjacentHTML('beforeend', view.toHTML());
      view.initHTML();
      console.timeEnd('load');
    })();
})();
