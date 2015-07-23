/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

// TODO: standardize on either get()/set() or .value
CLASS({
  name: 'SimpleValue',

  properties: [ { name: 'value' } ],

  methods: {
    init: function(value) { this.value = value || ""; },
    get: function() { return this.value; },
    set: function(val) { this.value = val; },
    toString: function() { return "SimpleValue(" + this.value + ")"; }
  }
});

CLASS({
  name: 'SimpleReadOnlyValue',
  extendsModel: 'SimpleValue',

  documentation: "A simple value that can only be set during initialization.",
  
  properties: [
    { 
      name: 'value',
      preSet: function(old, nu) {
        if ( typeof this.instance_.value == 'undefined' ) {
          return nu;
        }
        return old;
      }
    } 
  ],
  
  methods: {
    set: function(val) {
      /* Only allow set once. The first initialized value is the only one. */
      if ( typeof this.instance_.value == 'undefined' ) {
        this.SUPER(val);
      }
    },
    toString: function() { return "SimpleReadOnlyValue(" + this.value + ")"; }
  }
});
