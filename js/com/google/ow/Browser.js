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
  package: 'com.google.ow',
  name: 'Browser',
  extends: 'foam.browser.ui.BrowserView',
  requires: [
    'foam.u2.ElementParser',
    'foam.u2.md.SharedStyles as SharedStyles2',
    'foam.ui.md.SharedStyles',
  ],
  methods: [
    function init() {
      this.SUPER();
      this.ElementParser.create();
      this.SharedStyles2.create();
      this.SharedStyles.create();
    }
  ],

  properties: [
    {
      name: 'data',
      adapt: function(old,nu) {
        if (nu.browserConfig) return nu.browserConfig;
        return nu;
      }
    },
  ],

});
