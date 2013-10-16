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
var GLOBAL = GLOBAL || this;

var Context = {
    __proto__: GLOBAL,
    clone: function() {
	return { __proto__: this };
    }
};

var X = Context.clone();
var XXX = X;

function contextize(fn) {
  return (function (ctx) {
    return function() {
      var ret;
      var old = X;
      X = ctx;
      try {
         ret = fn.apply(this, arguments);
      } catch (x) {
         X = old;
      }
      return ret;
    };
  })(X);
}

var pushCtx;
var popCtx;

(function() {
  var stack = [];
  pushCtx = function() {
    stack.push(X);
    X = X.clone();
  };
  popCtx = function() {
    X = stack.pop();
  };
})();
