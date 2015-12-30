/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

CLASS({
  package: 'foam.net',
  name: 'NodeHTTPRequest',
  extends: 'foam.net.BaseHTTPRequest',
  requires: [
    'foam.net.NodeHTTPResponse'
  ],
  properties: [
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'http'
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'https'
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'nodeUrl',
      moduleName: 'url'
    }
  ],
  methods: [
    function fromUrl(url) {
      var parsed = this.nodeUrl.parse(url);

      this.protocol = parsed.protocol.substring(0, parsed.protocol.length-1);
      this.hostname = parsed.hostname;
      this.port = parsed.port;
      this.path = parsed.path;
      return this;
    },
    function setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    function asend(opt_responseConfig) {
      if ( this.url ) {
        this.fromUrl(this.url);
      }

      var http = this.protocol === "http" ? this.http : this.https;

      var options = {
        hostname: this.hostname,
        method: this.method || "GET",
        path: this.path,
        headers: this.headers,
      };

      var self = this;

      var future = afuture();

      var response = this.NodeHTTPResponse.create(opt_responseConfig);
      var req = http.request(options, function(res) {
        var status = res.statusCode;
        var headers = res.headers;
        response.status = status;
        response.headers = headers;

        res.on('data', function(d) {
          response.onData(d);
        })
        res.on('end', function() {
          response.end();
          future.set(response);
        });
      });
      if ( this.payload ) {
        req.end(this.payload);
      } else {
        req.end();
      }

      req.on('error', function(error) {
        var response = self.NodeHTTPResponse.create();
        response.error = error;
        future.set(response);
      });

      return future.get;
    }
  ]
});
