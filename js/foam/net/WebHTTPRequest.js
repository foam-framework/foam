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
  name: 'WebHTTPRequest',
  extends: 'foam.net.BaseHTTPRequest',
  requires: [
    'foam.net.HTTPResponse'
  ],
  methods: [
    function fromUrl(url) {
      var u = new URL(url);
      this.protocol = u.protocol.substring(0, u.protocol.length-1);
      this.hostname = u.hostname;
      if ( u.port ) this.port = u.port;
      this.path = u.pathname + u.search;
    },
    function asend() {
      if ( this.url ) this.fromUrl(this.url);

      var fut = afuture();

      var xhr = new XMLHttpRequest();
      xhr.open(this.method || "GET", this.protocol + "://" + this.hostname +
               ( this.port ? (':' + this.port) : '' ) + this.path);

      var self = this;
      xhr.addEventListener('readystatechange', function() {
        if ( this.readyState == this.DONE ) {
          var response = self.HTTPResponse.create({
            status: this.status,
            payload: this.response
          });
          fut.set(response);
        }
      });
      xhr.send(this.payload);

      return fut.get;
    }
  ]
});
