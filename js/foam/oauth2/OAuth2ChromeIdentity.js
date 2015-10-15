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
  name: 'OAuth2ChromeIdentity',
  package: 'foam.oauth2',
  extends: 'foam.oauth2.OAuth2',
  help: 'OAuth2 strategy that uses the Chrome identity API',
  methods: {
    refreshNow_: function(ret) {
      var self = this;
      chrome.identity.getAuthToken({
        interactive: true
      }, function(token) {
        self.accessToken = token;
        ret(self.accessToken);
      });
    }
  }
});
