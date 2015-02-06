require('../core/bootFOAMnode.js');

arequire(process.argv[2])(function(model) {
  if ( ! model ) {
    console.log("ERRROR: Could not find model", process.argv[2]);
    process.exit(1);
  }

  var args = {};
  for ( var i = 3; i < process.argv.length; i++ ) {
    var regex = /[^\\]=/g;
    var matched = regex.exec(process.argv[i]);
    if ( matched ) {
      var key = process.argv[i].substring(0, regex.lastIndex - 1)
      var value = process.argv[i].substring(regex.lastIndex);
    } else {
      key = process.argv[i];
      value = true;
    }

    args[key] = value;
  }

  model.create(args).execute();
});
