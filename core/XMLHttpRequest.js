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

      responseType: null,

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
              this.status >= 400 ) {
          this.onErrorListener_.forEach(fire);
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
