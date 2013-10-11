/**
 * Generates the javascript prototype for a model and writed it to a file.
 */

var model = GLOBAL[argv[0]];
var outfile = argv[1];

var prototype = model.getPrototype();

fs.writeFileSync(outfile, prototype.toString());
process.exit();
