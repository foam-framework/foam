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
    function toString() { return 'SimpleValue(' + this.value + ')'; }
  ]
});

// TODO(kgr): Experimental. Remove in future if not used.
CLASS({
  name: 'OrValue',
  extendsModel: 'SimpleValue',

  properties: [
    { name: 'values' },
    { name: 'valueFactory', defaultValue: function() { return arguments; } }
  ],

  methods: {
    init: function() {
      this.SUPER();
      for ( var i = 0 ; i < this.values.length ; i++ )
        this.values[i].addListener(this.onSubValueChange);
      this.value = this.valueFactory();
    },
    get: function() { return this.value; },
    set: function(val) { },
    toString: function() { return 'OrValue(' + this.value + ')'; }
  },

  listeners: [
    {
      name: 'onSubValueChange',
      isFramed: true,
      code: function() {
        var args = new Array(this.values.length);
        for ( var i = 0 ; i < this.values.length ; i++ )
          args[i] = this.values[i].get();
        this.value = this.valueFactory.apply(this, args);
      }
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
  extendsModel: 'SimpleValue',

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
