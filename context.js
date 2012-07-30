/*
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

var GLOBAL = this;

var Context = {
    clone: function() {
	return { __proto__: this };
    }
};

// Define extensions to built-in prototypes as non-enumerable properties so
// that they don't mess up with Array or Object iteration code.
// (Which needs to be fixed anyway.)

// TODO: move this somewhere better

/**
 * Search for a single element in an array.
 * @param predicate used to determine element to find
 * @param action to be called with (key, index) arguments
 *        when found
 */
Object.defineProperty(Array.prototype, 'find', {
  value: function(predicate, action) {
  for (var i=0; i<this.length; i++)
    if (predicate(this[i], i)) {
      return action(this[i], i) || this[i];
    }
  return undefined;
}});


/** Remove an element from an array. **/
Object.defineProperty(Array.prototype, 'remove', {
  value: function(obj) {
    var i = this.indexOf(obj);

    if ( i != -1 ) this.splice(i, 1);

    return this;
}});


/**
 * ForEach operator on Objects.
 * Calls function with arguments (obj, key).
 **/
Object.defineProperty(Object.prototype, 'forEach', {
  value: function(fn) {
    for ( var key in this ) if (this.hasOwnProperty(key)) fn(this[key], key);
}});


function randomAct()
{
  var totalWeight = 0.0;
  for ( var i = 0 ; i < arguments.length ; i += 2 ) totalWeight += arguments[i];

  var r = Math.random();

  for ( var i = 0, weight = 0 ; i < arguments.length ; i += 2 ) {
    weight += arguments[i];
    if ( r <= weight / totalWeight ) {
      arguments[i+1]();
      return;
    }
  }
}


