// TODO: bootstrap 'install'

var features = [
  ['Model',    'Method',  function create(args) {
    var obj = {
      model_: this,
      __proto__: this.prototype,
      instance_: {}
    };
    for (var key in args) {
      obj[key] = obj.instance_[key] = args[key];
    }
    return obj;
  }],
  ['Model',    'Method',  function install(o) {
    o[this.name] = this;
  }],
  [null,       'Model', { name: 'Property' }],
  ['String', 'Method' ,function constantize() { return this.replace(/[a-z][^a-z]/g, function(a) { return a.substring(0,1) + '_' + a.substring(1,2); }).toUpperCase(); } ],
  ['Property', 'Method', function install(o) {
    o.model_[this.name.constantize()] = this;
    var prop = this;
    Object.defineProperty(o.prototype, this.name, {
      configurable: false,
      enumerable: true,
      writeable: true,
      get: function() {
        if ( !this.instance_.hasOwnProperty(prop.name) ) return prop.defaultValue;
        return this.instance_[prop.name];
      },
      set: function(value) {
        this.instance_[prop.name] = value;
      }
    });
    if ( !o.instance_.hasOwnProperty(this.name) && this.valueFactory ) o[this.name] = this.valueFactory();
  }],
  [null,       'Model',    { name: 'Feature' }],
  ['Feature',  'Property', { name: 'name' }],
  ['Property', 'Property', { name: 'defaultValue', defaultValue: '' }],
  [null,       'Model', { name: 'Extends' }],
  ['Extends',  'Method',  function install(o) {
    build(o, o.model_.name);
  }],
  ['Model', 'Property', { name: 'name' }],
  ['Property', 'Method', function f(obj) { return obj[this.name]; } ],
/*  [null,       'Model',    { name: 'Property' }],
//  [null,       'Model',    {name: 'Model' }],
  ['Model',    'Extends',  'Feature' ],
  [null,       'Model',    { name: 'Property' }],
  ['Property', 'Extends',  'Feature' ],
  ['Property', 'Property', { name: 'defaultValue' }],
  ['Method',   'Extends',  'Feature' ],
//  ['Method',   'install',  function install(model, f) { model.prototype[f.name] = f; }],
  ['Model',    'Method',   function create() { return {__proto__: this.prototype}; }],
  ['Feature',  'Method',   function toString() { return this.name; }]*/
];


function expandFeatures(f, opt_prefix) {
  var prefix = opt_prefix || [];
  var g = [];
  for ( var i = 0 ; i < f.length ; i++ ) {
     expandFeature(f[i], g);
  }
  return g;
}

function expandFeature(f, a, prefix) {
   return f;
}

function build(scope, opt_whereModel) {
   for ( var i = 0 ; i < features.length ; i++ ) {
      var f = features[i];
      if ( opt_whereModel && f[0] !== opt_whereModel ) continue;
      var model = f[0] ? (scope[f[0]] ? scope[f[0]] : scope[f[0]] = {}) : scope;

      var fname = f[1];
      if ( !scope[fname] ) continue;

      var args = f[2];
      var feature = scope[fname].create(args);
      feature.install(model);
   }
}

var scope = {
  String: { prototype: String.prototype },
  Model:  { name: 'Model', instance_: { name: 'Model' }, prototype: {} },
  Method: {
    install: function(scope) {
      scope.prototype[this.name] = this;
    },
    create: function(args) { args.install = this.install; return args; }
  }
};

scope.Model.__proto__ = scope.Model.prototype;
scope.Model.model_ = scope.Model;

build(scope);
