var FOAM_READY = (function() {
  if ( ! this.FOAM_BOOT_DIR )
    this.FOAM_BOOT_DIR = "http://localhost:8000/core/";

  var waiters_ = [];
  var ready_ = false;
  var get_ = function(f) {
    if ( ready_ ) f();
    else waiters_.push(f);
  };
  var set_ = function() {
    ready_ = true;
    for ( var i = 0 ; i < waiters_.length ; i++ )
      waiters_[i]();
  };

  var loadFile = function(ret, name) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", name);
    xhr.responseType = "blob";
    xhr.onreadystatechange = function() {
      if ( xhr.readyState != xhr.DONE ) return;

      if ( xhr.status >= 200 &&
           xhr.status < 300 ) {
        ret(xhr.response);
        return;
      }
      ret(null);
    }
    xhr.send();
  };

  loadFile = (function(f) { return function(ret, name) { f(ret, this.FOAM_BOOT_DIR + name); }; })(loadFile);


  function addScript(ret, blob) {
    var node = document.createElement('script');
    node.src = window.URL.createObjectURL(blob);
    node.onload = ret;
    document.head.appendChild(node);
  }

  var error = false;

  this.loadScript_ = function(ret, name) {
    console.log("Loading", name);
    loadFile(function(blob, xhr) {
      if ( ! blob ) {
        error = true;
        console.error("Error loading", name);
        return;
      }
      addScript(ret, blob);
    }, name);
  };

  this.loadScript_(function() {
    // files: Global from FOAMmodels.js.
    var f = files.slice(0);
    var i = 0;

    function next(ret) {
      var p = Array.isArray(f[i]) ? f[i][1] : null;
      var file = Array.isArray(f[i]) ? f[i][0] : f[i];
      if ( ! p || p() ) {
        loadScript_(ret, file + '.js');
      } else {
        ret();
      }
    }

    next(function callback() {
      if ( ++i < f.length ) next(callback);
      else set_();
    });

  }, "FOAMmodels.js");

  return get_;
})();

FOAM_READY(function() {
  X.arequire('foam.tools.FOAMInChrome')(function(m) {
    m.create(undefined, X).execute();
  });
});
