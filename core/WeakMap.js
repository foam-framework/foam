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

// WeakMap Polyfill, doesn't implement the full interface, just the parts that we use
// TODO: Use defineProperty to make hidden property
if ( ! window.WeakMap ) {
  function WeakMap() {
    var id = '__WEAK_MAP__' + this.$UID;

    function del(key) { delete key[id]; }
    function get(key) { return key[id]; }
    function set(key, value) { key[id] = value; }
    function has(key) { return !!key[id]; }

    return {
      __proto__: this,
      "delete": del,
      get: get,
      set: set,
      has: has
    };
  }
}
