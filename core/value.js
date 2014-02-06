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

  properties: [
    {
      name: 'value',
      memorable: true
    },
    {
      name: 'memento2',
      getter: function() {
        return this.value && this.value.get ? this.value : this;
      }
    }
  ],

  methods: {
    init: function(value) { this.value = value || ""; },
    get: function() { return this.value; },
    set: function(val) { this.value = val; },
    toString: function() { return "SimpleValue(" + this.value + ")"; }
  }
});


var ValueValue = Model.create({
  name: 'ValueValue',

  properties: [
    {
      name: 'Value',
      postSet: function(newValue, oldValue) {
        if ( oldValue ) oldValue.removeListener(this.onValueChange);
        newValue.addListener(this.onValueChange);
//        this.value = newValue.get();
      }
    },
    {
      name: 'value'
    }
  ],

  listeners: [
    {
      name: 'onValueChange',
      code: function(_, _, oldValue, newValue) {
console.log('ValueValueChange: ', oldValue, newValue);
//        this.value = newValue.get();
      }
    }
  ],

  methods: {
    get: function() { return this.value; },
    set: function(val) { this.value = val; },
    toString: function() { return "ValueValue(" + this.value + ")"; }
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
      code: function(key, newValue) {
        console.log('subChange: ', key, newValue);
        this.value[key] = this.values[key].get();

//        if ( this.value[key].addListener ) this.value[key].addListener(this.onSubValueChange.bind(this, key));
//        if ( newValue.addListener ) newValue.addListener(this.onSubValueChange.bind(this, key));

        this.propertyChange('value', undefined, this.value);
      }
    }
  ],

  methods: {
    addValue: function(key, value) {
      if ( ! value ) debugger;
//      value = ( value.get && value.get().get ) ? value.get() : value;
      this.values[key] = value;
      this.value[key] = value.get();
      value.addListener(this.onSubValueChange.bind(this, key));
    },
    get: function() { return this.value; },
    set: function(map) {
      for ( var key in map ) {
        this.values[key].set(map[key]);
      }
    },
    toString: function() {
      return "CompoundValue(" + this.value + ")";
    }
  }
});


