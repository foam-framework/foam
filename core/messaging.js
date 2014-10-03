/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

MODEL({
  name: 'XHR',

  properties: [
    { model_: 'IntProperty', name: 'delay', defaultValue: 0 },
    { model_: 'IntProperty', name: 'retries', defaultValue: 0 },
    { name: 'authAgent' },
    { name: 'responseType', defaultValue: 'text' }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);

      if ( this.delay ) this.addDecorator(DelayDecorator.create({ delayMs: this.delay }));
      if ( this.authAgent ) this.addDecorator(OAuthXhrDecorator.create({ authAgent: this.authAgent }));
      if ( this.retries ) this.addDecorator(RetryDecorator.create({ maxAttempts: this.retries }));
    },

    makeXhr: function() {
      return new XMLHttpRequest();
    },
    open: function(xhr, method, url) {
      xhr.open(method, url);
    },
    setRequestHeader: function(xhr, header, value) {
      xhr.setRequestHeader(header, value);
    },
    configure: function(xhr) {
      xhr.responseType = this.responseType;
      this.setRequestHeader(xhr, "Content-Type", "application/json");
    },
    bindListeners: function(xhr, ret) {
      var self = this;
      xhr.onreadystatechange = function() {
        if ( xhr.readyState == 4 ) {
          if ( self.responseType === "json" && typeof xhr.response == "string" )
            var response = JSON.parse(xhr.response);
          else response = xhr.response;
          ret(response, xhr);
        }
      }
    },
    send: function(xhr, data) {
      xhr.send(data);
    },
    asend: function(ret, url, data, method) {
      var xhr = this.makeXhr();
      this.open(xhr, method || "GET", url);
      this.configure(xhr);
      this.bindListeners(xhr, ret);
      this.send(xhr, (data && data.toJSON) ? data.toJSON() : data);
    },
  }
});

MODEL({
  name: "OAuthXhrDecorator",

  properties: [
    'authAgent'
  ],

  methods: {
    configure: function(decorator, delegate, args) {
      var xhr = args[0];
      xhr.setRequestHeader("Authorization", "Bearer " + decorator.authAgent.accessToken);
      return delegate.apply(this, args);
    },
    asend: function(decorator, delegate, args) {
      var ret = args[0];
      args[0] = function(response, xhr) {
        if ( xhr.status === 401 || xhr.status === 403 ) {
          decorator.authAgent.refresh(function() {
            ret(response, xhr);
          });
        } else {
          ret(response, xhr);
        }
      };
      return delegate.apply(null, args);
    }
  }
});

MODEL({
  name: 'RetryDecorator',

  properties: [
    { model_: 'IntProperty', name: 'maxAttempts', defaultValue: 3 }
  ],
 
 methods: {
    asend: function(decorator, delegate, args) {
      var originalRet = args[0];
      var attempts = 0;
      var self = this;
      var response;

      awhile(function() { return true; },
             aseq(
               function(ret) {
                 args[0] = ret;
                 delegate.apply(self, args);
               },
               function(ret, response, xhr) {
                 if ( ( xhr.status >= 200 && xhr.status < 300 ) ||
                      xhr.status === 404 ||
                      ++attempts >= decorator.maxAttempts ) {
                   finished = true;
                   originalRet(response, xhr);
                   return;
                 }
                 ret();
               }))(function(){});
    }
  }
});

MODEL({
  name: 'DelayDecorator',

  properties: [
    { model_: 'IntProperty', name: 'delayMs' },
  ],

  methods: {
    decorateObject: function(target) {
      var asend = adelay(target.asend.bind(target), this.delayMs);
      target.decorate('asend', function(_, _, args) {
        asend.apply(null, args);
      });
    }
  }
});

MODEL({
  name: 'XhrMessenger',
  properties: [
    { model_: 'URLProperty', name: 'url' },
    { model_: 'StringProperty', name: 'method', defaultValue: "POST" }
  ],

  methods: {
    put: function(obj, sink) {
      var xhr = this.X.XHR.create();
      xhr.asend(function(response, xhr) {
        if ( xhr.status >= 200 && xhr.status < 300 ) {
          sink && sink.put && sink.put(response);
          return;
        }
        sink && sink.error && sink.error([response, xhr]);
      }, this.url, obj, this.method);
    }
  }
});
