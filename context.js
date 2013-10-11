var GLOBAL = GLOBAL || this;

var Context = {
    __proto__: GLOBAL,
    clone: function() {
	return { __proto__: this };
    }
};

var X = Context.clone();
var XXX = X;

function contextize(fn) {
  return (function (ctx) {
    return function() {
      var ret;
      var old = X;
      X = ctx;
      try {
         ret = fn.apply(this, arguments);
      } catch (x) {
         X = old;
      }
      return ret;
    };
  })(X);
}

var pushCtx;
var popCtx;

(function() {
  var stack = [];
  pushCtx = function() {
    stack.push(X);
    X = X.clone();
  };
  popCtx = function() {
    X = stack.pop();
  };
})();


