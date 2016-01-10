/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

CLASS({
  name: 'FunctionWrapper',
  package: 'foam.ui.polymer.gen',

  properties: [
    {
      type: 'Array',
      name: 'impls',
      factory: function() { return []; }
    },
    {
      name: 'object',
      factory: function() { return window; }
    },
    {
      name: 'name',
      defaultValue: 'wrapper'
    },
    {
      name: 'ctx',
      defaultValue: null
    },
    {
      type: 'Function',
      name: 'fn',
      factory: function() {
        return function() {
          var rtn = undefined;
          for ( var i = 0; i < this.impls.length; ++i ) {
            if ( typeof this.impls[i] === 'function' ) {
              rtn = this.impls[i].apply(this.ctx || this, arguments);
            }
          }
          return rtn;
        }.bind(this);
      }
    },
    {
      name: 'property',
      factory: function() {
        return {
          configurable: true,
          enumerable: true,
          get: function() { return this.fn; }.bind(this),
          set: function(newValue) {
            this.impls.push(newValue);
          }.bind(this)
        };
      }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        var rtn = this.SUPER();
        this.bindToObject();
        return rtn;
      }
    },
    {
      name: 'bindToObject',
      code: function(opt_o, opt_n, opt_p) {
        if ( opt_o ) this.object = opt_o;
        if ( opt_n ) this.name = opt_n;
        if ( opt_p ) this.property = opt_p;
        var oldValue = this.object[this.name];
        Object.defineProperty(
            this.object,
            this.name,
            this.property);
        if ( typeof oldValue === 'function' ) this.object[this.name] = oldValue;
      }
    }
  ]
});
