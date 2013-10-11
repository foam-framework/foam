var SocketManager = {
    create: function() {
        return {
            __proto__: this
        };
    },

    get: function(address) {
        var parts = address.split(':');
        var type = parts[0];
        var host = parts[1];
        var port = parseInt(parts[2]);

        return amemo(function(cb) {
            chrome.socket.create(type, {}, function(info) {
                chrome.socket.connect(
                    info.socketId,
                    host,
                    port,
                    function(result) {
                        if (result == 0) {
                            cb({
                                socketId: info.socketId
                            });
                            return;
                        }
                        cb(null);
                    });
            });
        });
    }
};
