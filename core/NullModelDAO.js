arequire = function(modelName, opt_X) {
  var X = opt_X || GLOBAL.X;
  return function(ret) {
    var m = X.lookup(modelName)
    ret(m);
  };
};
