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
      name: 'value'
    },
    {
      name: 'memento',
      getter: function() { return this; }
    }
  ],

  methods: {
    init: function(value) { this.value = value || ""; },
    get: function() { return this.value; },
    set: function(val) { this.value = val; },
    toString: function() { return "SimpleValue(" + this.value + ")"; }
  }
});

/*
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
*/

var MementoValue = Model.create({
  name: 'MementoValue',

  properties: [
    {
      name: 'Value',
      postSet: function(newValue, oldValue) {
        if ( oldValue ) oldValue.removeListener(this.onValueChange);
        this.memento = newValue && newValue.get().memento;
        if ( newValue ) newValue.addListener(this.onValueChange);
      }
    },
    {
      name: 'memento',
      postSet: function(newValue, oldValue) {
        if ( oldValue ) oldValue.removeListener(this.onMementoChange);
        this.value = newValue && newValue.get();
        if ( newValue ) newValue.addListener(this.onMementoChange);
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
        this.memento = newValue && newValue.memento;
      }
    },
    {
      name: 'onMementoChange',
      code: function(_, _, oldValue, newValue) {
        this.value = newValue;
      }
    }
  ],

  methods: {
    get: function() { return this.value; },
    set: function(val) { this.value = val; },
    toString: function() {
      return 'MementoValue(' + this.Value + ', ' + this.memento + ' = "' + this.value + '")';
    }
  }
});


var ValueValue = Model.create({
  name: 'ValueValue',

  properties: [
    {
      name: 'Value',
      postSet: function(newValue, oldValue) {
//        if ( newValue && newValue.get && newValue.get() && newValue.get().memento ) newValue = MementoValueValue.create({Value: newValue}); 
        if ( oldValue ) oldValue.removeListener(this.onChange1);
        this.subValue = newValue && newValue.get();
        if ( newValue ) newValue.addListener(this.onChange1);
      }
    },
    {
      name: 'subValue',
      postSet: function(newValue, oldValue) {
        if ( oldValue ) oldValue.removeListener(this.onChange2);
        this.value = newValue && newValue.get();
        if ( newValue ) newValue.addListener(this.onChange2);
      }
    },
    {
      name: 'value'
    }
  ],

  listeners: [
    {
      name: 'onChange1',
      code: function(_, _, oldValue, newValue) {
        this.subValue = newValue && newValue.get().memento;
      }
    },
    {
      name: 'onChange2',
      code: function(_, _, oldValue, newValue) {
        this.value = newValue && newValue.get();
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
        this.propertyChange('value', undefined, this.value);
      }
    }
  ],

  methods: {
    addValue: function(key, value) {
      if ( ! value ) debugger;
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
      var s = 'CompoundValue(';
      for ( var key in this.values ) 
        s += key + '=' + this.values[key] + ' '
      return s + ')';
    }
  }
});


