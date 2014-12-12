// Asynchronous eval workaround for lack of eval in Chrome Apps.

TemplateUtil.compile = function() {
  return function() {
    return this.name_ + " wasn't required.  Models must be arequired()'ed for Templates to be compiled in Packaged Apps.";
  };
};

var __EVAL_CALLBACKS__ = {};
var aeval = (function() {
  var nextID = 0;

  var future = afuture();
  if ( ! document.body ) window.addEventListener('load', future.set);
  else future.set();

  return function(src) {
    return aseq(
      future.get,
      function(ret) {
        var id = 'c' + (nextID++);

        var newjs = ['__EVAL_CALLBACKS__["' + id + '"](' + src + ');'];
        var blob  = new Blob(newjs, {type: 'text/javascript'});
        var url   = window.URL.createObjectURL(blob);

        __EVAL_CALLBACKS__[id] = function(data) {
          delete __EVAL_CALLBACKS__[id];

          ret && ret.call(this, data);
        };

        var script = document.createElement('script');
        script.src = url;
        script.onload = function() {
          this.remove();
          window.URL.revokeObjectURL(url);
          //        document.body.removeChild(this);
        };
        document.body.appendChild(script);
      });
  };
})();
