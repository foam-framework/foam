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
  name: 'OAuth2RedirectJsonp',
  package: 'foam.oauth2',
  extends: 'foam.oauth2.OAuth2Redirect',
  methods: {
    setJsonpFuture: function(X, future) {
      var agent = this;
      future.set(function(url, params) {
        var tries = 0;
        params = params.clone();
        params.push('access_token=' + encodeURIComponent(agent.accessToken));
        return function(ret) {
          function callback(data)  {
            if ( data === null ) {
              tries++;
              if ( tries == 3 ) ret(null);
              else {
                agent.refresh(function(token) {
                  params[params.length - 1] = 'access_token=' +
                    encodeURIComponent(token);
                  ajsonp(url, params)(callback)
                });
              }
            } else {
              ret(data);
            }
          }
          ajsonp(url, params)(callback);
        }
      });
    }
  }
});
