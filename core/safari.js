/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

if (navigator && navigator.userAgent.indexOf('AppleWebKit') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
  console.log('Loading Safari Support.');

  (function(){
    // prepare base perf object
    if (typeof window.performance === 'undefined') {
        window.performance = {};
    }

    if (!window.performance.now){

      var nowOffset = Date.now();

      if (performance.timing && performance.timing.navigationStart){
        nowOffset = performance.timing.navigationStart
      }

      window.performance.now = function now(){
        return Date.now() - nowOffset;
      }
    }
  })();

  // Number.isFinite polyfill
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isfinite
  if (typeof Number.isFinite !== 'function') {
    Number.isFinite = function isFinite(value) {
      // 1. If Type(number) is not Number, return false.
      if (typeof value !== 'number') {
        return false;
      }
      // 2. If number is NaN, +∞, or −∞, return false.
      if (value !== value || value === Infinity || value === -Infinity) {
        return false;
      }
      // 3. Otherwise, return true.
      return true;
    };
  }

  if ( typeof Number.isNaN !== 'function' ) {
    Number.isNaN = function(value) {
      return typeof value === "number" && value !== value;
    };
  }

  if ( typeof Number.isInteger !== 'function' ) {
    Number.isInteger = function(value) {
      return (typeof value === 'number' &&
          Math.round(value) === value);
    };
  }
}
