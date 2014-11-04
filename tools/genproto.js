require('../core/bootFOAMnode.js');
var fs  = require('fs');

if ( process.argv.length < 4 ) {
  console.log("USAGE: node genproto.js SOURCE_FILE MODEL_NAME [OUTPUT_FILE]")
}

var file = fs.readFileSync(process.argv[2]).toString();
eval(file);

var model = X[process.argv[3]];

var outfile = process.argv[4] || (model.name + '.proto');

fs.writeFileSync(outfile, model.protobufSource());

process.exit();
