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

var SimpleValue = Model.create({
  name: 'SimpleValue',

  properties: [ { name: 'value' } ],

  methods: {
    init: function(value) { this.value = value || ""; },
    get: function() { return this.value; },
    set: function(val) { this.value = val; },
    toString: function() { return "SimpleValue(" + this.value + ")"; }
  }
});


var CompoundValue = Model.create({
  name: 'CompoundValue',

  properties: [
    {
      name: 'values',
      valueFactory: function() { return {}; }
    },
    {
      name: 'value',
      valueFactory: function() { return {}; }
    }
  ],

  listeners: [
    {
      name: 'onSubValueChange',
      code: function() {
        debugger;
      }
    }
  ],

  methods: {
    addValue: function(key, value) {
      this.values[key] = value;
      this.value[key] = value.get();
      value.addListener(this.onSubValueChange);
    },
    get: function() { return this.value; },
    set: function(val) {
      for ( var key in val ) {
        var value = this.values[key];

        if ( value ) value.set(val[key]);
      }
    },
    toString: function() { return "CompoundValue(" + this.value + ")"; }
  }
});


