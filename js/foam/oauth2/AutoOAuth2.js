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
  name: 'AutoOAuth2',
  package: 'foam.oauth2',
  help: 'Registers an EasyOAuth2 model in the context based on the current environment.',

  imports: [
    'window',
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);

      var model;
      if ( this.window.cordova || this.window.PhoneGap || this.window.phonegap) {
        model = this.X.lookup('foam.oauth2.OAuth2ChromeIdentity');
      } else if ( window.chrome && window.chrome.runtime && window.chrome.runtime.id ) {
        model = this.X.lookup('foam.oauth2.OAuth2ChromeApp');
      } else {
        model = this.X.lookup('foam.oauth2.OAuth2Redirect');
      }
      this.X.registerModel(model, 'foam.oauth2.EasyOAuth2');
    }
  }
});
