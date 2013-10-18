function buildModel(modelName, model) {
   model = model || {prototype:{}};

   for ( var i = 0 ; i < features.length ; i++ ) {
      var f = features[i];
      if ( f[0] === modelName ) {
         f.install && f.install(f[2], model);
         f[1] === 'install' && f[2](f[2], model);
      }
   }

   return model;
}

// TODO: bootstrap 'install'

var features = [
  ['Model',   'install',  function install(model, f) { scope[model.name] = model; }],
  [null,       'Feature',  {name: 'Feature'}],
  ['Feature',  'Property', {name: 'name'}],
//  [null,       'Model',    {name: 'Model' }],
  ['Model',    'Extends',  'Feature' ],
  [null,       'Model',    {name: 'Property'}],
  ['Property', 'Extends',  'Feature' ],
  ['Property', 'Property', { name: 'defaultValue' }],
  ['Extends',  'install',  function install(model, f) { buildModel(f, model); }],
  ['Method',   'Extends',  'Feature' ],
//  ['Method',   'install',  function install(model, f) { model.prototype[f.name] = f; }],
  ['Model',    'Method',   function create() { return {__proto__: this.prototype}; }],
  ['Feature',  'Method',   function toString() { return this.name; }]
/*
  ['', '', { }],
  ['', '', { }],
  ['', '', { }],
  ['', '', { }],
*/
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
      var model = (f[0] && (scope[f0] || scope[f0] = {})) || scope;
      var fname = f[1];
      var feature = f[2];
      var install = scope[fname] && scope[fname].install;

      install && install(model, feature);
   }
}


var scope = {
  Model:  { name: 'Model' },
  Method: { install: function(scope, fn) { scope.prototype[fn.name] = fn; } }
};


build(scope);