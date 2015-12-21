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

  constants: {
    __isValue__: true
  },

  methods: [
    function init(value) { this.value = value || ''; },
    function get() { return this.value; },
    function set(val) { this.value = val; },
    function toString() { return 'SimpleValue(' + this.value + ')'; },
    function follow(srcValue) { Events.follow(srcValue, this); }
  ]
});


CLASS({
  name: 'FunctionValue',
  extends: 'SimpleValue',

  properties: [
    { name: 'values', factory: function() { return []; } },
    { name: 'valueFactory' }
  ],

  methods: [
    function init() {
      this.SUPER();

      // Call once before capture to pre-latch lazy values
      this.valueFactory();

      var f = this.valueFactory;
      this.startRecordingDependencies();
        this.value = f();
      this.endRecordingDependencies();

      for ( var i = 0 ; i < this.values.length ; i++ )
        this.values[i].addListener(this.onSubValueChange);
    },
    function destroy() {
      for ( var i = 0 ; i < this.values.length ; i++ )
        this.values[i].removeListener(this.onSubValueChange);
    },
    function startRecordingDependencies() {
      var values = this.values;
      var onSubValueChange = this.onSubValueChange;
      Events.onGet.push(function(obj, name, value) {
        var l = obj.propertyValue(name);
        if ( values.indexOf(l) == -1 ) {
          values.push(l);
          l.addListener(onSubValueChange);
        }
      });
    },
    function endRecordingDependencies() {
      Events.onGet.pop();
    },
    function get() { return this.value; },
    function set(val) { },
    function toString() { return 'FunctionValue(' + this.value + ')'; }
  ],

  listeners: [
    function onSubValueChange_() { this.value = this.valueFactory(); },
    {
      name: 'onSubValueChange',
      isFramed: true,
      code: function() { this.onSubValueChange_(); }
    }
  ]
});


CLASS({
  name: 'OrValue',
  extends: 'SimpleValue',

  properties: [
    { name: 'values' },
    { name: 'valueFactory', defaultValue: function() { return arguments; } }
  ],

  methods: [
    function init() {
      this.SUPER();
      for ( var i = 0 ; i < this.values.length ; i++ )
        this.values[i].addListener(this.onSubValueChange);
      this.onSubValueChange_();
    },
    function destroy() {
      for ( var i = 0 ; i < this.values.length ; i++ )
        this.values[i].removeListener(this.onSubValueChange);
    },
    function get() { return this.value; },
    function set(val) { },
    function toString() { return 'OrValue(' + this.value + ')'; }
  ],

  listeners: [
    function onSubValueChange_() {
      var args = new Array(this.values.length);
      for ( var i = 0 ; i < this.values.length ; i++ )
        args[i] = this.values[i].get();
      this.value = this.valueFactory.apply(this, args);
    },
    {
      name: 'onSubValueChange',
      isFramed: true,
      code: function() { this.onSubValueChange_(); }
    }
  ]
});

function or$(values, factory, opt_X) {
  return OrValue.create({
    values: values,
    valueFactory: factory,
  }, opt_X);
}


CLASS({
  name: 'SimpleReadOnlyValue',
  extends: 'SimpleValue',

  documentation: 'A simple value that can only be set during initialization.',

  properties: [
    {
      name: 'value',
      preSet: function(old, nu) {
        return ( typeof this.instance_.value == 'undefined' ) ? nu : old ;
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
    toString: function() { return 'SimpleReadOnlyValue(' + this.value + ')'; }
  }
});
