/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
function XMLHttpRequest() {}

if ( typeof vm != "undefined" && vm.runInThisContext ) {
  (function() {
    var http = require('http');
    var https = require("https");
    var url = require('url');

    var proto = {
      set onerror(value) {
        this.onErrorListeners_ = [value];
      },
      set onloadend(value) {
        this.onLoadEndListeners_ = [value];
      },
      set onreadystatechange(value) {
        this.onReadyStateListeners_ = [value];
      },
      UNSENT: 0,
      OPENED: 1,
      HEADERS_RECEIVED: 2,
      LOADING: 3,
      DONE: 4,

      get readyState() {
        return this.readyState_;
      },


      get response() {
        return this.response_;
      },

      get responseText() {
        if ( typeof this.response_ == "string" )
          return this.response_;
        return null;
      },

      set responseType(value) {
        this.responseType_ = value;
      },

      get responseType() {
        return this.responseType_;
      },

      responseType_: null,

      get status() {
        return this.status_;
      },
      open: function(method, url) {
        this.method = method;
        this.headers = {};
        this.url = url;
        this.toReadyState(this.OPENED);
      },

      toReadyState: function(state) {
        this.readyState_ = state;
        var fire = function(l)  { l(); };

        if ( this.onReadyStateListeners_ ) {
          this.onReadyStateListeners_.forEach(fire);
        }

        if ( this.readyState_ == this.DONE &&
             this.onLoadEndListener_) {
          this.onLoadEndListeners_.forEach(fire);
        }

        if  ( this.readyState_ == this.DONE &&
              this.onErrorListeners_ &&
              ( this.status >= 400 || this.status == 0 ) ) {
          this.onErrorListeners_.forEach(fire);
        }
      },

      send: function(payload) {
        this.toReadyState(this.LOADING);
        var url_ = url.parse(this.url);
        url_.method = this.method;
        url_.headers = this.headers;

        var h = http;
        if ( url_.protocol === "https:" ) var h = https;

        this.request_ = h.request(url_, function(response) {
          response.setEncoding('utf8');
          var buffer = "";
          response.on('data', function(data) {
            buffer += data;
          });
          response.on('end', function() {
            this.response_ = buffer;
            this.status_ = response.statusCode;
            this.toReadyState(this.DONE);
          }.bind(this));
        }.bind(this));

        this.request_.on('error', function() {
          this.status_ = 0;
          this.response_ = null;
          this.toReadyState(this.DONE);
        }.bind(this));


        if ( payload ) {
          payload = new Buffer(payload);
        }
        this.request_.end(payload);
      },

      setRequestHeader: function(header, value) {
        this.headers[header] = value;
      }
    };

    XMLHttpRequest.prototype = proto;
  })();
}
