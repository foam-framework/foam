/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
