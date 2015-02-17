/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'ChainedPrePostPropertyTrait',
  package: 'foam.patterns',
  
  documentation: function() {/* Changes the default 'replacement' behaviour of
    preSet and postSet to chaining. Presets are called in most-derived to base
    order, and postSets are called base to most-derived.
  */},
  
  properties: [
    {
      name: 'preSet',
      documentation: function() { /*
        Allows you to modify the incoming value before it is set. Parameters <code>(old, nu)</code> are
        supplied with the old and new value. Return the value you want to be set. Inherited 
        preset functions are executed in order from the most-derived up to the base.
      */},
      preSet: function(oldPreFn, nuPreFn) {
        /* Yes, this is meta. */
        if ( ! oldPreFn ) return nuPreFn;
        console.log("Chaining preSet: ", this.name_, this.name); 
        console.log("Old: ", oldPreFn);
        console.log("New: ", nuPreFn);
        return function(old, nu, prop) {
          return oldPreFn.call(this, old, nuPreFn.call(this, old, nu, prop), prop);
        };
      }
    },
    {
      name: 'postSet',
      documentation: function() { /*
        Allows you to react after the value of the $$DOC{ref:'Property'} has been set,
        but before property change event is fired.
        Parameters <code>(old, nu)</code> are supplied with the old and new value. 
        Inherited postset functions are executed from base-implementation first down to 
        most-derived. The parameters passed are the original change, regardless of
        any tampering the functions do to the property value.
      */},
      preSet: function(oldPostFn, nuPostFn) {
        /* Yes, this is meta. */
        if ( ! oldPostFn ) return nuPostFn;
        console.log("Chaining postSet: ", this.name_, this.name); 
        console.log("Old: ", oldPostFn);
        console.log("New: ", nuPostFn);
        return function(old, nu, prop) {
          oldPostFn.call(this, old, nu, prop);
          nuPostFn.call(this, old, nu, prop);
        };
      }
    }
  ]
});
