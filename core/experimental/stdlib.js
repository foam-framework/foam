/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

// Setup nodejs-like 'global' on web
var global = global || this;

// Top-Level of foam package
var foam = { array: {}, fn: {}, string: {}, util: {} };


foam.fn.memoize1 = function memoize1(f) {
  // Faster version of memoize() when only dealing with one argument.
  var cache = {};
  var g = function(arg) {
    console.assert(arguments.length == 1, "Memoize1'ed functions must take exactly one argument.");
    var key = arg ? arg.toString() : '';
    if ( ! cache.hasOwnProperty(key) ) cache[key] = f.call(this, arg);
    return cache[key];
  };
  foam.fn.setName(g, 'memoize1(' + f.name + ')');
  return g;
};


foam.fn.setName = function setName(f, name) {
  // Set a function's name for improved debugging and profiling
  Object.defineProperty(f, 'name', {value: name, configurable: true});
};


foam.string.constantize = foam.fn.memoize1(function(str) {
  // switchFromCamelCaseToConstantFormat to SWITCH_FROM_CAMEL_CASE_TO_CONSTANT_FORMAT
  return str.replace(/[a-z][^0-9a-z_]/g, function(a) {
    return a.substring(0,1) + '_' + a.substring(1,2);
  }).toUpperCase();
});


foam.string.rightPad = function(str, size) {
  return (str + new Array(size).join(' ')).substring(0, size);
};
