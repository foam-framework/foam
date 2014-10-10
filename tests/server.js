
require('../core/bootFOAMnode');
require('../node/fileDAO');
var daoServer = require('../node/server');
var path = require('path');

// Create an XMLFileDAO against FUNTests.xml
var dao = XMLFileDAO.create({ name: path.join(__dirname, 'FUNTests.xml'), model: UnitTest });

var count = 0;
dao.select({ put: function(x) { console.log(x.TYPE, x.name); count++; }, eof: function() { console.log(count + ' tests total'); } });

daoServer.launchServer({
  daoMap: { 'UnitTestDAO': dao },
  port: 8888,
  static: path.resolve(__dirname, '..')
});

