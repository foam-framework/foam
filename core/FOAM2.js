function packagePath(X, path) {
  function packagePath_(root, parent, path, i) {
    if ( i == path.length ) return parent;
    
    var head = path[i];
    if ( ! parent[head] ) {
      var map = { __this__: root };
      
      defineLocalProperty(parent, head, function(o) {
        return o == parent ? map : { __proto__: map, __this__: o.__this__ || o };
      });
    }
    
    return packagePath_(root, parent[head], path, i+1);
  }

  return path ? packagePath_(X, X, path.split('.'), 0) : X;
}

function registerModel(/* this = X, */ model, opt_name) {
  function contextualizeModel(X, path, name, model) {
    // Model which creates Objects with Context X
    var xModel = {
      __proto__: model,
      create: function(args, opt_X) {
        return this.__proto__.create(args, X);
      }
    };
    Object.defineProperty(path, name, { get: function() {
      var THIS = this.__this__ || this;
      return THIS == X ? xModel : THIS.registerModel(model, name); 
    } });
  }

  var name    = model.name;
  var package = model.package;
  
  if ( opt_name ) {
    var a = opt_name.split('.');
    name = a.pop();
    package = a.join('.');
  }

  var path = packagePath(this, package);

  contextualizeModel(this, path, name, model)

  this.registerModel_(model);

  return path[name];
}


function MODEL(m) {

  /** Lazily create and register Model first time it's accessed. **/
  function registerModelLatch(path, m) {
    UNUSED_MODELS[m.name] = true;

    Object.defineProperty(path, m.name, {
      get: function () {
        USED_MODELS[m.name] = true;
        delete UNUSED_MODELS[m.name];
        Object.defineProperty(this, m.name, {value: null, configurable: true});
        return registerModel(JSONUtil.mapToObj(X, m, Model));
      },
      configurable: true
    });
  }

  if ( document && document.currentScript ) m.sourcePath = document.currentScript.src;
  
  registerModelLatch(packagePath(GLOBAL, m.package), m);
}

function registerModel_(m) {
  // NOP
}
