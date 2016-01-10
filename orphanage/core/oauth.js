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

var OAuthXhr = {
  create: function(xhr, responsetype, agent) {
    xhr.responseType = responsetype;
    return {
      __proto__: this,
      xhr: xhr,
      agent: agent
    };
  },

  set responseType(type) {
    this.xhr.responseType = type;
  },
  get responseType() {
    return this.xhr.responseType;
  },

  asend: function(ret, method, url, payload) {
    var self = this;
    var finished = false;
    var attempts = 0;
    awhile(
      function() { return !finished; },
      aseq(
        function(ret) {
          self.xhr.open(method, url);
          self.xhr.setRequestHeader('Authorization', 'Bearer ' + self.agent.accessToken);
          // TODO: This should be added by a decorator, or via a parameter.
          self.xhr.setRequestHeader("Content-Type", "application/json");
          self.xhr.asend(ret, payload);
        },
        function(ret) {
          if ( self.xhr.status == 401 ) {
            if (attempts >= 2) {
              finished = true;
              ret();
              return;
            }
            attempts++;
            self.agent.refresh(ret);
            return;
          }
          finished = true;
          ret(self.xhr.response, self.xhr.status);
        }))(ret);
  }
};

CLASS({
  name: 'OAuthXhrFactory',
  label: 'OAuthXhrFactory',

  properties: [
    {
      name: 'authAgent',
      type: 'AuthAgent',
      required: true
    },
    {
      type: 'String',
      name: 'responseType'
    }
  ],

  methods: {
    make: function() {
      return OAuthXhr.create(new XMLHttpRequest(), this.responseType, this.authAgent);
    }
  }
});

