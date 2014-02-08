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


/**
 * A ValueValue which makes in transparent if the Value's value is a Memento.
 **/
var MementoValue = Model.create({
  name: 'MementoValue',

  properties: [
    {
      name: 'Value',
      postSet: function(newValue, oldValue) {
        if ( this.ignore_ ) return;
        if ( oldValue ) oldValue.removeListener(this.onValueChange);
        var v = newValue && newValue.get();
        if ( v && v.memento ) {
          this.memento = v.memento;
        } else {
          this.value = v;
        }
        if ( newValue ) newValue.addListener(this.onValueChange);
      }
    },
    {
      name: 'memento',
      postSet: function(newValue, oldValue) {
        if ( this.ignore_ ) return;
        if ( oldValue ) oldValue.removeListener(this.onMementoChange);
        this.value = newValue && newValue.get();
        if ( newValue ) newValue.addListener(this.onMementoChange);
      }
    },
    {
      name: 'value',
      postSet: function(newValue) {
        this.ignore_ = true;
        if ( this.memento ) {
          this.memento.set(newValue);
        } else {
          this.Value.set(newValue);
        }
        this.ignore_ = false;
      }
    }
  ],

  listeners: [
    {
      name: 'onValueChange',
      code: function(_, _, oldValue, newValue) {
        if ( this.ignore_ ) return;
console.log('MementoValue.onValueChange', arguments);
        if ( newValue && newValue.memento ) {
          this.memento = newValue.memento;
        } else {
          this.value = newValue;
        }
      }
    },
    {
      name: 'onMementoChange',
      code: function(_, _, oldValue, newValue) {
        if ( this.ignore_ ) return;
        console.log('MementoValue.onMementoChange', newValue, arguments);
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


/**
 * A Value whose value is a Value but whose value appears to be that Value's value.
 */
var ValueValue = Model.create({
  name: 'ValueValue',

  properties: [
    {
      name: 'Value',
      postSet: function(newValue, oldValue) {
        if ( oldValue ) oldValue.removeListener(this.onValueChange);
        this.subValue = newValue && newValue.get();
        if ( newValue ) newValue.addListener(this.onValueChange);
      }
    },
    {
      name: 'subValue',
      postSet: function(newValue, oldValue) {
        if ( oldValue ) oldValue.removeListener(this.onSubValueChange);
        this.value = newValue && newValue.get();
        if ( newValue ) newValue.addListener(this.onSubValueChange);
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
console.log('ValueValue.onValueChange', arguments);
        this.subValue = newValue;
      }
    },
    {
      name: 'onSubValueChange',
      code: function(_, _, oldValue, newValue) {
console.log('ValueValue.onSubValueChange', arguments);
        this.value = newValue;
      }
    }
  ],

  methods: {
    get: function() { return this.value; },
    set: function(val) { this.value = val; },
    toString: function() {
      return 'ValueValue(' + this.Value + ', ' + this.subValue + ' = "' + this.value + '")';
    }
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
      setter: function(map) {
console.log('CompoundValue.set()');
        for ( var key in map ) {
          this.values[key].set(map[key]);
        }
        var oldValue = this.instance_.value;
        this.instance_.value = map;
        this.propertyChange('value', oldValue, map);
      },
      getter: function() {
        if ( ! this.instance_.value ) {
          var m = {};
          for ( var key in this.values ) {
            var v = this.values[key].get();
            if ( v ) m[key] = v;
          }
          this.instance_.value = m;
        }
        return this.instance_.value;
      }
//      valueFactory: function() { return {}; }
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
    set: function(val) { this.value = val; },
    toString: function() {
      var s = 'CompoundValue(';
      for ( var key in this.values )
        s += key + '=' + this.values[key] + ' '
      return s + ')';
    }
  }
});


