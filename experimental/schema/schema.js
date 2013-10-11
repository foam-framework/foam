var smodels;

(function() {
  var ps = {};
  var ms = [];

  function typeToModel(key) {
    var type = schemas.types[key];

    if ( ! type.model_ ) {
      var mps = [];

      for ( var i = 0 ; i < type.properties.length ; i++ ) {
        mps.push(ps[type.properties[i]]);
      }

      ms.push(Model.create({
        name: type.id,
        extendsModel: type.ancestors.length ? type.ancestors[type.ancestors.length-1] : '',
        label: type.label,
        help: type.comment_plain,
        properties: mps
      }));

      console.log('model:', type.id);
    }

    return type.model_;
  }

  for ( var key in schemas.properties ) {
    var p = schemas.properties[key];

    ps[p.id] = Property.create({
      name: p.id,
      label: p.label,
      help: p.comment_plain
    });

    console.log(p.id);
  }

  for ( var key in schemas.types ) typeToModel(key);

  smodels = ms;
})();