(function() {
  if ( ! this.FOAM_BOOT_DIR )
    this.FOAM_BOOT_DIR = "http://localhost:8080/core/";

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

  this.loadScript_ = function(ret, name) {
    console.log("Loading", name);
    loadFile(function(blob, xhr) {
      if ( ! blob ) {
        console.error("Error loading", name);
        return;
      }
      addScript(ret, blob);
    }, name);
  }

  loadScript_(function() {
    var f = files.slice(0);
    var i = 0;


    function next(ret) {
      var p = Array.isArray(f[i]) ? f[i][1] : null;
      var file = Array.isArray(f[i]) ? f[i][0] : f[i];
      if ( file == undefined ) debugger;
      if ( ! p || p() ) {
        loadScript_(ret, file + '.js');
      } else {
        ret();
      }
    }

    next(function callback() {
      if ( ++i < f.length ) next(callback);
    });

  }, "FOAMmodels.js");
})();
