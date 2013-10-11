/**
 * Generates the java source for a model and writes it to a file.
 */

var modeldata = fs.readFileSync(argv[0]);
var model = vm.runInThisContext(modeldata);
var outfile = argv[1];

fs.writeFileSync(outfile, model.javaSource());
process.exit();
