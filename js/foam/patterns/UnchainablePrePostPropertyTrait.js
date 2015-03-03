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
  name: 'UnchainablePrePostPropertyTrait',
  package: 'foam.patterns',
  
  documentation: function() {/* Changes the default 'replacement' behaviour of
    preSet and postSet to set-once. Attempting to set a preSet or postSet more than
    once results in an assert.
  */},

  properties: [
    {
      name: 'preSet',
      documentation: function() { /*
        Allows you to modify the incoming value before it is set. Parameters <code>(old, nu)</code> are
        supplied with the old and new value. Return the value you want to be set. Inherited 
        preset functions are not allowed and will assert.
      */},
      preSet: function(oldPreFn, nuPreFn) {
        if ( ! oldPreFn ) return nuPreFn;
        console.assert(false, "Override of preSet not allowed: ", this.name_, this.name, oldPreFn, nuPreFn);        
      }
    },
    {
      name: 'postSet',
      documentation: function() { /*
        Allows you to react after the value of the $$DOC{ref:'Property'} has been set,
        but before property change event is fired.
        Parameters <code>(old, nu)</code> are supplied with the old and new value. 
        Inherited postset functions are not allowed and will assert.
      */},
      preSet: function(oldPostFn, nuPostFn) {
        if ( ! oldPostFn ) return nuPostFn;
        console.assert(false, "Override of postSet not allowed: ", this.name_, this.name, oldPostFn, nuPostFn);        
      }
    }
  ]
});
