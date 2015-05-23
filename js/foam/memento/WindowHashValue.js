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
  package: 'foam.memento',
  name: 'WindowHashValue',

  imports: [
    'window'
  ],

  methods: {
    get: function() { return this.window.location.hash ? this.window.location.hash.substring(1) : ''; },

    set: function(value) {
      this.window.location.hash = value;
    },

    addListener: function(listener) {
      this.window.addEventListener('hashchange', listener, false);
    },

    removeListener: function(listener) {
      this.window.removeEventListener('hashchange', listener, false);
    },

    toString: function() { return "WindowHashValue(" + this.get() + ")"; }
  }
});
