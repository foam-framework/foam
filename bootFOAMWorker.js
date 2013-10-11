// Workers don't get a console object.  We should model our own loggin system.
var console = {
  log: function() {},
  warn: function() {},
  error: function() {},
  info: function() {},
  time: function() {},
  timeEnd: function() {}
};

// We also don't get a window or document object, we should find a way to
// encapsulate our refernces to this or model a wrapper.
var window = self;
var document = {};
var chrome = {};

if ( ! self.FOAM_BOOT_DIR ) self.FOAM_BOOT_DIR = '/';

// FIXME: Workers should be able to bootstrap just from a Model DAO and only
// load the models it needs.
importScripts(FOAM_BOOT_DIR + "FOAMmodels.js")
for (var i = 0; i < files.length; i++) files[i] = FOAM_BOOT_DIR + files[i] + '.js';
importScripts.apply(self, files);
