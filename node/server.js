
var http = require('http');

// daoMap: Object mapping string names to DAO objects.
// port: Defaults to 80.
module.exports.launchServer = function(daoMap, port) {
  port = port || 80;

  function send(res, code, body) {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(body, 'utf-8');
  }

  function sendJSON(res, code, obj) {
    send(res, code, JSON.stringify(obj));
  }

  return http.createServer(function(req, res) {
    try {
      // Handle the endpoints. There are only two: / and /api.
      // / just returns a chunk of JSON data describing the server.
      // /api is the interesting one.
      if (req.url == '/') {
        sendJSON(res, 200, { server: 'FOAM DAO Server', version: 1 });
      } else if(req.url == '/api') {
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
              send(res, 200, JSONUtil.stringify(sink));
            });
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
      }
    } catch(e) {
      sendJSON(res, 500, e);
    }
  }).listen(port);
};

