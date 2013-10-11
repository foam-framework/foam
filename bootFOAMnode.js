var fs = require('fs');
var vm = require('vm');

var modelsfiles = fs.readFileSync('FOAMmodels.js', 'utf8');

global.window = global;
global.document = {
  window: global
};

vm.runInThisContext(modelsfiles);

for (var i = 0; i < files.length; i++) {
    console.log("loading ", files[i]);
    var filedata = fs.readFileSync(files[i] + '.js', 'utf8');
    vm.runInThisContext(filedata, files[i] + ".js");
}

// For command line processing, run as
// $ node bootFOAMnode.js <command> <args>
// Commands are located in the tools subdirectory
// Arguments are passed to the command as a global argv array
if (process.argv[2]) {
  var command = process.argv[2];
  global.argv = process.argv.slice(3);
  global.fs = fs;
  filedata = fs.readFileSync("tools/" + command + ".js", 'utf8');
  vm.runInThisContext(filedata, "tools/" + command + ".js");
}
