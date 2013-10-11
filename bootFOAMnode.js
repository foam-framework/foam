var fs = require('fs');
var vm = require('vm');

if (process.argv[2]) {
  var FOAM_BOOT_DIR = process.argv[2] + '/';
} else {
  FOAM_BOOT_DIR = '';
}

var modelsfiles = fs.readFileSync(FOAM_BOOT_DIR + 'FOAMmodels.js', 'utf8');

global.window = global;
global.document = {
  window: global
};

vm.runInThisContext(modelsfiles);

for (var i = 0; i < files.length; i++) {
    console.log("loading ", FOAM_BOOT_DIR + files[i]);
    var filedata = fs.readFileSync(FOAM_BOOT_DIR + files[i] + '.js', 'utf8');
    vm.runInThisContext(filedata, files[i] + ".js");
}

// For command line processing, run as
// $ node bootFOAMnode.js <FOAM_BOOT_DIR> <command> <args>
// Commands are located in the tools subdirectory
// Arguments are passed to the command as a global argv array
if (process.argv[3]) {
  var command = process.argv[3];
  global.argv = process.argv.slice(4);
  global.fs = fs;
  global.vm = vm;
  filedata = fs.readFileSync(FOAM_BOOT_DIR + "tools/" + command + ".js", 'utf8');
  vm.runInThisContext(filedata, "tools/" + command + ".js");
}
