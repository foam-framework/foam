var http = require('http');
var fs   = require('fs');
var path = require('path');

var MIME_TYPES = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  __default: 'application/octet-stream'
};

// daoMap: Object mapping string names to DAO objects.
// static: If provided, the root directory for all static file reads.
// port: Defaults to 80.
module.exports.launchServer = function(opts) {
  var daoMap = opts.daoMap || {};
  var port = opts.port || 80;

  // Compute the static path as absolute.
  var staticDir = opts.static && path.resolve(opts.static);

  function send(res, code, body) {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(body, 'utf-8');
  }

  function sendJSON(res, code, obj) {
    send(res, code, JSON.stringify(obj));
  }

  function send404(res) {
    res.writeHead(404);
    res.end();
  }

  return http.createServer(function(req, res) {
    try {
      // Handle the endpoints. The only live one is /api, for the DAOs.
      // Otherwise, it will try to serve as a static file.
      if(req.url == '/api') {
        var body = '';
        req.on('data', function(data) { body += data; });
        req.on('end', function() {
          var msg = JSONUtil.parse(body);
          console.log(msg);
          var dao = daoMap[msg.subject];
          if (!dao) {
            sendJSON(res, 500, { error: 'No such DAO.' });
            return;
          }

          // Now: we have various parameters in the message and need to parse them.
          // subject gives the DAO name.
          // method is one of: find, select, remove, put.
          // params (an array) is deserialized and passed to the said method.
          // context is an object containing any extra info. Currently unhandled.
          //   May eventually be useful for authentication, authorization, etc.
          if (msg.method == 'select') {
            dao.select.apply(dao, msg.params)(function(sink) {
              debugger;
              send(res, 200, JSONUtil.stringify(sink));
            });
          } else if (msg.method == 'removeAll') {
            if (msg.params[0]) { // hasSink
              var arr = [];
              dao.removeAll({
                remove: arr.push,
                eof: function() {
                  send(res, 200, JSONUtil.stringify(arr));
                }
              }, msg.params[1]);
            } else {
              dao.removeAll({ eof: function() { send(res, 200, []); } });
            }
          } else {
            // TODO: Handle cases where the argument is missing.
            dao[msg.method](msg.params[0], {
              put: function(x) {
                send(res, 200, JSONUtil.stringify({ put: x }));
              },
              remove: function() {
                sendJSON(res, 200, { put: 1 });
              },
              error: function(err) {
                sendJSON(res, 200, { error: err });
              }
            });
          }
        });
      } else {
        // Try to serve a static file.
        if ( ! staticDir ) {
          send404(res);
          return;
        }

        // If we're still here, then we've got a static directory.
        // Compute the resolved path and make sure it's inside my static directory.
        // Need to knock off the leading / on the URL.
        var target = path.resolve(staticDir, req.url.substring(1));
        var rel = path.relative(staticDir, target);
        // Make sure that path doesn't start with ..
        if ( rel.startsWith('..') ) {
          send404(res);
          return;
        }

        // Now we have a legal filename within our subdirectory.
        // We try to stream the file to the other end.
        if ( ! fs.existsSync(target) ) {
          send404(res);
          return;
        }

        var ext = path.extname(target);
        var mimetype = MIME_TYPES[ext] || MIME_TYPES.__default;
        res.writeHead(200, { 'Content-Type': mimetype });

        // Open the file as a stream.
        var stream = fs.createReadStream(target);
        stream.pipe(res);
      }
    } catch(e) {
      sendJSON(res, 500, e);
    }
  }).listen(port);
};

