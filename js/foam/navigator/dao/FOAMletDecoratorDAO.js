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
  name: 'FOAMletDecoratorDAO',
  package: 'foam.navigator.dao',
  extends: 'foam.core.dao.AbstractAdapterDAO',

  requires: [
    'foam.navigator.WrappedFOAMlet'
  ],

  properties: [
    {
      name: 'model',
      type: 'Model',
      documentation: function() {/* If a valid WrappedFOAMlet is not specified
        here, model-for-model will attempt to load the closest it can find.
      */},  
    }
  ],   
  
  methods: {
    bToA: function(obj) { 
      if ( this.model ) {
        return this.model.create({ data: obj });
      } else {
        // try model-for-model if none was specified
        return this.WrappedFOAMlet.create({ model: obj.model_, data: obj });
      }
    },
    aToB: function(obj) {
      return obj.data;
    },
    adaptOptions_: function(opts) { return opts; }
  }

});
