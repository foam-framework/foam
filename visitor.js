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
var Visitor = {
  create: function() {
    return { __proto__: this, stack: [] };
  },

  push: function(o) { this.stack.push(o); },

  pop: function() { return this.stack.pop(); },

  top: function() {
    return this.stack.length && this.stack[this.stack.length - 1];
  },

  visit: function(o) {
    return (o instanceof Array) ? this.visitArray(o) :
           (typeof o === 'string') ? this.visitString(o) :
           (typeof o === 'number') ? this.visitNumber(o) :
           (o instanceof Function) ? this.visitFunction(o) :
           (o instanceof Date) ? this.visitDate(o) :
           (o === true) ? this.visitTrue() :
           (o === false) ? this.visitFalse() :
           (o === null) ? this.visitNull() :
           (o instanceof Object) ? (o.model_ ?
             this.visitObject(o) :
             this.visitMap(o)
           ) : this.visitUndefined();
  },

  visitArray: function(o) {
    var len = o.length;
    for (var i = 0; i < len; i++) this.visitArrayElement(o, i);
    return o;
  },
  visitArrayElement: function(arr, i) { this.visit(arr[i]); },

  visitString: function(o) { return o; },

  visitFunction: function(o) { return o; },

  visitNumber: function(o) { return o; },

  visitDate: function(o) { return o; },

  visitObject: function(o) {
    for (var key in o.model_.properties) {
      var prop = o.model_.properties[key];

      if (prop.name in o.instance_) {
        this.visitProperty(o, prop);
      }
    }
    return o;
  },
  visitProperty: function(o, prop) { this.visit(o[prop.name]); },

  visitMap: function(o) {
    for (var key in o) { this.visitMapElement(key, o[key]); }
    return o;
  },
  visitMapElement: function(key, value) { },

  visitTrue: function() { return true; },

  visitFalse: function() { return false; },

  visitNull: function() { return null; },

  visitUndefined: function() { return undefined; }

};
