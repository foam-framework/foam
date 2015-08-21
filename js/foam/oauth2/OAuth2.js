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
  name: 'OAuth2',
  package: 'foam.oauth2',
  requires: [
    'XHR',
  ],
  label: 'OAuth 2.0',

  properties: [
    {
      name: 'accessToken',
      help: 'Token used to authenticate requests.'
    },
    {
      name: 'clientId',
      required: true,
      transient: true
    },
    {
      name: 'clientSecret',
      required: true,
      transient: true
    },
    {
      model_: 'StringArrayProperty',
      name: 'scopes',
      required: true,
      transient: true
    },
    {
      model_: 'URLProperty',
      name: 'endpoint',
      defaultValue: "https://accounts.google.com/o/oauth2/"
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.refresh_ = amerged(this.refreshNow_.bind(this));
    },

    refreshNow_: function(){},

    refresh: function(ret, opt_forceInteractive) {
      return this.refresh_(ret, opt_forceInteractive);
    },

    setJsonpFuture: function(X, future) {
      var agent = this;
      future.set((function() {
        var factory = agent.XHR.xbind({
          authAgent: agent,
          responseType: "json",
          retries: 3
        })

        return function(url, params, opt_method, opt_payload) {
          return function(ret) {
            var xhr = factory.create();
            xhr.asend(function(data, xhr) { ret(data, xhr.status); },
                      url + (params ? '?' + params.join('&') : ''),
                      opt_payload,
                      opt_method ? opt_method : "GET");
          };
        };
      })());
    }
  }
});
