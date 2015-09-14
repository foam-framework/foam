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
  package: 'foam.tools',
  name: 'FOAMInChrome',
  requires: [
    'XHR',
    'foam.oauth2.AutoOAuth2'
  ],
  exports: [
    'authAgent'
  ],
  properties: [
    {
      name: 'authAgent',
      factory: function() {
        var X = this.AutoOAuth2.create().Y;
        return X.lookup('foam.oauth2.EasyOAuth2').create({
          scopes: [
            'https://www.googleapis.com/auth/drive.file'
          ],
          clientId: '982012106580-juaqtmvoue69plra0v6dlqv4ttbggqi3.apps.googleusercontent.com',
          clientSecret: '-uciG4ePPT5DXFccHn4kNHWq'
        }, X);
      }
    }
  ],
  methods: [
    function init() {
      this.Y.registerModel(this.XHR.xbind({
        authAgent: this.authAgent
      }));
      window.foaminchrome = this;
    },
    function execute() {
      var X = this.Y;
      chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('main.html', {}, function(w) {
          w.contentWindow.addEventListener(
            'load', function() {
              DOM.init(X.subWindow(w.contentWindow));
            });
	});
      });
    }
  ]
});
